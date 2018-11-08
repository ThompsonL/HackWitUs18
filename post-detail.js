import React, { Component } from 'react';
import { Text, View, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation';
import { firebaseConnect, populate } from 'react-redux-firebase'

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
        postUserId: this.props.navigation.state.params.post.user_id,
        postEmail: this.props.navigation.state.params.post.user_id.email,
        postId: [],
        imageName: this.props.navigation.state.params.post.event_name,
    }
    static navigationOptions = {
        title: 'Event Details'
    };

    //alert user to verify if want to delete event post
    _removeEvent() { //remove event
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'Yes', onPress: () => this._getSnapShot()},
            ],
            { cancelable: true }
          )
    }

   
   //get a snapshot and key of the posts that match the one selected
    _getSnapShot() {
            var ref = firebase.database().ref("/posts");
            var query = ref.orderByChild("created_at").equalTo(this.props.navigation.state.params.post.created_at);
            var self = this; //scope of the variable to be accessed outside of local function .foreach()
            var postId = [];
            query.once("value",function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
               // var postData = childSnapshot.val();
                postId.push(childSnapshot.key);
                self._removeEventFromDB(postId);
            });
        })
    }

    //removes the event post from the firebase db
    _removeEventFromDB(delKey) {
        this.props.firebase.remove('/posts/'+ delKey)
        //return back to timline screen
        .then((result) => {
            console.log(result);
        })
        this._updatePostCount();
       
    }

    //updates the count of post on firebase db
_updatePostCount() {
    this.props.firebase.remove('profiles/'+ this.props.auth.uid +'/posts/'+ Object.keys(this.props.profile.posts).length);
    this._removeImage();
}


    //remove photo from firebase file storage
    _removeImage = async () => {
        const ref = firebase.storage().ref("images/"+ this.props.auth.uid + '/' + this.state.imageName);
        await ref.delete()
        .then(() => {
            this.props.navigation.dispatch(StackActions.reset({
                index:0,
                actions: [NavigationActions.navigate({ routeName: 'Timeline'})]
            }))
        })
        .catch((deleteError) => {
            console.log(deleteError);
        });
            }

    //alert user joined event
    _joinEvent() {
        Alert.alert('Join Event')
    }

    render() {
        console.log(this.props.auth.uid)
        return(
            <View>
                <Text>
                Details' for {this.props.navigation.state.params.post.event_name}
                </Text>
                <Button
                onPress={this.state.postEmail != this.props.profile.email ? () => this._joinEvent() : () => this._removeEvent()}
                backgroundColor={this.state.postEmail != this.props.profile.email ? color='green' : color="red"}
                style={{marginTop: 8}}
                title={this.state.postEmail != this.props.profile.email ? "Join" : "Delete"} 
                />               

            </View>
        );
    }
}
