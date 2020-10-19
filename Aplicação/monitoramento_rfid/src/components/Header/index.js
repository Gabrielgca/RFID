import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './header.css';

//Importações
import AppBar from '@material-ui/core/AppBar';

import ExitToApp from '@material-ui/icons/ExitToApp';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import TapAndPlayIcon from '@material-ui/icons/TapAndPlay';
import ApartmentIcon from '@material-ui/icons/Apartment';
import QueuePlayNextIcon from '@material-ui/icons/QueuePlayNext';
import HomeIcon from '@material-ui/icons/Home';

import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import AddIcon from '@material-ui/icons/Add';
import { FaHome, FaLaptop } from 'react-icons/fa';

import utils from '../../utils';
import firebase from '../../firebase';
import { Link, withRouter } from 'react-router-dom';
import { Button, InputBase } from '@material-ui/core';

const drawerWidth = 240;

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isMounted: false,
      open: false,
      actions: [],
      cargo: localStorage.cargo,
      loggedOffice: {
        key: '',
        nomeCargo: '',
        status: '',
        permissoes: {
          cargo: [],
          conta: [],
          dispositivo: [],
          setor: [],
          usuario: [],
          dashboard: []
        }
      },
      isLogged: false
    }

  }

  async componentDidMount() {
    this.setState({ isMounted: true });
    this.setState({ actions: [] });

    //alert(JSON.stringify(firebase.getCurrent()));

    if (!firebase.getCurrent()) {
      //this.props.history.replace('/login');
      let newActions = this.state.actions;
      newActions.unshift({ icon: <HomeIcon className="my-float" style={{ color: "#008C35" }} />, name: 'Home', action: 7 })
      this.setState({ actions: newActions });

      newActions = this.state.actions;
      newActions.push({ icon: <AccountCircleIcon className="my-float" style={{ color: "#008C35" }} />, name: 'Entrar', action: 9 })
      this.setState({ actions: newActions });

      //return null;
    }
    else {
      await firebase.getUserPerfil((info) => {
        localStorage.cargo = info.val();
        this.setState({ cargo: localStorage.cargo });
        //console.log("Valor recebido: " + info.val());
      });

      //await this.getOffice();
      let result = await utils.getOffice(this.state.cargo);
      if (this.state.isMounted === true) {
        this.setState({ loggedOffice: result });
      }

      if (utils.checkCategory(this.state.loggedOffice.permissoes.usuario) === true) {
        let newActions = this.state.actions;
        newActions.unshift({ icon: <TapAndPlayIcon className="my-float" style={{ color: "#008C35" }} />, name: 'Gerenciar Usuários RFID', action: 4 })
        this.setState({ actions: newActions });
      }

      if (utils.checkCategory(this.state.loggedOffice.permissoes.setor) === true) {
        let newActions = this.state.actions;
        newActions.unshift({ icon: <ApartmentIcon className="my-float" style={{ color: "#008C35" }} />, name: "Gerenciar Setores", action: 5 })
        this.setState({ actions: newActions });
      }

      if (utils.checkCategory(this.state.loggedOffice.permissoes.dispositivo) === true) {
        let newActions = this.state.actions;
        newActions.unshift({ icon: <QueuePlayNextIcon className="my-float" style={{ color: "#008C35" }} />, name: 'Gerenciar Dispositivos', action: 6 })
        this.setState({ actions: newActions });
      }

      if (utils.checkCategory(this.state.loggedOffice.permissoes.conta) === true) {
        let newActions = this.state.actions;
        newActions.unshift({ icon: <AccountCircleIcon className="my-float" style={{ color: "#008C35" }} />, name: 'Gerenciar Contas', action: 1 })
        this.setState({ actions: newActions });
      }

      if (utils.checkCategory(this.state.loggedOffice.permissoes.cargo) === true) {
        let newActions = this.state.actions;
        newActions.unshift({ icon: <HowToRegIcon className="my-float" style={{ color: "#008C35" }} />, name: 'Gerenciar Cargos', action: 3 })
        this.setState({ actions: newActions });
      }

      let newActions = this.state.actions;
      newActions.push({ icon: <ExitToApp className="my-float" style={{ color: "#008C35" }} />, name: 'Sair', action: 1 })
      this.setState({ actions: newActions });

      newActions = this.state.actions;
      newActions.unshift({ icon: <HomeIcon className="my-float" style={{ color: "#008C35" }} />, name: 'Dashboard', action: 8 })
      this.setState({ actions: newActions });
    }

    /* await firebase.getUserName((info) => {
      localStorage.nome = info.val().nome;
      this.setState({ nome: localStorage.nome });
    }); */

  }

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = (action) => {
    if (action === 1) {
      this.setState({ open: false });
      this.props.history.push("/users");
      //alert("Função Novo RFID");
    }
    else {
      if (action === 2) {
        this.logout();
        //alert("Função Sair");
      }
      else {
        if (action === 3) {
          this.props.history.push("/offices");
        }
        else {
          if (action === 4) {
            this.props.history.push("/usersRFID");
          }
          else {
            if (action === 5) {
              this.props.history.push("/sectors");
            }
            else {
              if (action === 6) {
                this.props.history.push("/devices");
              }
              else {
                if (action === 7) {
                  this.props.history.push("/");
                }
                else {
                  if (action === 8) {
                    this.props.history.push("/dashboard");
                  }
                  else{
                    if(action === 9){
                      this.props.replace("/login");
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  logout = async () => {
    await firebase.logout()
      .catch((error) => {
        console.log(error);
      });
    localStorage.removeItem("nome");
    this.setState({ isLogged: false }); //PAREI AQUI, VOU USAR O IS LOGGED PARA CONTROLAR O DIDMOUNT DO HEADER
    window.location.replace("/");
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <AppBar position="static" color={"transparent"} elevation={0}>
        <header id="main-header">
          <div className="header-content">
            {/* <SpeedDial
              className="speed-dial"
              ariaLabel="SpeedDial tooltip example"
              hidden={false}
              icon={<SpeedDialIcon />}
              onClose={() => { this.setState({ open: false }) }}
              onOpen={this.handleOpen}
              open={this.state.open}
              direction={"down"}
            >
              {this.state.actions.map((action) => (
                <SpeedDialAction
                  className="speed-dial-action-button"
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  onClick={() => { this.handleClose(action.action) }}
                  tooltipPlacement={"right"}
                />
              ))}
            </SpeedDial> */}

            <a href="#" class="float" id="menu-share">
              <img src={require("../../logo.png")} />
            </a>
            <ul>
              {this.state.actions.map((action) => {
                return (
                  <li>
                    {action.action === "sair" ? (
                      <a href={action.action} onClick={() => { this.logout() }}>
                        {action.icon}
                      </a>
                    ) : (
                        /*  <a href={action.action}>
                           {action.icon}
                         </a> */
                        <a style={{ cursor: "pointer" }} onClick={() => { this.handleClose(action.action) }}>
                          {action.icon}
                        </a>
                      )}
                  </li>
                )
              })}
            </ul>
            <ul className="header-title">
              <li>
                <a href="/">
                  Instituto Brasília de Tecnologia e Inovação
                  </a>
              </li>
            </ul>
          </div>
        </header>
      </AppBar>
    );
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(Header);