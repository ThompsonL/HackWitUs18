import { combineReducers } from 'redux';
import { firebaseStateReducer as firebase } from 'react-redux-firebase';


const appReducer = combineReducers({
    firebase
});

export default appReducer;