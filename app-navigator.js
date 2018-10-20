import React, { Component } from 'react';
import { NavigationActions, createStackNavigator, createBottomTabNavigator }  from 'react-navigation';
import { Icon } from 'react-native-elements';

import { firebaseConnect, pathToJS, isLoaded } from 'react-redux-firebase';
import { connect } from 'react-redux';

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
  Profile: { screen: ProfileScreen }
});
ProfileNavigator.navigationOptions = {
  title: 'Profile',
  tabBarIcon: ({ tintColor }) => <Icon color={tintColor} name="account-box" />
};

const MainNavigator = createBottomTabNavigator({
  Home: { screen: TimelineNavigator },
  Profile: { screen: ProfileNavigator }
});

@firebaseConnect
@connect(({ firebase }) => ({
    auth: pathToJS(firebase, 'auth', undefined)
}))
class Main extends Component {
    state = { authComplete: false };

    _setupAuthentication() {
        this.props.navigation.dispatch(NavigationActions.reset({
            index: 0,
            actions:[NavigationAtions.navigate({ routeName: 'Login' })] 
        }));
    }

    componentDidMount() {
        if (!this.props.auth) {
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
    Main: { screen: Main},
    Login: { screen: LoginScreen } 
}, { headerMode: 'none'});

export default connect()(AppNavigator);