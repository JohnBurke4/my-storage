
import React, {useContext} from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'
import { UserContext } from './firebase/UserProvider';
import Dashboard from './Dashboard'
import LoginDashboard from './LoginDashboard';

function Application() {
  const user = useContext(UserContext);
  return (

    <Router>
      <Switch>
          {user ? (
            <Route path='/' exact component={Dashboard} ></Route>
          ) : (
<Route path='/' exact component={LoginDashboard} ></Route>
          )}
      </Switch>
    </Router>
  );
}

export default Application;