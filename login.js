import React, { Component } from 'react';
import { ActivityIndicator, AsyncStorage, Text, View, Alert } from 'react-native';
import * as firebase from 'firebase';
import { StackActions, NavigationActions } from 'react-navigation'
import { Button, FormLabel, FormInput } from 'react-native-elements';

export default class LoginScreen extends Component {
    state = {
        isLoading: false,
        isSignup: false,
        database: firebase.database(),
    };
    
render() {
    if (this.state.isLoading) {
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator animating size="large" />
            </View>
        );
    }
    let nameField = null;
    if (this.state.isSignup) {
        nameField = (
        <View>
            <FormLabel>Name</FormLabel>
            <FormInput
                onChangeText={(value) => this.setState({ name: value })}
                autoCapitalize='words'
                autoFocus={true}
                onSubmitEditing={() => this._focusField('email')}
                returnKeyType='next'
            />
        </View>
        );
    }

    return (
        
        <View>
            <Text style={{marginTop: 36, textAlign: 'center', fontSize: 18, fontWeight: 'bold'}}>
                Authentication Required
            </Text>
    
            {nameField}

            <FormLabel>Email</FormLabel>
            <FormInput
                textInputRef='emailField'
                ref='email'
                onChangeText={(value) => this.setState({ email: value})}
                autoCapitalize='none'
                autoFocus={true}
                onSubmitEditing={() => this._focusField('password')}
                returnKeyType='next'
                keyboardType='email-address'
            />

            <FormLabel>Password</FormLabel>
            <FormInput
                textInputRef='passwordField'
                ref='password'
                onChangeText={(value) => this.setState({ password: value})}
                onSubmitEditing={() => this._performLoginOrSignUp()}
                returnKeyType='send'
                secureTextEntry={true}
            />

            <Button
                onPress={() => this._performLoginOrSignUp()}
                title={this.state.isSignup ? "Signup" : "Login"}
                style={{marginTop: 25}}
                backgroundColor='#212A34'
            />
            
            <Button
                onPress={() => this.setState({ isSignup: !this.state.isSignup })}
                backgroundColor='#79B345'
                style={{marginTop: 8}}
                title={this.state.isSignup ? "Already have an account? Log In." : "Don't have an account? Sign Up."} 
            />               

        </View>
    );
}
 _focusField(field) {
     this.ref[field].focus();
 }

_performLoginOrSignUp() {
    if (this.state.isSignup) {
        this._performSignup();
    } else {
        this._performLogin();
    }
}

_performSignup() {
    this.setState({ isLoading: true});

     let { email, password, name } = this.state;
     const credentials = { email, password };
     firebase.auth().createUserWithEmailAndPassword(credentials.email, credentials.password)
     .then(() => {
         firebase.auth().currentUser.updateProfile({
             displayName: name,
             photoURL: ""
           }).then(function() {
             console.log("Profile updated successfully!");
           }, function(error) {
             // An error happened.
             Alert.alert(error.message);
           });
           
           this.state.database.ref('profiles/' + firebase.auth().currentUser.uid).set({
            username: name,
            following: 0,
            posts: 0,
            email: email,
           })
           this._saveCredentials(credentials)    
     }, (error) => {
         Alert.alert(error.message);
         this.setState({ isLoading: false});      
     });
 
}

 _performLogin() {
     if(!this.state.email || !this.state.password) {
        Alert.alert("Enter email & password!");
        return;
     }

     this.setState({ isLoading: true});

     let { email, password } = this.state;
     const credentials = { email, password };

     firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
     .then(() => {
     this._saveCredentials(credentials)    
     }, (error) => {
         Alert.alert(error.message);
         this.setState({ isLoading: false}); 
     });    
 }

 _saveCredentials({ email, password }) {
    AsyncStorage.multiSet([['email', email],['password', password]]).then(() => {
        this.props.navigation.dispatch(StackActions.reset({
            index:0,
            actions: [NavigationActions.navigate({ routeName: 'Main'})]
        }));
    });
 }
}   