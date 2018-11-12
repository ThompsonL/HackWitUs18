import React, { Component } from 'react';
import { 
    Button, 
    ScrollView, 
    ImageBackground, 
    Text, 
    View, 
    TouchableHighlight, 
    Dimensions,
    Alert,
    Image
} from 'react-native';
import { Avatar, Icon, List, ListItem } from 'react-native-elements';
import { connect } from 'react-redux';
import { firebaseConnect, populate } from 'react-redux-firebase';
import md5 from 'blueimp-md5';
import { Font, MapView } from 'expo';
import { Grid, Col, Row } from 'react-native-easy-grid';
import CountDown from 'react-native-countdown-component';

const populates = [{
     child: 'user_id', root: 'profiles'
}]

@firebaseConnect([
    { path: '/posts', queryParams: ['orderByChild=created_at', 'limitToLast=20'], populates}
])  
@connect(
    ({ firebase}) => ({
        auth: firebase.auth,  // auth passed as props.auth
        profile: firebase.profile, // profile passed as props.profile
        posts: populate(firebase, 'posts', populates), //all posts from fb db
        
    })
  )
export default class TimelineScreen extends Component {
   state = {
       fontLoaded: false,
   }
   
    static navigationOptions = ({ navigation }) => ({
        headerTintColor: 'orange',
        headerStyle: {
        backgroundColor: '#3399cc'
        },
        title: 'Recent Challenges',
        headerRight: <TouchableHighlight onPress={() => navigation.navigate('EventDetails')}>
            <Image style={{marginRight: 10, marginTop: 100, height: 50, width: 50}} source={require('./assets/addbtnmedium.png')} title="Add Event" />
            </TouchableHighlight>
    });

    async componentDidMount() {
        await Font.loadAsync({
          'Bauhaus93': require('./assets/fonts/Bauhaus-93_6274.ttf'),
        });
    
        this.setState({ fontLoaded: true });
      }

    _gravatarURL(post) {
        let email = post.user_id.email;
        return 'https://gravatar.com/avatar/' + md5(email) + '?s=400';
    }
    
    _showRemaining(dateRemaining) {
        var doit = [];
        console.log(dateRemaining);
        var end = new Date(dateRemaining);//'11/12/2018 05:10 AM'
        var now = new Date();
        var distance = end - now;
        var _second = 1000;
        var _minute = _second * 60;
        var _hour = _minute * 60;
        var _day = _hour * 24;

        
        var days = Math.floor(distance / _day);
        var hours = Math.floor((distance % _day) / _hour);
        var minutes = Math.floor((distance % _hour) / _minute);
        var seconds = Math.floor((distance % _minute) / _second);

        let totalsecs = days * 86000 + hours * 3600 + minutes * 60 + seconds;

        //doit.push(days, hours, minutes, seconds)
        console.log(totalsecs);
        return totalsecs;
    }

