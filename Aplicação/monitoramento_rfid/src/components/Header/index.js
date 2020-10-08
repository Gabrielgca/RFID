import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from "@material-ui/core/styles";

//Importações
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

import ExitToApp from '@material-ui/icons/ExitToApp';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import TapAndPlayIcon from '@material-ui/icons/TapAndPlay';
import ApartmentIcon from '@material-ui/icons/Apartment';
import QueuePlayNextIcon from '@material-ui/icons/QueuePlayNext';
import HomeIcon from '@material-ui/icons/Home';

import utils from '../../utils';
import firebase from '../../firebase';
import { Link } from 'react-router-dom';
import { Button, InputBase } from '@material-ui/core';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
    marginBottom: '75px'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    background: 'linear-gradient(-45deg, #F2E205 30%, #F28705 90%)',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
    color: "#FFF"
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    background: 'linear-gradient(-45deg, #F2E205 30%, #F28705 90%)',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    background: 'linear-gradient(-45deg, #F2E205 30%, #F28705 90%)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
});

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
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

    this.login = this.login.bind(this);
  }

  async componentDidMount() {
    this.setState({ isMounted: true });
    this.setState({ actions: [] });

    //alert(JSON.stringify(firebase.getCurrent()));

    if (!firebase.getCurrent()) {
      //this.props.history.replace('/login');
      let newActions = this.state.actions;
      newActions.unshift({ icon: <HomeIcon style={{ color: "#FFF" }} />, name: 'Home', action: "/" })
      this.setState({ actions: newActions });

      newActions = this.state.actions;
      newActions.push({ icon: <AccountCircleIcon style={{ color: "#FFF" }} />, name: 'Entrar', action: "/login" })
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
        newActions.unshift({ icon: <TapAndPlayIcon style={{ color: "#FFF" }} />, name: 'Gerenciar Usuários RFID', action: "/usersRFID" })
        this.setState({ actions: newActions });
      }

      if (utils.checkCategory(this.state.loggedOffice.permissoes.setor) === true) {
        let newActions = this.state.actions;
        newActions.unshift({ icon: <ApartmentIcon style={{ color: "#FFF" }} />, name: "Gerenciar Setores", action: "/sectors" })
        this.setState({ actions: newActions });
      }

      if (utils.checkCategory(this.state.loggedOffice.permissoes.dispositivo) === true) {
        let newActions = this.state.actions;
        newActions.unshift({ icon: <QueuePlayNextIcon style={{ color: "#FFF" }} />, name: 'Gerenciar Dispositivos', action: "/devices" })
        this.setState({ actions: newActions });
      }

      if (utils.checkCategory(this.state.loggedOffice.permissoes.conta) === true) {
        let newActions = this.state.actions;
        newActions.unshift({ icon: <AccountCircleIcon style={{ color: "#FFF" }} />, name: 'Gerenciar Contas', action: "/users" })
        this.setState({ actions: newActions });
      }

      if (utils.checkCategory(this.state.loggedOffice.permissoes.cargo) === true) {
        let newActions = this.state.actions;
        newActions.unshift({ icon: <HowToRegIcon style={{ color: "#FFF" }} />, name: 'Gerenciar Cargos', action: "/offices" })
        this.setState({ actions: newActions });
      }

      let newActions = this.state.actions;
      newActions.push({ icon: <ExitToApp style={{ color: "#FFF" }} />, name: 'Sair', action: "/sair" })
      this.setState({ actions: newActions });

      newActions = this.state.actions;
      newActions.unshift({ icon: <HomeIcon style={{ color: "#FFF" }} />, name: 'Dashboard', action: "/dashboard" })
      this.setState({ actions: newActions });
    }

    /* await firebase.getUserName((info) => {
      localStorage.nome = info.val().nome;
      this.setState({ nome: localStorage.nome });
    }); */

  }

  logout = async () => {
    await firebase.logout()
      .catch((error) => {
        console.log(error);
      });
    localStorage.removeItem("nome");
    this.setState({ isLogged: false }); //PAREI AQUI, VOU USAR O IS LOGGED PARA CONTROLAR O DIDMOUNT DO HEADER
    window.location.replace("/");
  }

  login = async () => {
    const { email, password } = this.state;

    try {
      await firebase.login(email, password)
        .catch((error) => {
          if (error.code === 'auth/user-not-found') {
            alert('Este usuario não existe!');
          } else {
            alert('Codigo de erro:' + error.code);
            return null;
          }
        });
      //this.props.history.replace('/dashboard');
      window.location.reload("/dashboard");

    } catch (error) {
      alert(error.message);
    }

  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          color={"green"}
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: this.state.open,
          })}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerOpen}
              edge="start"
              className={clsx(classes.menuButton, {
                [classes.hide]: this.state.open,
              })}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap style={{ color: "#FFF" }}>
              IBTI - Monitoramento
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: this.state.open,
            [classes.drawerClose]: !this.state.open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: this.state.open,
              [classes.drawerClose]: !this.state.open,
            }),
          }}
        >
          <div className={classes.toolbar}>
            <IconButton onClick={this.handleDrawerClose}>
              {/* {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />} */}
              <ChevronLeftIcon style={{ color: "#FFF" }} />

            </IconButton>
          </div>
          <Divider />
          <List>
            {firebase.getCurrent() !== null ? (
              this.state.actions.map((action, index) => {
                if (index < (this.state.actions.length - 1)) {
                  return (
                    <Link to={action.action} style={{ textDecoration: "none" }}>
                      <ListItem button key={action.action} style={{ color: "#FFF" }}>
                        <ListItemIcon>{action.icon}</ListItemIcon>
                        {/* <ListItemIcon>{index < (this.state.actions.length - 1) ? action.icon : ""}</ListItemIcon> */}
                        <ListItemText style={{ textDecoration: "none" }} primary={action.name} />
                      </ListItem>
                    </Link>
                  );
                }
                else {
                  return (
                    <ListItem button onClick={() => { this.logout() }}>
                      <ListItemIcon>{<ExitToApp style={{ color: "#FFF" }} />}</ListItemIcon>
                      {/* <ListItemIcon>{index < (this.state.actions.length - 1) ? action.icon : ""}</ListItemIcon> */}
                      <ListItemText style={{ color: "#FFF" }} primary="Sair" />
                    </ListItem>
                  );
                }
              })
            ) : ""}
          </List>
          {firebase.getCurrent() === null ? (
            <List>
              <Link to={"/dashboard"} style={{ textDecoration: "none" }}>
                <ListItem button>
                  <ListItemIcon>{<HomeIcon />}</ListItemIcon>
                  {/* <ListItemIcon>{index < (this.state.actions.length - 1) ? action.icon : ""}</ListItemIcon> */}
                  <ListItemText style={{ color: "#FFF" }} primary={"Login"} />
                </ListItem>
              </Link>
            </List>
          ) : ""}
        </Drawer>
      </div>
    );
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Header);