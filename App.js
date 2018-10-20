import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';

import AppWithNavigationState from './app-navigator';
import createStore from './store';

const store = createStore();

class Root extends Component {
  render() {
    return(
      <Provider store={store}>
        <AppWithNavigationState />
      </Provider>
    );
  }
}

export default Root