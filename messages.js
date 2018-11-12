import React, { Component } from 'react';
import { Text, StyleSheet, TouchableHighlight, View, Dimensions } from 'react-native';
import md5 from 'blueimp-md5';
import { Grid, Row, Col } from 'react-native-easy-grid';
import { Avatar, Button, FormInput } from 'react-native-elements';
import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';
import { Font } from 'expo';

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
class MessagesScreen extends Component{
    state = {
        fontLoaded: false,
    };
    static navigationOptions = ({ navigation }) => ({
        headerTintColor: 'orange',
        headerStyle: {
        backgroundColor: '#3399cc'
        },
        title: 'Challenge Lounge',
    });
 
    async componentDidMount() {
        await Font.loadAsync({
          'Bauhaus93': require('./assets/fonts/Bauhaus-93_6274.ttf'),
        });
    
        this.setState({ fontLoaded: true });
      }

 render(){
     return(
       <View>
           {
                this.state.fontLoaded ? (
                <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center', marginTop: Dimensions.get('window').height * .30}}>
                <Text style={{fontFamily: 'Bauhaus93', fontSize: 32 }}>
                    Sorry :/ {'\n'}
                    There are no messages...
                </Text>
                </TouchableHighlight>
                ) : null
            }
            
       </View>
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

export default connect(MapStateToProps)(MessagesScreen);
