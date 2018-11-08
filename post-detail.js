import React, { Component } from 'react';
import { Text, View, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import * as firebase from 'firebase';
import { connect } from 'react-redux';
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
    }
    static navigationOptions = {
        title: 'Event Details'
    };

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

   
   
    _getSnapShot() {
            var ref = firebase.database().ref("/posts");
            var query = ref.orderByChild("created_at").equalTo(this.props.navigation.state.params.post.created_at);
            var self = this; 
            var postId = [];
            query.once("value",function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
               // var postData = childSnapshot.val();
                postId.push(childSnapshot.key);
                self._removeEventFromDB(postId);
            });
        })
    }

    _removeEventFromDB(delKey) {
        // post to firebase db with push
       
        //console.log(key)
        this.props.firebase.remove('/posts/'+ delKey).then((result) => {
            console.log(result);
        })
    }

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
