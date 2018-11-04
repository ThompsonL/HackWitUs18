import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class PostDetailScreen extends Component {
    static navigationOptions = {
        title: 'Posts'
    };

    render() {
        return(
            <View><Text>PostDetail for {this.props.navigation.state.params.post_id}</Text></View>
        );
    }
}
