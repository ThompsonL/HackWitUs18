import React, { Component } from 'react';
import { Text, StyleSheet } from 'react-native';
import md5 from 'blueimp-md5';
import { Grid, Row, Col } from 'react-native-easy-grid';
import { Avatar } from 'react-native-elements';

const styles = StyleSheet.create({
    statsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        height: 40,
    },

    stats: {
        fontWeight: '700'
    }
});


export default class ProfileScreen extends Component{
    static navigationOptions = {
        title: 'Profile'
    };
 gravatarURL() {
     let email = 'markus@mmuehlberger.com';
     return 'https://gravatar.com/avatar/' + md5(email) + '?s=400';
 }


 render(){
     return(
        <Grid>
            <Col style={{alignItems: 'center'}}>
                <Avatar
                large
                rounded
                source={{uri: this.gravatarURL()}}
                containerStyle={{marginTop:35, width: 75, height: 75, marginVertical: 10}}
                />
                <Text style={{fontSize: 18, marginBottom: 15}}>Markus Muehlberger</Text>
            <Row>
                <Col style={styles.statsContainer}><Text style={styles.stats}> 123 Following</Text></Col>
                <Col style={styles.statsContainer}><Text style={styles.stats}> 456 Posts</Text></Col>
            </Row>
            </Col>

        </Grid>
     );
    }
}