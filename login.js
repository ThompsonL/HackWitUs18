import React, { Component } from 'react';
import { ActivityIndicator, 
         AsyncStorage, 
         Text, 
         View, 
         Alert, 
         StyleSheet, 
         TouchableHighlight,
         Dimensions,
         Image
        } from 'react-native';
import * as firebase from 'firebase';
import { StackActions, NavigationActions } from 'react-navigation'
import { Button, FormLabel, FormInput } from 'react-native-elements';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { Font } from 'expo';



const styles = StyleSheet.create({
    loginTitle: {
        marginTop: Dimensions.get('window').height * .25, 
        textAlign: 'center', 
        fontSize: 15, 
        fontWeight: 'bold',
        color: 'black',
    },
    loginAuth: {
        marginTop: 36, 
        textAlign: 'center', 
        fontSize: 18, 
        fontWeight: 'bold',
    },
    viewBackground: {
        flex: 1,
        backgroundColor: '#3399cc'
    }
});

export default class LoginScreen extends Component {
    state = {
        isLoading: false,
        isSignup: false,
        database: firebase.database(),
        fontLoaded: false,
    };

    async componentDidMount() {
        await Font.loadAsync({
          'Bauhaus93': require('./assets/fonts/Bauhaus-93_6274.ttf'),
        });
    
        this.setState({ fontLoaded: true });
      }
    
    
render() {
    //if state is loading show spinner
    if (this.state.isLoading) {
        return(
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator animating size="large" />
            </View>
        );
    }
    //show name field
    let nameField = null;
    if (this.state.isSignup) {
        nameField = (
        <View>
            <TouchableHighlight  style={{alignItems: 'center', justifyContent: 'center'}}>

            {
                this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                        <FormLabel labelStyle={{fontFamily: 'Bauhaus93', color: 'black', fontSize: 24}}> Name: </FormLabel>
                    </TouchableHighlight>
                ) : <FormLabel>Name</FormLabel>
            }

            </TouchableHighlight>

            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}} >
            {
                this.state.fontLoaded ? (

                    <FormInput
                        onChangeText={(value) => this.setState({ name: value })}
                        autoCapitalize='words'
                        autoFocus={false}
                        onSubmitEditing={() => this._focusField('email')}
                        returnKeyType='next'
                        inputStyle={{color: 'black'}}
                        containerStyle={{borderRadius: 25, backgroundColor: 'white', width: Dimensions.get('window').width* .75}}
        
                    />
                    ) : <FormInput
                    onChangeText={(value) => this.setState({ name: value })}
                    autoCapitalize='words'
                    autoFocus={false}
                    onSubmitEditing={() => this._focusField('email')}
                    returnKeyType='next'
                />

                    
            }

