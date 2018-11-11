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

const populates = [{
     child: 'user_id', root: 'profiles'
}]

@firebaseConnect([
    { path: '/posts', queryParams: ['orderByChild=created_at', 'limitToLast=5'], populates}
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

    _parseTime(time) {  //parse time for event
        let semi = ':';
        let space = ' ';
        let nTime = time.split(':')
        let hour = nTime[0];
        let min = nTime [1];
        if ( hour > 12){
            let tod = 'PM';
            hour = hour - 12;
            let parsedTime = hour+semi+min+space+tod;
            return parsedTime;

        }else{
            let tod = 'AM';
            let parsedTime = hour+semi+min+space+tod;
            return parsedTime;

        }        
    }

    _parsedDate(date) {  //parse date for events
        let comma = ', ';
        let space = ' ';
        let ndate = date.toString().split(' ');
        let dayName = ndate[0];
        let month = ndate[1];
        let dayNum = ndate[2];
        let year = ndate[3];
        let time = this._parseTime(ndate[4]);

        let timePosted = dayName+comma+
                         month+space+dayNum+comma+
                         year+space+time
        return timePosted;
    }

    render() {
        let posts = null;
        //console.log(this.props.posts);
        if (this.props.posts){
            posts = Object.values(this.props.posts).sort((a,b) => b.created_at - a.created_at).map((post, i) => {
               let date = new Date(post.created_at);
                return (
                    <View 
                    key={i} 
                    style={{marginTop: 100}}
                    >
                        {/* post_id parameters to send to post-details */}

                             {
                            this.state.fontLoaded ? (
                            <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}
                            
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

                            <ImageBackground 
                                source={require('./assets/eventbkgMedium.png')}
                                style={{height: 100, borderRadius: 25}} 
                                imageStyle={{ borderRadius: 25 }}
                                >
                            {
                            this.state.fontLoaded ? (
                            <TouchableHighlight style={{marginTop: 5,alignItems: 'left', justifyContent: 'left'}}
                            
                            >
                            <Text style={{fontFamily: 'Bauhaus93', fontSize: 20 }}>
                                {post.event_name.toString().trim()}
                            </Text>
                            
                            
                            
                            </TouchableHighlight>
                            ) : null
                            }

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


                            </ImageBackground>
                
                        
                        
                        {/*
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
            <ScrollView>
            
                {posts}
            </ScrollView>
            </ImageBackground>

            </View>
        );
    }

}
