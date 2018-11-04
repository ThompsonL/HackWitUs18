import { combineReducers } from 'redux';
import { firebaseReducer as firebase } from 'react-redux-firebase';

const appReducer = combineReducers({
   firebase
})

export default appReducer;