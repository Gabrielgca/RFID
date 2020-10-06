import React  from 'react';
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

import utils from '../../utils';
import firebase from '../../firebase';

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
            easing: theme.transitions.easing.sharp,
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

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMounted: false,
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
            actions: [
                { icon: <ExitToApp />, name: 'Sair', action: 2 }
            ]
        }
    }

    async componentDidMount() {
        this.setState({ isMounted: true });

        if (!firebase.getCurrent()) {
            this.props.history.replace('/login');
            return null;
        }

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
    }


    render() {
        return (
            <div>
                <CssBaseline />
                <AppBar
                    color={"transparent"}
                    position="fixed"

                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"

                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            IBTI - Monitoramento
                  </Typography>
                        <Typography> {this.state.isMounted.toString()}</Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                >
                    <div>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        {actions.map((action, index) => (
                            <ListItem button key={action.name}>
                                <ListItemIcon>{index < (actions.length - 1) ? action.icon : ""}</ListItemIcon>
                                <ListItemText primary={action.name} />
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                    <List>
                        {['All mail', 'Trash', 'Spam'].map((text, index) => (
                            <ListItem button key={text}>
                                <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
            </div>
        );
    }
}