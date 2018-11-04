import React, { Component } from 'react';
import { Button, ScrollView, ImageBackground, Text, View} from 'react-native';
import { ImagePicker, Permissions, Location } from 'expo';
import { Avatar } from 'react-native-elements';
import { connect } from 'react-redux';
import { firebaseConnect, populate } from 'react-redux-firebase';
import moment from 'moment';
import md5 from 'blueimp-md5';

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
        hasCameraPermission: null, // permission for camera usage
        hasLocationPermission: null,
        image: null,  //image uri path
    })
  )
export default class TimelineScreen extends Component {
   

    static navigationOptions = ({ navigation }) => ({
        title: 'Recent Events',
        headerRight: <Button title="Add Event" onPress={() => navigation.state.params.showImagePicker()}/>
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

    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
        });

        console.log('_pickImage: ' + result);
        
        if (!result.cancelled) {
            this.setState({ image: result.uri });
            this.props.navigation.state.params.getCurrentPosition();
        }
    }

    _getLocationAsync = async () => {
        let location = await Location.getCurrentPositionAsync({});
        let postal = await Location.reverseGeocodeAsync({latitude: location.coords.latitude, longitude: location.coords.longitude})
        console.log("postal: " + JSON.stringify(postal))
        let dateNow = moment().format('LTS') + ' - ' + moment().format('ll'); // Sat, Nov 3, 2018 11:03 PM
        this.props.firebase.push('/posts', {
            user_id: this.props.auth.uid,
            created_at: dateNow,
            image: this.state.image,
            location: `${postal[0].city}`+', '+`${postal[0].region}`,
        });
    };

    gravatarURL(post) {
        let email = post.user_id.email;
        return 'https://gravatar.com/avatar/' + md5(email) + '?s=400';
    }

    render() {
        let posts = null;
        console.log(this.props.posts);
        if (this.props.posts){
            posts = Object.values(this.props.posts).sort((a,b) => b.created_at - a.created_at).map((post, i) => {
               
                return (
                    <View key={i} style={{padding: 10, marginBottom: 25, backgroundColor: '#FFF'}}>
                        {/*<Text style={{fontWeight: 'bold', marginLeft: 40}}>{post.user_id.username}</Text>*/}
                        <ImageBackground source={{uri: post.image, isStatic: true}} style={{height: 250, borderRadius: 25}} imageStyle={{ borderRadius: 25 }}>
                        <Avatar
                        medium
                        rounded
                        source={{uri: this.gravatarURL(post)}}
                        containerStyle={{width: 25, height: 25, position: "absolute", marginTop:5, marginLeft: 5}}
                        />                        
                        </ImageBackground>
                        <Text style={{paddingTop: 5, textAlign: 'center', fontStyle: 'italic'}}>
                         {post.created_at.toString()+'\n'}
                         {post.location ? post.location : 'Somewhere in the world'}
                        </Text>
                    </View>
                )

            });
        }
        return( 
            <ScrollView>
                {posts}
            </ScrollView>
        );
    }

}
