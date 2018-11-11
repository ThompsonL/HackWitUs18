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
import { Font } from 'expo';

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
        headerRight: <Image style={{marginRight: 10, height: 50, width: 50}} source={require('./assets/addbtnmedium.png')} title="Add Event" onPress={() => navigation.navigate('EventDetails')}/>
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
                    style={{padding: 10, marginBottom: 25, backgroundColor: '#FFF'}}
                    >
                        
                        
                        {/* post_id parameters to send to post-details */}
                            <ImageBackground 
                                source={{uri: post.image, isStatic: true}}
                                style={{height: 250, borderRadius: 25}} 
                                imageStyle={{ borderRadius: 25 }}
                                >
                            <Avatar
                            medium
                            rounded
                            source={{uri: this._gravatarURL(post)}}
                            containerStyle={{width: 25, 
                                             height: 25, 
                                             position: "absolute", 
                                             marginTop:5, 
                                             marginLeft: Dimensions.get('window').width-50}}
                            />                        
                            </ImageBackground>
                
                        <List>
                            {
                                <ListItem
                                roundAvatar
                                avatar={{uri: this._gravatarURL(post)}}
                                title={post.event_name}
                                subtitle={'By: ' + post.user_id.username}
                                rightIcon={{name: 'chevron-right', color: 'orange'}}
                                rightTitle='view more details'
                                rightTitleStyle={{color: 'orange'}}
                                onPress={() => this.props.navigation.navigate('Post', {post})}
                                >
                                </ListItem>
                            }
                        </List>
                        
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
                <Image style={{marginLeft: Dimensions.get('window').width * .80, marginTop: 35, height: 50, width: 50}} source={require('./assets/addbtnmedium.png')} title="Add Event" onPress={() => navigation.navigate('EventDetails')}>
                </Image>
                {
                    this.state.fontLoaded ? (
                    <TouchableHighlight style={{alignItems: 'center', justifyContent: 'center'}}>
                     <Text style={{paddingTop: Dimensions.get('window').height*.25, justifyContent: 'center',textAlign: 'center', fontFamily: 'Bauhaus93'  , fontSize: 32}}>
                    There are no events...
            </Text>
                    </TouchableHighlight>
                    ) :  <Text style={{paddingTop: Dimensions.get('window').height*.25, justifyContent: 'center',textAlign: 'center', fontStyle: 'italic', fontSize: 32}}>
                    There are no events...
                </Text>
                }

           
            </ImageBackground>

            </View>
            )
        }
        return( 
            <ScrollView>
             <ImageBackground
                style={{width: Dimensions.get('window').width, height:Dimensions.get('window').height}}
                source={require('./assets/eventbkmed.png')}
                >
                {posts}
            </ImageBackground>
            </ScrollView>
        );
    }

}
