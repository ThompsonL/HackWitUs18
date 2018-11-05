import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class PostDetailScreen extends Component {
    static navigationOptions = {
        title: 'Details'
    };

    render() {
        return(
            <View><Text>Details' for {this.props.navigation.state.params.post_id}</Text></View>
        );
    }
}
