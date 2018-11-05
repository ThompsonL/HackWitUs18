import React, { Component } from 'react';
import { AsyncStorage, Text, View, Alert, Dimensions } from 'react-native';
import * as firebase from 'firebase';
import { StackActions, NavigationActions } from 'react-navigation'
import { FormLabel, FormInput, Button } from 'react-native-elements';
import { MapView, ImagePicker, Permissions, Location } from 'expo';

export default class EventDetailScreen extends Component {
    state = { 
        photoAdded: false,  //photo not added button shows add photo
        name: null,
        address: null,
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
        }
    };

    static navigationOptions = ({ navigation }) => ({
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
        });
    };


render() {
    
    return (
        
        <View>
            
            <FormLabel>Event Name</FormLabel>
            <FormInput
                textInputRef='eventField'
                ref='name'
                onChangeText={(value) => this.setState({ name: value})}
                autoCapitalize='words'
                autoFocus={true}
                onSubmitEditing={() => this._focusField('address')}
                returnKeyType='next'
            />

            <FormLabel>Address</FormLabel>
            <FormInput
                textInputRef='addressField'
                ref='address'
                onChangeText={(text) => this.setState({ address: text })}
                autoCapitalize='words'
                onSubmitEditing={()=> this._updateMapView(this.state.address)}
                returnKeyType='send'
            />

            <MapView
                style={{ marginTop: 40, height: 300, width: Dimensions.get('window').width }}
                region={this.state.region}
                //onRegionChange={this.onRegionChange}
            />
                
                

            <Button
                onPress={() => this._performPhotoOrPost()}
                title={this.state.photoAdded ? "Post Event" : "Add Photo"}
                style={{marginTop: 25}}
                backgroundColor='#79B345'
            />                       


        </View>
    );
}
 _focusField(field) {
     this.ref[field].focus();
 }

_performPhotoOrPost() {
    if (this.state.photoAdded) {
        //do post
        this.props.navigation.state.params.getCurrentPosition();    
    } else {
        //do photo
        this.props.navigation.state.params.showImagePicker();
    }
}

}   
