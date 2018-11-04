import React,  { Component } from 'react';
import { Alert, Button , ScrollView } from 'react-native';
import { List, ListItem, Icon} from 'react-native-elements';
import * as firebase from 'firebase';

import { Permissions, Contacts }  from 'expo';

import { connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';

@firebaseConnect()
class AddContactsScreen extends Component {
    state = { fetchedContacts: [],
              contacts: null,
              count: null          
    };

    static navigationOptions = ({ navigation }) => ({
        title: 'Add Contacts',
        headerLeft: <Button title="Done" onPress={() => navigation.goBack() } />
    });

    componentDidMount() {
       /* Contacts.getAll((err, fetchedContacts) => {
        let contacts = [];
        fetchedContacts.forEach((contacted) => {
            if (contacted.emailAddresses.length > 0) {
                contacts.push(contact);
                console.log( contact );

            }
        });
        this.setState({ contacts });
      });*/
      this.showFirstContactAsync();
    }

    async showFirstContactAsync() {
        // Ask for permission to query contacts.
        const permission = await Permissions.askAsync(Permissions.CONTACTS);
        let fetchedContacts = [];
        if (permission.status !== 'granted') {
          // Permission was denied...
          return;
        }
        const contacts = await Contacts.getContactsAsync({
          fields: [
            Contacts.PHONE_NUMBERS,
            Contacts.EMAILS,
          ],
          pageSize: 10000,
          pageOffset: 0,
        })
        console.log(contacts.total)
        console.log(JSON.stringify(contacts))
        for (let index = 0; index <= contacts.total-1; index++) {
            try {
                if(contacts.data[index].emails){

                    fetchedContacts.push(contacts.data[index]);
                }
            } catch (error) {
                //do nothing
            }
            
            
        }
        console.log(fetchedContacts.length);
        console.log(fetchedContacts);
        this.setState({ fetchedContacts });
        /*if (contacts.total > 0) {
          Alert.alert(
            'Your first contact is...',
            `Name: ${contacts.data[0].name}\n` +
            `Phone numbers: ${contacts.data[0].phoneNumbers[0].number}\n` +
            `Emails: ${contacts.data[0].emails[0].email}`
          );
        }*/
      }

    render(){
        return(
            <ScrollView>
                <List>
                    {
                        this.state.fetchedContacts.map((contact, i) =>(
                            <ListItem
                            key={i}
                            roundAvatar
                            avatar={contact.imageAvailabe ? contact.image : null}
                            leftIcon={contact.imageAvailabe ? null : {name: 'account-circle'}}
                            title={contact.name}
                            subtitle={contact.emails[0].email}
                            button
                            onPress={() => this._addContact(contact.emails[0].email)}
                            hideChevron
                            />
                        ))
                    }
                </List>
            </ScrollView>
        );
    }

    async _addContact(email) {
        console.log(email);
        let newContact = await this.getRef().orderByChild('email').equalTo(email)
        .limitToFirst(1).once('value');
        console.log(newContact);
        console.log(this.props.profile);
        if (newContact.val()) {
            let updates = {};
            let following = this.props.profile.following || [];
            following.push(email);
            console.log(following);
            updates['/profiles/' + this.props.auth.uid + '/following'] = following;
            this.getRef().update(updates);
        }
    }

    getRef(){
        return firebase.database().ref();  //in firebase documentation
      }
    
}

const MapStateToProps = (state) => {
    console.log(state);
    return {
      auth: state.firebase.auth,  // auth passed as props.auth
      profile: state.firebase.profile // profile passed as props.profile
    }
  }

export default connect(MapStateToProps)(AddContactsScreen)
