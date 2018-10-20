import React, { Component } from 'react';
import { ActivityIndicator, AsyncStorage, Text, View } from 'react-native';
import { firebaseConnet, pathToJS, isLoaded } from 'react-redux-firebase';
import { NavigationActions } from 'react-navigation';

import { Button, FormLabel, FormInput } from 'react-native-elements';

export default class LoginScreen extends Component {
    state = {
        isLoading: false
    };

render() {
    if (this.state.isLoading) {
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator animating size="large" />
            </View>
        );
    }

    return (
        <View>
            <Text stylep={{marginTop: 36, textAlign: 'center', fontSize: 18, fontWeight: 'bold'}}>
                Authentication Required
            </Text>

            <FromLabel>Email</FromLabel>
        </View>
    )
}

}