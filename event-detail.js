import React, { Component } from 'react';
import { View, Alert, Dimensions, ScrollView, TouchableHighlight, StyleSheet } from 'react-native';
import { FormLabel, 
         FormInput, 
         Button, 
         FormValidationMessage, 
         Tooltip, 
         Text } from 'react-native-elements';
import { MapView, ImagePicker, Permissions, Location, Font } from 'expo';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation'
import { firebaseConnect, populate } from 'react-redux-firebase';
import * as firebase from 'firebase';

const populates = [{ //child of root to query from firebase db
    child: 'user_id', root: 'profiles'   
}]

// Using a local version here because we need it to import MapView from 'expo'
import MapViewDirections from './MapViewDirections';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 37.771707;
const LONGITUDE = -122.4053769;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GOOGLE_MAPS_APIKEY = 'AIzaSyAL9CktenxoNTKLPlUdQ_KkrkaMYpBUe9E';

//decorators that connect firebase db and assigns props for class
@firebaseConnect([   // query for firebase db on connect
    { path: '/posts', queryParams: ['orderByChild=created_at', 'limitToLast=5'], populates}  
])
@connect(  
   ({ firebase}) => ({
       auth: firebase.auth,  // auth passed as props.auth
       profile: firebase.profile, // profile passed as props.profile
       posts: populate(firebase, 'posts', populates), //all posts from fb db
       
   })
 )
export default class EventDetailScreen extends Component {
        constructor(props) {
		super(props);
       
        this.mapView = null;
    }
    state = { 
        database: firebase.database(),
        name: 'Race for life!',  //name of the event
        nameValidation: true, //input validation for name
        startLocation: 'Ira Allen Building, Boston, MA', //address of event
        startValidation: true, //input validation for address
        finishLocation: 'Mission Hill, Boston, MA', //address of event
        finishValidation: true, //input validation for address
        hasLocationPermission: null, //permissions for location usage
        startDate: this._getTodaysDate(), //input date
        dateValidation: true,//input date validation
        startTime: this._parsedDate(new Date()), //input time
        timeValidation: true,//input time validation
        fontLoaded: false,
        coordinates: [
            {
                latitude: 42.3361,
                longitude: -71.0954,
            },
            {
                latitude: 42.3296,
                longitude: -71.1062,
            },
        ]
    }
    onMapPress = (e) => {
		if (this.state.coordinates.length == 2) {
			this.setState({
				coordinates: [
					e.nativeEvent.coordinate,
				],
            });
            this._updatePoint2();
		} else {
			this.setState({
				coordinates: [
					...this.state.coordinates,
					e.nativeEvent.coordinate,
				],
            });
           this._updatePoint1();
		}
	}

	onReady = (result) => {
		this.mapView.fitToCoordinates(result.coordinates, {
			edgePadding: {
				right: (width / 20),
				bottom: (height / 20),
				left: (width / 20),
				top: (height / 20),
			}
		});
	}

	onError = (errorMessage) => {
		Alert.alert(errorMessage);
    }

    async _updatePoint1(){
        let c = ', ';
        let postal = await Location.reverseGeocodeAsync({
            latitude: this.state.coordinates[0].latitude, longitude: this.state.coordinates[0].longitude})
            this.state.startLocation = postal[0].street + c + 
                                       postal[0].city + c + 
                                       postal[0].region + c + 
                                       postal[0].postalCode
            console.log(JSON.stringify(postal))
        }
        
    async _updatePoint2(){
            let c = ', ';
            let postal2 = await Location.reverseGeocodeAsync({
                latitude: this.state.coordinates[1].latitude, longitude: this.state.coordinates[1].longitude})
                this.state.finishLocation = postal2[0].street + c + 
                                         postal2[0].city + c + 
                                         postal2[0].region + c + 
                                         postal2[0].postalCode
            console.log(JSON.stringify(postal2))

    }

    //navigation not used maybe implement later
    static navigationOptions = ({ navigation }) => ({  
        title: 'Add Challenge Details'
    });

