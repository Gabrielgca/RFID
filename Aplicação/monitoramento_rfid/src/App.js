import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import firebase from './firebase';

import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NewUser from './components/NewUser';
import Header from './components/Header';
import NewRFID from './components/NewRFID';
import NewOffice from './components/NewOffice';
import Users from './components/Users';
import UsersRFID from './components/UsersRFID';
import Offices from './components/Offices';
import Sectors from './components/Sectors';
import NewSector from './components/NewSector';
import Devices from './components/Devices';
import NewDevices from './components/NewDevices';
import Hora from './components/Mask'

import './global.css';
import './App.css';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';

class App extends Component {

  state = {
    firebaseInitialized: false
  };

  componentDidMount() {
    firebase.isInitialized().then(resultado => {
      // Devolve o usuario
      this.setState({ firebaseInitialized: resultado });
    })
  }

  render() {
    return this.state.firebaseInitialized !== false ? (
      <BrowserRouter>
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/dashboard" component={Dashboard} />

          <Route exact path="/usersRFID" component={UsersRFID} />
          <Route exact path="/usersRFID/new" component={NewRFID} />

          <Route exact path="/users" component={Users} />
          <Route exact path="/users/new" component={NewUser} />

          <Route exact path="/offices" component={Offices} />
          <Route exact path="/offices/new" component={NewOffice} />

          <Route exact path="/sectors" component={Sectors} />
          <Route exact path="/sectors/new" component={NewSector} />

          <Route exact path="/devices" component={Devices} />
          <Route exact path="/devices/new" component={NewDevices} />

          <Route exact path='/hora' component={Hora}/>
        </Switch>
      </BrowserRouter>
    ) : (
        <div id="loading">
          <Loader
            type="Oval"
            //color="#ffa200"
            color="#FFF"
            height={100}
            width={100}
          //timeout={3000} //3 secs

          />
        </div>
      );
  }
}

export default App;
