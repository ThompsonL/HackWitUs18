import React, { Component } from 'react';
import { View, Alert, Dimensions, ScrollView } from 'react-native';
import { FormLabel, FormInput, Button, FormValidationMessage, Tooltip, Text } from 'react-native-elements';
import { MapView, ImagePicker, Permissions, Location } from 'expo';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation'
import { firebaseConnect, populate } from 'react-redux-firebase';
import * as firebase from 'firebase';

const populates = [{ //child of root to query from firebase db
    child: 'user_id', root: 'profiles'   
}]

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
    
        state = { 
            database: firebase.database(),
            photoAdded: false,  //photo not added button shows add photo
            name: 'Best Event',  //name of the event
            nameValidation: true, //input validation for name
            address: '199 Collinwood Dr Raeford NC 28376', //address of event
            addressValidation: true, //input validation for address
            eventDescription: 'Food run meet outside...', //event description 
            eventValidation: true, //input validation for event description
            hasCameraPermission: null, // permission for camera usage
            hasLocationPermission: null, //permissions for location usage
            startDate: this._getTodaysDate(), //input date
            dateValidation: true,//input date validation
            startTime: this._parsedDate(new Date()), //input time
            timeValidation: true,//input time validation
            creditHours: '1',//input credit hours
            creditValidation: true,//input credit validation
            image: null,  //image uri path
            region: {  // initial location of MapView and Marker
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0052720501213840976,  //zoom level
                longitudeDelta: 0.008883477549531449  //zoom level
            },
        }
        

    //navigation not used maybe implement later
    static navigationOptions = ({ navigation }) => ({  
        title: 'Add Event Details'
    });

    async componentWillMount() {
        //ask permission for camera use
        const { camstatus } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL)
        //set state for camera permissions
        this.setState({ hasCameraPermission: camstatus === 'granted' })
        //ask permission for location
        const { geostatus } = await Permissions.askAsync(Permissions.LOCATION)
        //set state for location permissions
        this.setState({ hasLocationPermission: geostatus === 'granted' })
      }

    componentDidMount() {
        //bind functions to navigation params
        this.props.navigation.setParams({ 
            showImagePicker: this._pickImage.bind(this),
            getCurrentPosition: this._getLocationAsync.bind(this)
        });
    }
    
    //pick image from library asynchronously
    _pickImage = async () => {      // picks image from device
        let result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
        });

        //console.log('_pickImage: ' + result);
        
        if (!result.cancelled) {
        
            this._uploadImage(result.uri, this.state.name)
            .then(() => {
                console.log('Upload Success');
            })
            .catch((err) => {
                console.log(err);
            })
            .then();
            //set the photoAdded bool to change button text
            this.setState({ photoAdded: true});
        }
    }

    //upload photo selected to firebase file storage
    _uploadImage = async (uri, imageName) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        var ref = firebase.storage().ref().child("images/"+ this.props.auth.uid + '/' + imageName);
        await ref.put(blob)
        firebase.storage().ref().child("images/"+ this.props.auth.uid + '/' + imageName).getDownloadURL()
        .then(url => {
            //set image uri
            this.setState({ image: url});
        });
    }

    //updates the mapview location after user inputs postal address returns
    //lat/long and delta's for zoom
    async _updateMapView(address) {
        if(!address){
            this.setState({addressValidation: false});
            return;
        }
        //retrieves lat/long from postal address
        let location = await Location.geocodeAsync(address)
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
        let location = await Location.getCurrentPositionAsync({});  
        //gets postal location of lat/long and retrieves user's postal address
        let postal = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude, longitude: location.coords.longitude}) 
        //console.log("postal: " + JSON.stringify(postal)) 
        // post to firebase db with push
        this.props.firebase.push('/posts', { 
            user_id: this.props.auth.uid,  // user_uid
            event_name: this.state.name, //event name
            event_description: this.state.eventDescription, //event description
            start_date: this.state.startDate, //event start date
            start_time: this.state.startTime, //even start time
            credit_hours: this.state.creditHours, //event credits
            address: this.state.address, //event address
            map_region: this.state.region, // event map region
            created_at: (new Date()).getTime(),  //date created
            image: this.state.image,  // image location
            location: `${postal[0].city}`+', '+`${postal[0].region}`,  //object city, state
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
        <View>
            
        
            <FormLabel>Event Name</FormLabel>
            <FormInput
                ref={(input) => { this.firstTextInput = input; }}
                textInputRef='eventField'
                onChangeText={(value) => this.setState({ name: value})}
                value={this.state.name}
                autoCapitalize='words'
                autoFocus={true}
                onSubmitEditing={() => { this.secondTextInput.focus(); }}
                returnKeyType='next'
                />

            <FormValidationMessage>
            {this.state.nameValidation ? null : 'This field is required'}
            </FormValidationMessage>

            <FormLabel>Event Description</FormLabel>    
            <FormInput 
            ref={(input) => { this.secondTextInput = input; }}
            multiline 
            onChangeText={(text) => this.setState({eventDescription: text})}
            value={this.state.eventDescription}
            onSubmitEditing={() => { this.thirdTextInput.focus(); }}
            />
            
            <FormValidationMessage>
            {this.state.eventValidation ? null : 'This field is required'}
            </FormValidationMessage>

            <FormLabel>Start Date</FormLabel>    
            <FormInput 
            ref={(input) => { this.thirdTextInput = input; }}
            multiline
            maxLength={8} 
            onChangeText={(text) => this.setState({startDate: text})}
            value={this.state.startDate}
            onSubmitEditing={() => { this.fourthTextInput.focus(); }}
            />

            <FormValidationMessage>
            {this.state.dateValidation ? null : 'This field is required'}
            </FormValidationMessage>

            
            <FormLabel>Start Time</FormLabel>    
            <FormInput 
            ref={(input) => { this.fourthTextInput = input; }}
            multiline 
            maxLength={8}
            onChangeText={(text) => this.setState({startTime: text})}
            value={this.state.startTime}
            onSubmitEditing={() => { this.fifthTextInput.focus(); }}
            />

            <FormValidationMessage>
            {this.state.timeValidation ? null : 'This field is required'}
            </FormValidationMessage>

            <FormLabel>Volunteer Credit Hours</FormLabel>    
            <FormInput 
            ref={(input) => { this.fourthTextInput = input; }}
            multiline 
            maxLength={2}
            onChangeText={(text) => this.setState({creditHours: text})}
            value={this.state.creditHours}
            onSubmitEditing={() => { this.fifthTextInput.focus(); }}
            />

            <FormValidationMessage>
            {this.state.creditValidation ? null : 'This field is required'}
            </FormValidationMessage>

            <FormLabel>Address</FormLabel>
            <FormInput
                textInputRef='addressField'
                ref={(input) => { this.fifthTextInput = input; }}
                onChangeText={(text) => this.setState({ address: text })}
                value={this.state.address}
                autoCapitalize='words'
                onSubmitEditing={()=> this._updateMapView(this.state.address).then(this.firstTextInput.focus())}
                returnKeyType='send'
                />

            <FormValidationMessage>
            {this.state.addressValidation ? null : 'This field is required'}
            </FormValidationMessage>

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

            <Button
                onPress={() => this._performPhotoOrPost()}
                title={this.state.photoAdded ? "Post Event" : "Add Photo"}
                style={{marginTop: 25}}
                backgroundColor='#79B345'
                />                       


        </View>
        </ScrollView>
    );
}
/*Allows user to upload photo for event or Post if user has already
uploaded a photo*/
_performPhotoOrPost() {
    if (this.state.photoAdded) {
        //do post if all fields are empty show validation error
        if(!this.state.name && !this.state.eventDescription && !this.state.address &&
           !this.state.startDate && !this.state.startTime && !this.state.creditHours){
            this.setState({nameValidation: false})
            this.setState({eventValidation: false})
            this.setState({addressValidation: false})
            this.setState({dateValidation: false})
            this.setState({timeValidation: false})
            this.setState({timeValidation: false})
            return;
        }else if(!this.state.name){
            //if event name is empty show validation error for only name
            this.setState({nameValidation: false})
            return;
        }else if(!this.state.eventDescription){
            //if description is empty show validation error for this only
            this.setState({eventValidation: false})
            return;
        }else if(!this.state.address){
            //if address is empty show validation error for this only
            this.setState({addressValidation: false})
            return;
        }else if (!this.state.startDate){
            //if date is empty show validation error for this only
            this.setState({dateValidation: false})
            return;
        }else if (!this.state.startTime){
            //if time is empty show validation error for this only
            this.setState({timeValidation: false})
            return;
        }else if (!this.state.creditHours){
            //if credithours is empty show validation error for this only
            this.setState({creditValidation: false})
            return;
        }
        //call async function getCurrentPosition() to get location 
        this.props.navigation.state.params.getCurrentPosition();
        
    } else {
        //do photo if photoAdded is false then allow user to pick image
        this.props.navigation.state.params.showImagePicker();
    }
}



}

