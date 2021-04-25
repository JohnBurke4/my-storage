import React from 'react'
import MePage from './MePage'
import FilesPage from './FilesPage'
import UserPage from './UserPage'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom'

class Dashboard extends React.Component {


    render() {
        return (
            <Router>
      <div>
        <nav className='navbar navbar-expand-lg navbar-light bg-light'>
          <div className='container-fluid'>
            <h1 className='navbar-brand'>MyStorage</h1>
            <ul className='navbar-nav'>
            <li className='nav-item'>
              <Link className='nav-link' to="/">Files</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to="/users">Users</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to="/me">Me</Link>
            </li>
          </ul>
          </div>
          
        </nav>
        <Switch>
          

        <Route path="/" exact>
            <FilesPage />
          </Route>
          <Route path="/users">
            <UserPage />
          </Route>
          <Route path="/me">
            <MePage />
          </Route>
        </Switch>
      </div>
    </Router>
        );
    }
}

export default Dashboard;