    render() {
        
        
        let posts = null;
        //console.log(this.props.posts);
        if (this.props.posts){
            posts = Object.values(this.props.posts).sort((a,b) => b.created_at - a.created_at).map((post, i) => {
            let countDown =null;
            let dateRemaining = post.start_date + ' ' + post.start_time;
            countDown = (
                <CountDown
                until={this._showRemaining(dateRemaining)}
                onFinish={() => alert('Ready Set Go!')}
                onPress={() => this.props.navigation.navigate('Post', {post})}
                size={20}
                />
            
                );

                
               return (
                    <View 
                    key={i} 
                    style={{marginTop: 20}}
                    >
                        {/* post_id parameters to send to post-details */}

                            

                            <ImageBackground 
                                source={require('./assets/eventbkgMedium.png')}
                                style={{height: 100, borderRadius: 25}} 
                                imageStyle={{ borderRadius: 25 }}
                                >

                            <Grid>
                                <Col style={{}}>
                            {


                            this.state.fontLoaded ? (
                            <TouchableHighlight style={{marginTop: 5}}
                            
                            >
                            <Text style={{fontFamily: 'Bauhaus93', fontSize: 20}}>
                                {post.event_name}
                            </Text>
                            
                            
                            
                            </TouchableHighlight>
                            ) : null
                            }

                                <Row style={{justifyContent: 'center'}}>
                                    <Text style={{fontFamily: 'Bauhaus93', fontSize: 20}}>
                                        start date: {post.start_date}
                                    </Text>
                                </Row>
                                <Row style={{justifyContent: 'center'}}>
                                    <Text style={{fontFamily: 'Bauhaus93', fontSize: 20}}>
                                        start time: {post.start_time}
                                    </Text>
                                </Row>
                                </Col>
                                <Col style={{}}>
                                
                                {countDown}
                                
                                <TouchableHighlight style={{marginLeft: 50}}
                                onPress={() => this.props.navigation.navigate('Post', {post})}
                                >
                                <Text style={{color: 'orange', fontWeight: '700', fontSize: 20}}>
                                  View Map >>
                                </Text>
                                </TouchableHighlight>

                                </Col>

                            </Grid>
                            
                            </ImageBackground>
                
                        
                        
                        {/*
                            <ImageBackground
                            source={require('./assets/minimapMed.png')}
                            style={{marginTop: 0, marginLeft: Dimensions.get('window').width * .50, height: 75, width: 150}} 
                            >
                            {
                            this.state.fontLoaded ? (
                            <TouchableHighlight style={{marginTop: 25,alignItems: 'center', justifyContent: 'center'}}
                            
                            >
                            <Text style={{fontFamily: 'Bauhaus93', fontSize: 24 }}>
                                View Map
                            </Text>
                            </TouchableHighlight>
                            ) : null
                            }
                            

                            </ImageBackground>

                        <Text style={{textAlign: 'center', fontStyle: 'italic', fontSize: 32}}>
                        {post.event_name}
                        </Text>
                        <Text style={{paddingTop: 5, textAlign: 'center', fontStyle: 'italic'}}>
                        {'By: ~' + post.user_id.username + '~\n'}
                        {this._parsedDate(date) +'\n'}
                        {post.location ? post.location : 'Somewhere in the world'}
                        </Text>

                         */}
                    </View>
                )

            });
        }else{
            return(
            <View>
            <ImageBackground
                style={{width:Dimensions.get('window').width, height:Dimensions.get('window').height}}
                source={require('./assets/eventbkmed.png')}
                >

                {
                    this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                     <Text style={{paddingTop: Dimensions.get('window').height*.25, justifyContent: 'center',textAlign: 'center', fontFamily: 'Bauhaus93'  , fontSize: 32}}>
                    There are no Challenges
            </Text>
                    </TouchableHighlight>
                    ) :  <Text style={{paddingTop: Dimensions.get('window').height*.25, justifyContent: 'center',textAlign: 'center', fontStyle: 'italic', fontSize: 32}}>
                    There are no Challenges
                </Text>
                }

           
            </ImageBackground>

            </View>
            )
        }
        return( 
            <View>
                 <ImageBackground
                style={{width:Dimensions.get('window').width, height:Dimensions.get('window').height}}
                source={require('./assets/eventbkmed.png')}
                >
                
                {
                    this.state.fontLoaded ? (
                    <TouchableHighlight style={{marginTop: 50, alignItems: 'center', justifyContent: 'center'}}
                    
                    >
                    <Text style={{fontFamily: 'Bauhaus93', fontSize: 24 }}>
                        WELCOME BACK {this.props.profile.username}
                    </Text>
                    </TouchableHighlight>
                    ) : null
                }
                {
                    this.state.fontLoaded ? (
                    <TouchableHighlight style={{marginTop: 5,alignItems: 'center', justifyContent: 'center'}}
                    
                    >
                    <Text style={{fontFamily: 'Bauhaus93', fontSize: 30 }}>
                        Today's Top Challenges
                    </Text>
                    </TouchableHighlight>
                    ) : null
                }
            <ScrollView style={{marginBottom: 165}}> 
            
                {posts}
            </ScrollView>
            </ImageBackground>

            </View>
        );
    }

}