    async componentWillMount() {
        const { geostatus } = await Permissions.askAsync(Permissions.LOCATION)
        //set state for location permissions
        this.setState({ hasLocationPermission: geostatus === 'granted' })
      }

    async componentDidMount() {
        await Font.loadAsync({
            'Bauhaus93': require('./assets/fonts/Bauhaus-93_6274.ttf'),
          });
      
        this.setState({ fontLoaded: true });
        //bind functions to navigation params
        this.props.navigation.setParams({ 
            getCurrentPosition: this._getLocationAsync.bind(this)
        });
    }
    

    //updates the mapview location after user inputs postal address returns
    //lat/long and delta's for zoom
    async _updateMapView(address) {
        if(!address){
            this.setState({addressValidation: false});
            return;
        }
        console.log(JSON.stringify(location))
        if(location !== undefined){
            //assign lat/long and delta to object that will replace region state
            //because state is nested we have to create an object to update this.state.region parameters
            var region = {
                latitude: location[0].latitude,
                longitude: location[0].longitude,
                latitudeDelta: 0.0052720501213840976,
                longitudeDelta: 0.008883477549531449
            }
            //sets the region updates lat/long from postal code and renders map location
            this.setState({region});
        }
    }
      //show's coordinates of the region selected by user real-time
      onRegionChange(region) {  
        console.log(region);
      }
     //lastly get's location and posts to firebase db.
    _getLocationAsync = async () => {        
        //retrieves user's location
        //let location = await Location.getCurrentPositionAsync({});  
        //gets postal location of lat/long and retrieves user's postal address
        //let postal = await Location.reverseGeocodeAsync({
         //   latitude: location.coords.latitude, longitude: location.coords.longitude}) 
        //console.log("postal: " + JSON.stringify(postal)) 
        // post to firebase db with push
        this.props.firebase.push('/posts', { 
            user_id: this.props.auth.uid,  // user_uid
            event_name: this.state.name, //event name
            start_date: this.state.startDate, //event start date
            start_time: this.state.startTime, //even start time
            start_location: this.state.startLocation, //event address
            finish_location: this.state.finishLocation, // event map region
            origin: this.state.coordinates[0],//start coordinates
            destination: this.state.coordinates[1],//destination coordinates
            created_at: (new Date()).getTime(),  //date created
            //location: `${postal[0].city}`+', '+`${postal[0].region}`,  //object city, state
        })
        //updates the post count
        .then(this._updatePostCount(this.state.name))
        //alerts user of new event creation
        .then(Alert.alert("Congratulations!,\n"+ this.props.profile.username +"\n"+
                          "You just created the event " + this.state.name +"!"))
        //sends user back to timeline screen
        .then(this.props.navigation.dispatch(StackActions.reset({
                index:0,
                actions: [NavigationActions.navigate({ routeName: 'Timeline'})]
        })));
    };

//updates the count of post on firebase db
_updatePostCount(eventName) {
    let updates = {};
    let posts = this.props.profile.posts || [];
    posts.push(eventName);
    updates['/profiles/' + this.props.auth.uid + '/posts'] = posts;
    this.state.database.ref().update(updates);
}

//parse current time in 12:00 AM/PM format
_parseTime(time) {  //parse time for event
    let semi = ':';
    let space = ' ';
    let nTime = time.split(':')
    let hour = nTime[0];
    let min = nTime [1];
    if ( hour > 12){
        let tod = 'PM';
        hour = hour - 12;
        let parsedTime = hour+semi+min+space+tod;
        return parsedTime;

    }else{
        let tod = 'AM';
        let parsedTime = hour+semi+min+space+tod;
        return parsedTime;

    }        
}
//parse date and returns current time
_parsedDate(date) {  //parse date for events
    let ndate = date.toString().split(' ');
    let time = this._parseTime(ndate[4]);
    return time.toString();
}
//gets todays date
_getTodaysDate() {
    var today = new Date();
    var date =  parseInt(today.getMonth()+1).toString() +'/'+ today.getDate().toString() +'/'+ today.getFullYear().toString().slice(2,4);
    return date; 
}

render() {
    
    return (
        <ScrollView>
        <View style={{
        flex: 1,
        backgroundColor: '#3399cc'
        }}>
            
            {
                this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                        <FormLabel labelStyle={{fontFamily: 'Bauhaus93', color: 'black', fontSize: 24}}> Give your event a name: </FormLabel>
                    </TouchableHighlight>
                ) : <FormLabel>Give your event a name: </FormLabel>
            }
            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
            <FormInput
                inputStyle={{color: 'black'}}
                containerStyle={{borderRadius: 25, backgroundColor: 'white', width: Dimensions.get('window').width* .75}}
                ref={(input) => { this.firstTextInput = input; }}
                textInputRef='eventField'
                onChangeText={(value) => this.setState({ name: value})}
                value={this.state.name}
                autoCapitalize='words'
                autoFocus={true}
                onSubmitEditing={() => { this.secondTextInput.focus(); }}
                returnKeyType='next'
                />
            </TouchableHighlight>

            <FormValidationMessage>
            {this.state.nameValidation ? null : 'This field is required'}
            </FormValidationMessage>
            
            {
                this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                        <FormLabel labelStyle={{fontFamily: 'Bauhaus93', color: 'black', fontSize: 24}}> When will it be? </FormLabel>
                    </TouchableHighlight>
                ) : <FormLabel>When will it be? </FormLabel>
            }   

            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
            <FormInput
            inputStyle={{color: 'black'}}
            containerStyle={{borderRadius: 25, backgroundColor: 'white', width: Dimensions.get('window').width* .75}}
            ref={(input) => { this.secondTextInput = input; }}
            multiline
            maxLength={8} 
            onChangeText={(text) => this.setState({startDate: text})}
            value={this.state.startDate}
            onSubmitEditing={() => { this.thirdTextInput.focus(); }}
            />
            </TouchableHighlight>
            
