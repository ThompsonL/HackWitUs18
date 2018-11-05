import React, { Component } from 'react';
import { View, Alert, Dimensions, ScrollView } from 'react-native';
import { FormLabel, FormInput, Button, FormValidationMessage } from 'react-native-elements';
import { MapView, ImagePicker, Permissions, Location } from 'expo';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation'
import { firebaseConnect, populate } from 'react-redux-firebase';

const populates = [{
    child: 'user_id', root: 'profiles'
}]

@firebaseConnect([
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
        photoAdded: false,  //photo not added button shows add photo
        name: 'name',
        nameValidation: true,
        address: null,
        addressValidation: true,
        eventDescription: 'event',
        eventValidation: true,
        hasCameraPermission: null, // permission for camera usage
        hasLocationPermission: null,
        image: null,  //image uri path
        locLat: 37.78825,
        locLong: -122.4324,
        region: {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 1.3787,
            longitudeDelta: 2.2741
        },

    };

    static navigationOptions = ({ navigation }) => ({  //navigation not used maybe implement later
        title: 'Add Event Details'
    });

    async componentWillMount() {
        const { camstatus } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL)
        this.setState({ hasCameraPermission: camstatus === 'granted' })
        const { geostatus } = await Permissions.askAsync(Permissions.LOCATION)
        this.setState({ hasLocationPermission: geostatus === 'granted' })
      }

    componentDidMount() {
        this.props.navigation.setParams({ 
            showImagePicker: this._pickImage.bind(this),
            getCurrentPosition: this._getLocationAsync.bind(this)
        });
    }

    _pickImage = async () => {      // picks image from device
        let result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
        });

        //console.log('_pickImage: ' + result);
        
        if (!result.cancelled) {
            this.setState({ image: result.uri });
            this.setState({ photoAdded: true});
        }
    }

    async _updateMapView(address) {
        if(!address){
            this.setState({addressValidation: false});
            return;
        }
        let location = await Location.geocodeAsync(address)
        console.log(JSON.stringify(location))
        if(location !== undefined){
            var region = {
                latitude: location[0].latitude,
                longitude: location[0].longitude,
                latitudeDelta: 1.3787,
                longitudeDelta: 2.2741
            }
            this.setState({region});
        }
            var LatLong = {
                latitude: location[0].latitude,
                longitude: location[0].longitude
            }
        return LatLong;
    }

    getInitialState() {
        return {
          region: {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 1.3787,
            longitudeDelta: 2.2741,
          },
        };
      }
      
      onRegionChange(region) {
        console.log(region);
      }

    _getLocationAsync = async () => {        // retrieves location from device and sends to firebase db
        let location = await Location.getCurrentPositionAsync({});  //retrieves user's location
        let postal = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude, longitude: location.coords.longitude}) //gets postal location of lat/long
        //console.log("postal: " + JSON.stringify(postal)) 
        this.props.firebase.push('/posts', {         // post to firebase db
            user_id: this.props.auth.uid,  // user_uid
            created_at: (new Date()).getTime(),  //date created
            image: this.state.image,  // image location
            location: `${postal[0].city}`+', '+`${postal[0].region}`,  //object city, state
        })
        .then(Alert.alert("Congratulations!,\n"+ this.props.profile.username +"\n"+"You just created the event " + this.state.name +"!"))
        .then(this.props.navigation.dispatch(StackActions.reset({
                index:0,
                actions: [NavigationActions.navigate({ routeName: 'Timeline'})]
        })));
    };


render() {
    
    return (
        <ScrollView>
        <View>
            
            <FormLabel>Event Name</FormLabel>
            <FormInput
                textInputRef='eventField'
                ref='name'
                onChangeText={(value) => this.setState({ name: value})}
                autoCapitalize='words'
                autoFocus={true}
                onSubmitEditing={() => { this.secondTextInput.focus(); }}
                returnKeyType='next'
                />

            <FormValidationMessage>
            {this.state.nameValidation ? null : 'This field is required'}
            </FormValidationMessage>

            <FormLabel>Address</FormLabel>
            <FormInput
                textInputRef='addressField'
                ref={(input) => { this.secondTextInput = input; }}
                onChangeText={(text) => this.setState({ address: text })}
                autoCapitalize='words'
                onSubmitEditing={()=> this._updateMapView(this.state.address).then(this.thirdTextInput.focus())}
                returnKeyType='send'
                />

            <FormValidationMessage>
            {this.state.addressValidation ? null : 'This field is required'}
            </FormValidationMessage>

            <MapView
                style={{ height: 300, width: Dimensions.get('window').width, borderRadius: 25 }}
                region={this.state.region}
                //onRegionChange={this.onRegionChange}
            >
                <MapView.Marker
                coordinate={{latitude: this.state.region.latitude, longitude: this.state.region.latitude}}
                title={this.state.name}
                description={this.state.eventDescription}
                />
            </MapView>

            <FormLabel>Event Description</FormLabel>    
            <FormInput 
            ref={(input) => { this.thirdTextInput = input; }}
            multiline 
            onChangeText={(text) => this.setState({eventDescription: text})}
            value={this.state.text}
            />
            <FormValidationMessage>
            {this.state.eventValidation ? null : 'This field is required'}
            </FormValidationMessage>

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
 _focusField(field) {
     this.textInputRef[field].focus();
 }

_performPhotoOrPost() {
    if (this.state.photoAdded) {
        //do post
        if(!this.state.name && !this.state.eventDescription && !this.state.address){
            this.setState({nameValidation: false})
            this.setState({eventValidation: false})
            this.setState({addressValidation: false})
            return;
        }else if(!this.state.name){
            this.setState({nameValidation: false})
            return;
        }else if(!this.state.eventDescription){
            this.setState({eventValidation: false})
            return;
        }else if(!this.state.address){
            this.setState({addressValidation: false})
            return;
        }
         
        this.props.navigation.state.params.getCurrentPosition();
        
    } else {
        //do photo
        this.props.navigation.state.params.showImagePicker();
    }
}

}

