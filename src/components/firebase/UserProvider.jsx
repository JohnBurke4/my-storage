import React, {Component, createContext} from 'react'
import {generateUserDocument} from '../../api/Calls'
import {auth} from './MyFirebase'
 
export const UserContext = createContext({user:null});

class UserProvider extends Component {
    state = {
        user:null
    };

    componentDidMount = async () => {
        auth.onAuthStateChanged(async userAuth => {
          const user = await generateUserDocument(userAuth);
          //console.log(user);
          this.setState({ user });
        });
      };

    render() {
        return (
            <UserContext.Provider value={this.state.user}>
                {this.props.children}
            </UserContext.Provider>
        );
    }
}

export default UserProvider;