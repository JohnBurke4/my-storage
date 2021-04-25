import logo from './logo.svg';
import './App.css';
import React from 'react'
import UserProvider from './components/firebase/UserProvider';
import Application from './components/Application';

function App() {
  return (
    <UserProvider>
      <Application/>
    </UserProvider>
  );
}
 export default App;