            <FormValidationMessage>
            {this.state.dateValidation ? null : 'This field is required'}
            </FormValidationMessage>

            
            {
                this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                        <FormLabel labelStyle={{fontFamily: 'Bauhaus93', color: 'black', fontSize: 24}}> What time will it start? </FormLabel>
                    </TouchableHighlight>
                ) : <FormLabel>Start Time: </FormLabel>
            }
            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
            <FormInput 
            inputStyle={{color: 'black'}}
            containerStyle={{borderRadius: 25, backgroundColor: 'white', width: Dimensions.get('window').width* .75}}
            ref={(input) => { this.thirdTextInput = input; }}
            multiline 
            maxLength={8}
            onChangeText={(text) => this.setState({startTime: text})}
            value={this.state.startTime}
            onSubmitEditing={() => { this.fourthTextInput.focus(); }}
            />
            </TouchableHighlight>

            <FormValidationMessage>
            {this.state.timeValidation ? null : 'This field is required'}
            </FormValidationMessage>

            {
                this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                        <FormLabel labelStyle={{fontFamily: 'Bauhaus93', color: 'black', fontSize: 24}}> Starting Location? </FormLabel>
                    </TouchableHighlight>
                ) : <FormLabel>Starting Location? </FormLabel>
            }
            
            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
            <FormInput
                inputStyle={{color: 'black'}}
                containerStyle={{borderRadius: 25, backgroundColor: 'white', width: Dimensions.get('window').width* .75}}
                textInputRef='addressField'
                ref={(input) => { this.fourthTextInput = input; }}
                onChangeText={(text) => this.setState({ startLocation: text })}
                value={this.state.startLocation}
                autoCapitalize='words'
