import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';

export default class TimelineScreen extends Component {
    static navigationOptions = {
        title: 'Recent Posts'
    };

    render() {
        return(
            <View><Text>Timeline</Text>
            <Button 
            onPress={() => this.props.navigation.navigate('Post', { post_id: '1' })}
            title="Go To Post 1"
            />

            <Button 
            onPress={() => this.props.navigation.navigate('Post', { post_id: '2'})}
            title="Go To Post 2"
            />
            </View>
        );
    }
}