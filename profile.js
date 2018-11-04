import React, { Component } from 'react';
import { Button, Text, StyleSheet } from 'react-native';
import md5 from 'blueimp-md5';
import { Grid, Row, Col } from 'react-native-easy-grid';
import { Avatar } from 'react-native-elements';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';

const styles = StyleSheet.create({
    statsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        height: 40,
    },

    stats: {
        fontWeight: '700'
    }
});


  @firebaseConnect()
class ProfileScreen extends Component{
    static navigationOptions = ({ navigation }) => ({
        title: 'Profile',
        headerRight: <Button title="Add Contacts" onPress={() => navigation.navigate('AddContacts')} />
    });
 gravatarURL() {
     let email = this.props.auth.email;
     return 'https://gravatar.com/avatar/' + md5(email) + '?s=400';
 }
    

 render(){
     let name = this.props.profile ? this.props.profile.username : 'Anonymous';
     let follow = this.props.profile && this.props.profile.following ? Object.keys(this.props.profile.following).length : 0;
     let posts = this.props.posts ? Object.keys(this.props.posts).length : 0;
     return(
        <Grid>
            <Col style={{alignItems: 'center'}}>
                <Avatar
                large
                rounded
                source={{uri: this.gravatarURL()}}
                containerStyle={{marginTop:35, width: 75, height: 75, marginVertical: 10}}
                />
                <Text style={{fontSize: 18, marginBottom: 15}}>{name}</Text>
            <Row>
                <Col style={styles.statsContainer}><Text style={styles.stats}> {follow} Following</Text></Col>
                <Col style={styles.statsContainer}><Text style={styles.stats}> {posts} Posts</Text></Col>
            </Row>
            </Col>

        </Grid>
     );
    }
}

const MapStateToProps = (state) => {
    //console.log(state);
    return {
      auth: state.firebase.auth,  // auth passed as props.auth
      profile: state.firebase.profile // profile passed as props.profile
    }
  }

export default connect(MapStateToProps)(ProfileScreen);
