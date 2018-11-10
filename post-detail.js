import React, { Component } from 'react';
import { Text, View, Alert, StyleSheet, ScrollView } from 'react-native';
import { Button, Avatar, Card, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation';
import { firebaseConnect, populate } from 'react-redux-firebase'
import { Col, Grid, Row } from 'react-native-easy-grid';
import { MapView } from 'expo';
import * as firebase from 'firebase';
import md5 from 'blueimp-md5';

const populates = [{ //child of root to query from firebase db
    child: 'user_id', root: 'profiles'   
}]

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //alignItems: 'center',  makes 'delete' button small
        justifyContent: 'center',
        //paddingTop: Constants.statusBarHeight,
        backgroundColor: '#ecf0f1',
      },
    statsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        height: 50,
    },
    stats: {
        fontWeight: '700'
    },
    avatarContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'orange'
    },
    detailContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: 50,
    },
    detailText:{
        fontWeight: '300',
        fontSize: 24,
        fontStyle: 'italic'
    }
});

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
        following: this.props.navigation.state.params.post.user_id.following,
        posts: this.props.navigation.state.params.post.user_id.posts,
        Username: this.props.navigation.state.params.post.user_id.username,
        image: this.props.navigation.state.params.post.image,
        eventDescription: this.props.navigation.state.params.post.event_description,
        creditHours: this.props.navigation.state.params.post.credit_hours,
        startDate: this.props.navigation.state.params.post.start_date,
        startTime: this.props.navigation.state.params.post.start_time,
        region: this.props.navigation.state.params.post.map_region
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

    //decrease the count of post on firebase db
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

    _gravatarURL(post) {
        return 'https://gravatar.com/avatar/' + md5(post) + '?s=400';
    }

    render() {
        console.log(this.props.auth.uid)
        let name = this.state.Username ? this.state.Username : 'Anonymous';
        let follow = this.state.following && this.state.following ? Object.keys(this.state.following).length : 0;
        let posts = this.state.posts ? Object.keys(this.state.posts).length : 0;
        return(
            <ScrollView>
            <View style={styles.container}>
                
          
                    <Row>
                    <Col style={styles.avatarContainer}>
                    <Avatar
                    large
                    rounded
                    source={{uri: this._gravatarURL(this.state.postEmail)}}
                    containerStyle={{marginTop:35, width: 75, height: 75, marginVertical: 10}}
                    />
                    <Text style={{fontSize: 18, marginBottom: 15}}>{name}</Text>
                    </Col>
                    <Col>    
                        <Row style={styles.statsContainer}><Text style={styles.stats}>  Joined </Text></Row>
                        <Row style={styles.statsContainer}><Text style={styles.stats}> {follow} Following </Text></Row>
                        <Row style={styles.statsContainer}><Text style={styles.stats}> {posts} Posts</Text></Row>
                    </Col>
                    </Row>
                    <Row style={styles.detailContainer}>
                    <Text style={styles.detailText}>
                    Details' for {this.props.navigation.state.params.post.event_name}
                    </Text>
                    </Row>
                    
                    <Card
                    title={'Volunteer Credits: ' + this.state.creditHours + '\n'
                            + 'Location'}
                    //image={{uri: this.state.image}}
                    //image={require('../images/pic2.jpg')}  //need this later for profile image possibly??? for displaying no photo
                    >

                    <MapView
                        style={{ height: 300, width: Card.width, borderRadius: 25 }}
                        region={this.state.region}
                        //onRegionChange={this.onRegionChange}
                    >
                        <MapView.Marker
                        title={this.state.imageName}
                        description={this.state.eventDescription}
                        coordinate={{latitude: this.state.region.latitude, longitude: this.state.region.longitude}}
                        />
                    </MapView>    
                    
                    <Text style={styles.stats}>
                        {'Description: \n' + this.state.eventDescription + '\n' +
                        'Start Date: ' + this.state.startDate +
                        'Start Time: ' + this.state.startTime
                        }
                    </Text>

                    <Button
                        icon={<Icon name='code' color='#ffffff' />}
                        backgroundColor='#03A9F4'
                        buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                        title={this.state.postEmail != this.props.profile.email ? "Join" : "Delete"}
                        onPress={this.state.postEmail != this.props.profile.email ? () => this._joinEvent() : () => this._removeEvent()}
                        />
                    </Card>
                    

                    {/*
                    <Button
                    onPress={this.state.postEmail != this.props.profile.email ? () => this._joinEvent() : () => this._removeEvent()}
                    backgroundColor={this.state.postEmail != this.props.profile.email ? color='green' : color="red"}
                    style={{marginTop: 8}}
                    title={this.state.postEmail != this.props.profile.email ? "Join" : "Delete"} 
                    />  
                    
                    */}             
                
            </View>
            </ScrollView>
        );
    }


}
