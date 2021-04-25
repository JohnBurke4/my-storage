import React from 'react'
import firebase from 'firebase'

class MePage extends React.Component {
    render() {
        return (
            <div className='container'>
                <div className='m-5 '>
                    <h1 className='text-center display-1'>Me</h1>
                </div>
                <div className='m-5'>
                    
                <button onClick={this.logout} type='button' className='btn btn-danger'>Logout</button>
                </div>
            </div>
        );
    }

    logout(event) {
        firebase.auth().signOut().then(() => {
            console.log('Sign out successful');
        }).catch((error) => {
            console.log(error);
        });
    };
}

export default MePage;