            </TouchableHighlight>
        </View>
        );
    }

    return (
        
        <View style={styles.viewBackground}>

            

            

            <Text style={styles.loginTitle}>  WELCOME TO! </Text>
            {
                this.state.fontLoaded ? (
                <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontFamily: 'Bauhaus93', fontSize: 32 }}>
                    Ready.Set.Go
                </Text>
                </TouchableHighlight>
                ) : null
            }
    
            {nameField}
            
            {
                this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                        <FormLabel labelStyle={{fontFamily: 'Bauhaus93', color: 'black', fontSize: 24}}> Email: </FormLabel>
                    </TouchableHighlight>
                ) : <FormLabel>Email</FormLabel>
            }
            
            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
            <FormInput
                textInputRef='emailField'
                ref='email'
                inputStyle={{color: 'black'}}
                containerStyle={{borderRadius: 25, backgroundColor: 'white', width: Dimensions.get('window').width* .75}}
                onChangeText={(value) => this.setState({ email: value})}
                autoCapitalize='none'
                autoFocus={false}
                onSubmitEditing={() => this._focusField('password')}
                returnKeyType='next'
                keyboardType='email-address'
                />
            </TouchableHighlight>


             {
                this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                        <FormLabel labelStyle={{fontFamily: 'Bauhaus93', color: 'black', fontSize: 24}}> Password: </FormLabel>
                    </TouchableHighlight>
                ) : <FormLabel>Email</FormLabel>
            }
            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
            <FormInput 
                textInputRef='passwordField'
                ref='password'
                onChangeText={(value) => this.setState({ password: value})}
                onSubmitEditing={() => this._performLoginOrSignUp()}
                returnKeyType='send'
                secureTextEntry={true}
                inputStyle={{color: 'black'}}
                containerStyle={{borderRadius: 25, backgroundColor: 'white', width: Dimensions.get('window').width* .75}}
                />
            </TouchableHighlight>
            
            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}} >
            {
                this.state.fontLoaded ? (

                    <Button 
                        onPress={() => this._performLoginOrSignUp()}
                        textStyle={{fontFamily: 'Bauhaus93', fontSize: 24}}
                        title={this.state.isSignup ? "Signup" : "Login"}
                        style={{marginTop: 25, width: Dimensions.get('window').width* .75}}
                        backgroundColor='#336699'
                        
                    />
                ) : <Button 
                onPress={() => this._performLoginOrSignUp()}
                title={this.state.isSignup ? "Signup" : "Login"}
                style={{marginTop: 25, width: Dimensions.get('window').width* .75}}
                backgroundColor='#336699'
                
            />

            }

            </TouchableHighlight>
            
            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
            {
                this.state.fontLoaded ? (

                    <Button
                        onPress={() => this.setState({ isSignup: !this.state.isSignup })}
                        backgroundColor='#79B345'
                        style={{marginTop: 15, width: Dimensions.get('window').width*.75}}
                        textStyle={{fontFamily: 'Bauhaus93', fontSize: 16}}
                        title={this.state.isSignup ? "Already have an account? Log In." : "Don't have an account? Sign Up."} 
                    />               
                ): <Button
                onPress={() => this.setState({ isSignup: !this.state.isSignup })}
                backgroundColor='#79B345'
                style={{marginTop: 15, width: Dimensions.get('window').width*.75}}
                title={this.state.isSignup ? "Already have an account? Log In." : "Don't have an account? Sign Up."} 
            />        
            }

            </TouchableHighlight>
            

        </View>
    );
}
//change focus to new field
 _focusField(field) {
     this.ref[field].focus();
 }

 //perform login or signup depending on button state
_performLoginOrSignUp() {
    if (this.state.isSignup) {
        this._performSignup();
    } else {
        this._performLogin();
    }
}

//perform signup
_performSignup() {
    this.setState({ isLoading: true});

    //set states
     let { email, password, name } = this.state;
     const credentials = { email, password };
     //create user with on firebase using their email and pass
     firebase.auth().createUserWithEmailAndPassword(credentials.email, credentials.password)
     .then(() => {
         firebase.auth().currentUser.updateProfile({
             displayName: name,
             photoURL: ""
           }).then(function() {
             //console.log("Profile updated successfully!");
           }, function(error) {
             // An error happened.
             Alert.alert(error.message);
           });
           //add user to the database with initial parameters
           this.state.database.ref('profiles/' + firebase.auth().currentUser.uid).set({
            username: name,
            following: 0,
            posts: 0,
            email: email,
           })
           //save credentials function
           this._saveCredentials(credentials)    
     }, (error) => {
         Alert.alert(error.message);
         this.setState({ isLoading: false});      
     });
 
}
    //perform login
 _performLogin() {
     //no input email or pass return
     if(!this.state.email || !this.state.password) {
        Alert.alert("Enter email & password!");
        return;
     }

     this.setState({ isLoading: true});
     //set states
     let { email, password } = this.state;
     const credentials = { email, password };
     //signing in with firebase auth using username and pass
     firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
     .then(() => {
    //save credentials function
     this._saveCredentials(credentials)    
     }, (error) => {
         Alert.alert(error.message);
         this.setState({ isLoading: false}); 
     });    
 }
 //save credentials
 _saveCredentials({ email, password }) {
     //save as multiset to be called later for automatic login
    AsyncStorage.multiSet([['email', email],['password', password]]).then(() => {
        //return user back to Main screen
        this.props.navigation.dispatch(StackActions.reset({
            index:0,
            actions: [NavigationActions.navigate({ routeName: 'Main'})]
        }));
    });
 }
}   