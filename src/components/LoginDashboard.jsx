import React from 'react'
import LoginPage from './LoginPage'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom'
import SignUpPage from './SignUpPage';

class LoginDashboard extends React.Component {
    render() {
        return (
            <Router>
      <div>
        <nav className='navbar navbar-expand-lg navbar-light bg-light'>
          <div className='container-fluid'>
            <h1 className='navbar-brand'>MyStorage</h1>
            <ul className='navbar-nav'>
            <li className='nav-item'>
              <Link className='nav-link' to="/">Log in</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to="/signup">Sign up</Link>
            </li>
          </ul>
          </div>
          
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          

        <Route path="/" exact>
            <LoginPage />
          </Route>
          <Route path="/signup">
            <SignUpPage />
          </Route>
        </Switch>
      </div>
    </Router>
        );
    }
}

export default LoginDashboard;;