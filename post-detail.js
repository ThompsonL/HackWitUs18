import React, { Component } from 'react';
import { View, Text, Dimensions, StyleSheet, Alert, Platform , Image} from 'react-native';
import { Constants, MapView } from 'expo';
import { connect } from 'react-redux';
import { firebaseConnect, populate } from 'react-redux-firebase'
import * as firebase from 'firebase';

// Using a local version here because we need it to import MapView from 'expo'
import MapViewDirections from './MapViewDirections';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 37.771707;
const LONGITUDE = -122.4053769;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GOOGLE_MAPS_APIKEY = 'AIzaSyAL9CktenxoNTKLPlUdQ_KkrkaMYpBUe9E';

const populates = [{ //child of root to query from firebase db
    child: 'user_id', root: 'profiles'   
}]

@firebaseConnect()
@connect(  
    ({ firebase}) => ({
        auth: firebase.auth,  // auth passed as props.auth
        profile: firebase.profile, // profile passed as props.profile   
        posts: populate(firebase, 'posts', populates), //all posts from fb db     
    })
  )
export default class PostDetailScreen extends Component {
    state = {
        userId: this.props.navigation.state.params.post.user_id,
        origin: this.props.navigation.state.params.post.origin,
        destination: this.props.navigation.state.params.post.destination,
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
    };
    static navigationOptions = {
        title: 'Challenge Route'
    };

    constructor(props) {
		super(props);

		this.state = {
			coordinates: [
				{
					latitude: this.state.origin.latitude,
					longitude: this.state.origin.longitude,
				},
				{
					latitude: this.state.destination.latitude,
					longitude: this.state.destination.longitude,
				},
			],
		};

		this.mapView = null;
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

	render() {
	  
	 
	  
		return (
		  <View style={styles.container}>
  			<MapView
  				initialRegion={{
  					latitude: LATITUDE,
  					longitude: LONGITUDE,
  					latitudeDelta: LATITUDE_DELTA,
  					longitudeDelta: LONGITUDE_DELTA,
  				}}
  				style={StyleSheet.absoluteFill}
  				ref={c => this.mapView = c} // eslint-disable-line react/jsx-no-bind
  				onPress={this.onMapPress}
  				loadingEnabled={true}
  			>
  				{//this.state.coordinates.map((coordinate, index) => 
                  <MapView.Marker
                  title={"Start"}
                  //description={this.state.eventDescription}
                  
                  coordinate={{latitude: this.props.navigation.state.params.post.origin.latitude, 
                                longitude: this.props.navigation.state.params.post.origin.longitude}}
                  >
                  <Image
                        source={require('./assets/urnew.png')}
                        style={{width: 40, height: 40}}
                    />
                  </MapView.Marker>
                }
                {
                    <MapView.Marker
                    title={"Finish"}
                    //description={this.state.eventDescription}
                    
                    coordinate={{latitude: this.props.navigation.state.params.post.destination.latitude, 
                                  longitude: this.props.navigation.state.params.post.destination.longitude}}
                    >
                    <Image
                          source={require('./assets/fnew.png')}
                          style={{width: 40, height: 40}}
                      />
                    </MapView.Marker>
                }
                  
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
			</View>
		);
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});