//                onSubmitEditing={()=> this._updateMapView(this.state.startLocation).then(this.firstTextInput.focus())}
                returnKeyType='send'
                />
            </TouchableHighlight>

            <FormValidationMessage>
            {this.state.startLocation ? null : 'This field is required'}
            </FormValidationMessage>

            {
                this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                        <FormLabel labelStyle={{fontFamily: 'Bauhaus93', color: 'black', fontSize: 24}}> Finish Line? </FormLabel>
                    </TouchableHighlight>
                ) : <FormLabel>Finish Line? </FormLabel>
            }
            
            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
            <FormInput
                inputStyle={{color: 'black'}}
                containerStyle={{borderRadius: 25, backgroundColor: 'white', width: Dimensions.get('window').width* .75}}
                textInputRef='addressField'
                ref={(input) => { this.fourthTextInput = input; }}
                onChangeText={(text) => this.setState({ finishLocation: text })}
                value={this.state.finishLocation}
                autoCapitalize='words'
  //              onSubmitEditing={()=> this._updateMapView(this.state.finishLocation).then(this.firstTextInput.focus())}
                returnKeyType='send'
                />
            </TouchableHighlight>

            <FormValidationMessage>
            {this.state.finishLocation ? null : 'This field is required'}
            </FormValidationMessage>
            
            <MapView
  				initialRegion={{
  					latitude: LATITUDE,
  					longitude: LONGITUDE,
  					latitudeDelta: LATITUDE_DELTA,
  					longitudeDelta: LONGITUDE_DELTA,
  				}}
                style={{ height: 300, width: Dimensions.get('window').width, borderRadius: 25 }}

  				ref={c => this.mapView = c} // eslint-disable-line react/jsx-no-bind
  				onPress={this.onMapPress}
  				loadingEnabled={true}
  			>
  				{this.state.coordinates.map((coordinate, index) =>
  					<MapView.Marker key={`coordinate_${index}`} coordinate={coordinate} /> // eslint-disable-line react/no-array-index-key
  				)}
  				{(this.state.coordinates.length === 2) && (
  					<MapViewDirections
                        origin={this.state.coordinates[0]}
  						destination={this.state.coordinates[1]}
  						apikey={GOOGLE_MAPS_APIKEY}
  						strokeWidth={3}
  						strokeColor="hotpink"
  						onReady={this.onReady}
  						onError={this.onError}
  					/>
  				)}
  			</MapView>
            {
                this.state.fontLoaded ? (<Button
                onPress={() => this._performPost()}
                textStyle={{fontFamily: 'Bauhaus93', fontSize: 24}}
                title={"Post Event"}
                style={{marginTop: 25}}
                backgroundColor='#79B345'
                />) : <Button
                onPress={() => this._performPost()}
                title={"Post Event"}
                style={{marginTop: 25}}
                backgroundColor='#79B345'
                />            
            }
                             
            {/*
        <MapView
            style={{ height: 300, width: Dimensions.get('window').width, borderRadius: 25 }}
            region={this.state.region}
            onRegionChange={this.onRegionChange}
        >
            <MapView.Marker
            title={this.state.name}
            description={this.state.eventDescription}
            coordinate={{latitude: this.state.region.latitude, longitude: this.state.region.longitude}}
            />
        </MapView>
            
        */}
    
        </View>
        </ScrollView>
    );
}
/*Allows user to upload photo for event or Post if user has already
uploaded a photo*/
_performPost() {
   
        //do post if all fields are empty show validation error
        if(!this.state.name && !this.state.startLocation && !this.state.finishLocation &&
           !this.state.startDate && !this.state.startTime){
            this.setState({nameValidation: false})
            this.setState({eventValidation: false})
            this.setState({startValidation: false})
            this.setState({dateValidation: false})
            this.setState({timeValidation: false})
            this.setState({finishValidation: false})
            return;
        }else if(!this.state.name){
            //if event name is empty show validation error for only name
            this.setState({nameValidation: false})
            return;
        }else if(!this.state.startLocation){
            //if address is empty show validation error for this only
            this.setState({startValidation: false})
            return;
        }else if (!this.state.startDate){
            //if date is empty show validation error for this only
            this.setState({dateValidation: false})
            return;
        }else if (!this.state.startTime){
            //if time is empty show validation error for this only
            this.setState({startValidation: false})
            return;
        }else if (!this.state.finishLocation){
            //if time is empty show validation error for this only
            this.setState({finishValidation: false})
            return;
        }
        //call async function getCurrentPosition() to get location 
        this.props.navigation.state.params.getCurrentPosition();
        
    }
    




}

