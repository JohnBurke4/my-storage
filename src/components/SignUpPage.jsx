import React from 'react'
import {auth} from './firebase/MyFirebase';
import {getUserPrivateKeyAndDecrypt, saveUserKeys} from '../api/Calls'
import AES from 'crypto-js/aes';
import NodeRSA from 'node-rsa';
import firebase from 'firebase';
import { UserContext } from './firebase/UserProvider';

class SignUpPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            email:'',
            password:'',
            encryptedKey:'',
            publicKey:'',
            confirmPassword:'',
            failedPassword: false,
            failedEmail: false,
            user: null,
        }
        this.updateEmail = this.updateEmail.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.updateConfirmPassword = this.updateConfirmPassword.bind(this);
        this.submitSignUp = this.submitSignUp.bind(this);
        this.updateData = this.updateData.bind(this);
    }
    render() {
        return (
            <div className='container'>
                <div className='m-5 '>
                    <h1 className='text-center display-1'>Create an Account</h1>
                </div>
                <form>
                    <div className="mb-3">
                        <label for="exampleInputEmail1" className="form-label">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={this.state.email} onChange={this.updateEmail}></input>
                        {!this.state.failedEmail && <div id="emailHelp" className="form-text">This is kept securely in our vault.</div>}
                        {this.state.failedEmail && <div id="emailError" className="form-text text-danger">Please input a correct email address.</div>}
                    </div>
                    <div className="mb-3">
                        <label for="exampleInputPassword1" className="form-label">Choose a password:</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" value={this.state.password} onChange={this.updatePassword}></input>
                    </div>
                    <div className="mb-3">
                        <label for="exampleInputPassword1" className="form-label">Confirm your password:</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" value={this.state.confirmPassword} onChange={this.updateConfirmPassword}></input>
                        {this.state.failedPassword &&  <div id="passwordIncorrect" className="form-text text-danger" >Your password's do not match or are not at least 6 characters long</div>}
                    </div>
                    <button type='button' className="btn btn-primary mt-4" onClick={this.submitSignUp}>Submit</button>
                </form>
            </div>
        );
    }

    submitSignUp() {
        if (this.state.password !== this.state.confirmPassword || this.state.password.length < 6){
            this.setState({failedPassword: true});
        }
        else {
            this.setState({failedPassword: false});
            if (this.validateEmail(this.state.email)){
                this.setState({failedEmail: false});
                this.signUp(this.state.email, this.state.password);
            }
            else {
                this.setState({failedEmail: true});
            }
        }
    }

    signUp = (email, password)  => {
        try{
            auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).then(async () => {
                const {user} = auth.createUserWithEmailAndPassword(email, password);
                const key = NodeRSA({b:512});
                const privateKey = key.exportKey('private').toString();
                const publicKey = key.exportKey('public').toString();
                const encrypted = AES.encrypt(privateKey, password).toString();
                this.setState({
                    publicKey: publicKey,
                    encryptedKey: encrypted,
                });
            });
          

        }
        catch(error){
          console.log(error);
        }
      }

      

    componentWillUnmount(){
        this.updateData();
    }

    updateData = async () => {
        await saveUserKeys(this.state.publicKey, this.state.encryptedKey);
        await getUserPrivateKeyAndDecrypt(this.state.password);
    }

    updateEmail(event){
        this.setState({email: event.target.value});
    }

    updatePassword(event){
        this.setState({password: event.target.value});
    }

    updateConfirmPassword(event){
        this.setState({confirmPassword: event.target.value});
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
}

SignUpPage.contextType = UserContext;

export default SignUpPage;