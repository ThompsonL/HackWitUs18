import { createStore, compose } from 'redux';
import { reactReduxFirebase } from 'react-redux-firebase';
import { AsyncStorage } from 'react-native';

import AppReducer from './app-reducer';
import firebase from 'firebase';
import ApiKeys from './constants/ApiKeys';

// Initialize firebase...
if (!firebase.apps.length) { firebase.initializeApp(ApiKeys.FirebaseConfig); }

export const profilePopulates = [{ child: 'role', root: 'roles' }]

const rrConfig = {
    userProfile: 'profiles',
    profileParamsToPopulate: profilePopulates, // populate list of todos from todos ref
    enableLogging: true,
    ReactNative: { AsyncStorage },
    attachAuthIsReady: true, // attaches auth is ready promise to store
    firebaseStateName: 'firebase', // should match the reducer name ('firebase' is default)
    enableRedirectHandling: false // since react-native does not support http or https and isn't a browser

}



export default function configureStore(initialState, history) {
        
    const store = createStore(
        AppReducer,
        initialState,
        compose(
            reactReduxFirebase(firebase, rrConfig),
        )
    );
        
        if(module.hot) {
            module.hot.accept('./app-reducer', () => {
                const nextAppReducer = require('./app-reducer');
                store.replaceReducer(nextAppReducer);
            });
        }    
    
    
    return store;
}