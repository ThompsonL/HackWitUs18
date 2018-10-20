import { createStore, compose } from 'redux';
import { reactReduxFirebase } from 'react-redux-firebase';
import { AsyncStorage } from 'react-native';

import AppReducer from './app-reducer';
import * as firebase from 'firebase';


const FirebaseConfig = {
    authDomain: 'bugleapp-4b94d.firebaseapp.com',
    databaseURL: 'https://bugleapp-4b94d.firebaseio.com/',
    apiKey: 'AIzaSyD1I6vNEaJLD0y8wFJtplboyKMUjlkhRjE',
}

const firebaseApp = firebase.initializeApp(FirebaseConfig);


export default function configureStore(initialState, history) {
    const reduxFirebase = reactReduxFirebase(firebaseApp, FirebaseConfig, {
        userProfile: 'profiles',
        profileParamsToPopulate: [
            'following:users'
        ],
        enableLogging: true,
        ReactNative: { AsyncStorage }
    });

    const createStoreWithMiddleWare = compose(
        reduxFirebase,
        typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension : (f) => f
    )(createStore);
    const store = createStoreWithMiddleWare(AppReducer);

    if(module.hot) {
        module.hot.accept('./app-reducer', () => {
            const nextAppReducer = require('./app-reducer');
            store.replaceReducer(nextAppReducer);
        });
    }

    return store;
}