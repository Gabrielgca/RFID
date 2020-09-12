import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import firebase from './firebase';

import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import Header from './components/Header';
import NewRFID from './components/NovoRFID';
import Users from './components/Users';
import UsersRFID from './components/UsersRFID';
import socket from './components/soketTeste';
import TesteSocket from './components/soketTeste/teste-socket-io';
import CadastroDispRFID from './components/CadastroDispRFID';
//import Offices from './components/Offices';

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
          <Route exact path="/register" component={Register} />
          <Route exact path="/dashboard/new" component={NewRFID} />
          <Route exact path="/users" component={Users} />
          <Route exact path="/users-rfid" component={UsersRFID}/>
          {/* <Route exact path="/socket" component={socket}/> */}
          <Route exact path="/testesocket" component={TesteSocket}/>
          <Route exact path="/cadastro-dispositivo" component={CadastroDispRFID}/>
          {/* <Route exact path="/offices" component={Offices} /> */}
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
