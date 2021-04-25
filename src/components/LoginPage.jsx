import React from 'react'
import {auth} from './firebase/MyFirebase';
import {getUserPrivateKeyAndDecrypt} from '../api/Calls'
import firebase from 'firebase'

class LoginPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            email:'',
            password:'',
            loginError: false,
        }
        this.updateEmail = this.updateEmail.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.submitSignIn = this.submitSignIn.bind(this);
    }

    render() {
        return (
            <div className='container'>
                <div className='m-5 '>
                    <h1 className='text-center display-1'>Please Login</h1>
                </div>
                <form>
                    <div className="mb-3">
                        <label for="exampleInputEmail1" className="form-label">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={this.state.email} onChange={this.updateEmail}></input>
                        <div id="emailHelp" className="form-text">This is kept securely in our vault.</div>
                    </div>
                    <div className="mb-3">
                        <label for="exampleInputPassword1" className="form-label">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" value={this.state.password} onChange={this.updatePassword}></input>
                        {this.state.loginError &&  <div id="loginFailed" className="form-text text-danger" >Your email and password are incorrect.</div>}
                    </div>
                    <button type="submit" className="btn btn-primary mt-4" onClick={this.submitSignIn}>Submit</button>
                </form>
            </div>
        );
    }

    submitSignIn(event) {
        event.preventDefault();
        auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).then(() => {
            auth.signInWithEmailAndPassword(this.state.email, this.state.password).then(async () => {
                await getUserPrivateKeyAndDecrypt(this.state.password);
            })
            .catch(error => {
                this.setState({
                    loginError: true
                });
                console.error("Error signing in with password and email", error);
            });
        });
        
        
    }

    updateEmail(event){
        this.setState({email: event.target.value});
    }

    updatePassword(event){
        this.setState({password: event.target.value});
    }
}

const Login = () => {
    
}


export default LoginPage;