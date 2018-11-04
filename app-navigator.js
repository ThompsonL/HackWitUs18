import React, { Component } from 'react';
import { NavigationActions, StackActions, createStackNavigator, createBottomTabNavigator }  from 'react-navigation';
import { Alert, AsyncStorage} from 'react-native';
import { Icon } from 'react-native-elements';

import * as firebase from 'firebase';

import { firebaseConnect } from 'react-redux-firebase';
import { connect } from 'react-redux';

import AddContactsScreen from './add-contacts';
import LoginScreen from './login';
import TimelineScreen from './timeline';
import PostDetailScreen from './post-detail';
import ProfileScreen from './profile';


const TimelineNavigator = createStackNavigator({
  Timeline: { screen: TimelineScreen },
  Post: { path: 'posts/:post_id', screen: PostDetailScreen }
});
TimelineNavigator.navigationOptions = {
  title: 'Timeline',
  tabBarIcon: ({ tintColor }) => <Icon color={tintColor} name="image" />
};

const ProfileNavigator = createStackNavigator({
  Profile: { screen: ProfileScreen },
  AddContacts: { screen: AddContactsScreen }
}, {mode: "modal"});
ProfileNavigator.navigationOptions = {
  title: 'Profile',
  tabBarIcon: ({ tintColor }) => <Icon color={tintColor} name="account-box" />
};

const MainNavigator = createBottomTabNavigator({
  Home: { screen: TimelineNavigator },
  Profile: { screen: ProfileNavigator }
});

@firebaseConnect()
@connect(
  ({ firebase}) => ({
      auth: firebase.auth,  // auth passed as props.auth
      profile: firebase.profile, // profile passed as props.profile
     
  })
)
class Main extends Component {
  state = { authComplete: false};

    async _setupAuthentication() {
      
        let credentials = await AsyncStorage.multiGet(['email', 'password']);
        if(credentials[0][1] == null && credentials[1][1] == null){
          this.props.navigation.dispatch(StackActions.reset({
            index:0,
            actions: [NavigationActions.navigate({ routeName: 'Login'})]
          }));
        }else{
          firebase.auth().signInWithEmailAndPassword(credentials[0][1],credentials[1][1])
          .then(() => {
            this.setState({ authComplete: true});
            }, (error) => {
                Alert.alert(error.message);
                this.props.navigation.dispatch(StackActions.reset({
                  index:0,
                  actions: [NavigationActions.navigate({ routeName: 'Login'})]
                }));
            });    
        }

      
    }
    

    componentDidMount(){
      console.log("auth_state.isEmpty: " + this.props.auth.isEmpty)
      if (this.props.auth.isEmpty) {
        this._setupAuthentication();
      } else {
        this.setState({ authComplete: true });
      }
    }
    
    render() {
            return this.state.authComplete ? (<MainNavigator />) : null;
          }
    
}

const AppNavigator = createStackNavigator({
  Main: { screen: Main },
  Login: { screen: LoginScreen }
}, { headerMode: 'none'});  

export default connect()(AppNavigator);