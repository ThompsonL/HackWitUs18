import React, { Component } from 'react';
import { Provider } from 'react-redux';

import createStore from './store';
import AppWithNavigationState from './app-navigator';

const store = createStore();

console.disableYellowBox = true;

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