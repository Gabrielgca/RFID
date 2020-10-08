import React, { useState, useEffect, Component } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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
import { Link, Redirect } from 'react-router-dom';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginBottom: '75px'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      //easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
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
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
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
}));

export default function Header() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState([{ icon: <ExitToApp />, name: 'Sair', action: 2 }]);
  const [cargo, setCargo] = useState(localStorage.cargo);
  const [isMounted, setIsMounted] = useState(false);
  const [loggedOffice, setLoggedOffice] = useState(
    {
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
    }
  );

  const handleIsMounted = () => {
    setIsMounted(!isMounted);
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        color={"transparent"}
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap style={{color: "#FFF"}}>
            IBTI - Monitoramento
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <Divider />
        <MenuList></MenuList>
      </Drawer>
    </div>
  );
}

class MenuList extends Component {
  state = {
    isMounted: false,
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
    }
  }

  async componentDidMount() {
    this.setState({ isMounted: true });

    /* if (!firebase.getCurrent()) {
      //this.props.history.replace('/login');
      return null;
    } */

    /* await firebase.getUserName((info) => {
      localStorage.nome = info.val().nome;
      this.setState({ nome: localStorage.nome });
    }); */

    if()

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
      newActions.unshift({ icon: <TapAndPlayIcon />, name: 'Gerenciar Usuários RFID', action: 4 })
      this.setState({ actions: newActions });
    }

    if (utils.checkCategory(this.state.loggedOffice.permissoes.setor) === true) {
      let newActions = this.state.actions;
      newActions.unshift({ icon: <ApartmentIcon />, name: "Gerenciar Setores", action: 5 })
      this.setState({ actions: newActions });
    }

    if (utils.checkCategory(this.state.loggedOffice.permissoes.dispositivo) === true) {
      let newActions = this.state.actions;
      newActions.unshift({ icon: <QueuePlayNextIcon />, name: 'Gerenciar Dispositivos', action: 6 })
      this.setState({ actions: newActions });
    }

    if (utils.checkCategory(this.state.loggedOffice.permissoes.conta) === true) {
      let newActions = this.state.actions;
      newActions.unshift({ icon: <AccountCircleIcon />, name: 'Gerenciar Contas', action: 1 })
      this.setState({ actions: newActions });
    }

    if (utils.checkCategory(this.state.loggedOffice.permissoes.cargo) === true) {
      let newActions = this.state.actions;
      newActions.unshift({ icon: <HowToRegIcon />, name: 'Gerenciar Cargos', action: 3 })
      this.setState({ actions: newActions });
    }

    let newActions = this.state.actions;
    newActions.push({ icon: <ExitToApp />, name: 'Sair', action: 2 });
    this.setState({ actions: newActions });

    newActions = this.state.actions;
    newActions.unshift({ icon: <HomeIcon />, name: 'Dashboard', action: 7 });
    this.setState({ actions: newActions });

  }

  handleNavigate = (action) => {
    //alert(JSON.stringify(action));
    if (action === 1) {
      this.setState({ open: false });
      //      this.props.history.push("/users");
      window.location.replace("/users");
      //alert("Função Novo RFID");
    }
    else {
      if (action === 2) {
        this.logout();
        //alert("Função Sair");
      }
      else {
        if (action === 3) {
          window.location.replace("/offices");
          //this.props.history.push("/offices");
        }
        else {
          if (action === 4) {
            window.location.replace("/usersRFID");
            //this.props.history.push("/usersRFID");
          }
          else {
            if (action === 5) {
              window.location.replace("/sectors");
              //this.props.history.push("/sectors");
            }
            else {
              if (action === 6) {
                window.location.replace("/devices");
                //this.props.history.push("/devices");
              }
              else {
                if (action === 7) {
                  window.location.replace("/dashboard");
                }
              }
            }
          }
        }
      }
    }
  };

  render() {
    //const UsersRFIDRoute = props => <Link to="/users" route {...props} />;

    return (
      <div>
        {this.state.actions.map((action) => {
          return (
            <ListItem button key={action.name} onClick={() => { this.handleNavigate(action.action) }}>
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText primary={action.name} />
            </ListItem>
          );
        })}
      </div>
    );
  }
}

//const CustomLink = props => <Link to="/users" {...props} />;