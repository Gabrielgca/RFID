import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import utils from '../../utils';
import FlatList from 'flatlist-react';
import Loader from 'react-loader-spinner';
import axios from 'axios';
import baseURL from '../../service';
import './UsersRFID.css';

//pesquisa
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

//modal
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';

class UsersRFID extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterUsers: [],
            filter: '',
            selectedUser: { key: '', name: '', idade: '', cargo: '', status: '', rfid: '' },
            nome: localStorage.nome,
            cargo: localStorage.cargo,
            modalDeactivateOpen: false,
            modalReactivateOpen: false,
            people: [],
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
            pageLoading: true
        };

        this.logout = this.logout.bind(this);
    }
    async componentDidMount() {
        this.setState({ isMounted: true });

        if (!firebase.getCurrent()) {
            this.props.history.replace('/login');
            return null;
        }

        let result = await utils.getOffice(localStorage.cargo);
        if (this.state.isMounted === true) {
            this.setState({ loggedOffice: result });
        }

        if (utils.checkCategory(this.state.loggedOffice.permissoes.usuario) !== true) {
            /* alert("Você não possui permissão para acessar esta página!"); */
            this.props.history.replace('/dashboard');
            return null;
        }
        else {
            this.setState({ pageLoading: false });
        }

        /* if (this.state.cargo === "Auxiliar") {
            this.props.history.replace("/dashboard");
            return null;
        }
        else {
            alert("Acesso autorizado");
            alert(this.state.cargo)
        } */
        this.getUsersRFID();

    }

    modalOpen = async (user) => {
        this.setState({
            selectedUser: {
                key: user.id_user,
                name: user.nome,
                status: user.status,
                rfid: user.RFID,
                idade: user.idade,
                cargo: user.cargo
            }
        })
        this.setState({ modalOpen: true });
    };

    modalClose = async () => {
        this.setState({ modalOpen: false });
        this.getUsersRFID();
        this.setState({ selectedUser: { key: '', name: '', idade: '', cargo: '', status: '', rfid: '' } })
    }

    logout = async () => {
        await firebase.logout()
            .catch((error) => {
                console.log(error);
            });
        localStorage.removeItem("nome");
        this.props.history.push('/');
    }

    handleNameChange = async (event) => {
        let newName = this.state.selectedUser;
        newName.name = event.target.value;
        this.setState({ selectedUser: newName })
    }

    handleStatusChange = async (event) => {
        let newSelectedPerson = this.state.selectedUser;
        newSelectedPerson.status = event.target.value;
        this.setState({ selectedPerson: newSelectedPerson })
        this.setState({ selectedUser: newSelectedPerson })
    }

    handleOfficeChange = async (event) => {
        let newJob = this.state.selectedUser;
        newJob.cargo = event.target.value;
        this.setState({ selectedUser: newJob })
    }

    handleSaveUpdateUser = async () => {
        alert(JSON.stringify(this.state.selectedPerson))
    }


    searchUser = () => {
        this.state.filterUsers = [];
        this.state.people.forEach((user) => {
            if (user.name.toUpperCase().includes(this.state.filter.toUpperCase()) || user.name.toUpperCase() == this.state.filter.toUpperCase()) {

                let list = {
                    key: user.id_user,
                    name: user.nome,
                    idade: user.idade,
                    cargo: user.cargo,
                    status: user.status,
                    rfid: user.RFID
                }

                let array = this.state.filterUsers;
                array.push(list)
                this.setState({ filterUsers: array })
            }
        })
    }
    reactivateUser = () => {
        alert('usuario reativado');
        this.handleCloseReactivateUser();
        this.getUsersRFID();
    }
    handleCloseReactivateUser = () => {
        this.setState({ modalReactivateOpen: false });
        this.setState({ selectedUser: { key: '', name: '', idade: '', cargo: '', status: '', rfid: '' } })
    }
    handleClearFilter = () => {
        this.setState({ filterUsers: [] });
        this.setState({ filter: '' });
    }
    handleDeactivateUser = (user) => {
        this.setState({ selectedUser: { key: user.key, name: user.name, status: user.status, idade: user.idade, cargo: user.cargo, rfid: user.rfid } })
        this.setState({ modalDeactivateOpen: true })
    }
    handleCloseDeactivateUser = () => {
        this.setState({ modalOpen: false });
        this.setState({ selectedUser: { key: '', name: '', idade: '', cargo: '', status: '', rfid: '' } })
    }
    handleReactivate = (user) => {
        this.setState({ selectedUser: { key: user.key, name: user.name, status: user.status, status: user.status, cargo: user.cargo, rfid: user.rfid } })
        this.setState({ modalReactivateOpen: true })
    }
    deactivateUser = async (key) => {
        alert('usuario desativado')
        this.handleCloseDeactivateUser();
        this.getUsersRFID();
    }
    handleCloseDeactivate = () => {
        this.setState({ modalDeactivateOpen: false });
        this.setState({ selectedUser: { key: '', name: '', idade: '', cargo: '', status: '', rfid: '' } })
    }

    getUsersRFID = async () => {
        await axios.get(baseURL + 'userInfo')
            .then(response => {
                this.setState({ people: response.data.usuarios })
            })
            .catch(error => {
                alert('Error: ' + JSON.stringify(error))
            })
    }

    handleUpdateUser = async () => {
        if (this.state.selectedUser.nome !== '' &&
            this.state.selectedUser.cargo !== '' &&
            this.state.selectedUser.status !== '') {
            let params = {
                id_user: this.state.selectedUser.key,
                RFID: this.state.selectedUser.rfid,
                nome: this.state.selectedUser.name,
                idade: this.state.selectedUser.idade,
                cargo: this.state.selectedUser.cargo,
                status: this.state.selectedUser.status

            }
            //alert(JSON.stringify(params))

            await axios.post(baseURL + 'updateUser', params)
                .then(response => {
                    alert(JSON.stringify(response.data))
                    console.log(response)
                    this.modalClose();
                })
                .catch(error => {
                    console.log(error);

                })

        }
    }


    render() {
        if (this.state.pageLoading === true) {
            return (
                <div className="page-loader">
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
        else {
            return (
                <div className="container">
                    <header id="new">
                        {/* <Link to="/dashboard">Voltar</Link> */}
                        <Button startIcon={<ArrowBackIcon />} style={{ backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize" }} type="button" onClick={() => { this.props.history.push('/dashboard') }}>
                            Voltar
                        </Button>
                    </header>
                    <h1 style={{ color: '#FFF' }}>Usuários RFID</h1>
                    <Paper style={{ marginTop: 50 }}>
                        <InputBase
                            value={this.state.filter}
                            style={{ paddingLeft: 20, width: 500 }}
                            onChange={(e) => this.setState({ filter: e.target.value })}
                            placeholder="Faça uma pesquisa..."
                        />
                        <IconButton type="button" onClick={this.searchUser}>
                            <SearchIcon />
                        </IconButton>
                        <IconButton type="button" onClick={this.handleClearFilter}>
                            <ClearIcon />
                        </IconButton>
                        <IconButton type="button" onClick={() => { this.props.history.push("/usersRFID/new") }}>
                            <AddIcon style={{ color: 'green' }} />
                        </IconButton>
                    </Paper>
                    <FlatList
                        list={this.state.filterUsers.length > 0 ? this.state.filterUsers : this.state.people}
                        renderItem={(item) => (
                            <div className={item.status === "A" ? "users-rfid-card" : "users-rfid-card-disabled"}>
                                <p><b>Nome:</b> {item.nome}</p>
                                <p><b>Idade:</b> {item.idade}</p>
                                <p><b>Cargo:</b> {item.cargo}</p>
                                {item.status === 'A' ? (<p><b>Status:</b> Ativo</p>) : (<p></p>)}
                                {item.status === 'I' ? (<p><b>Status:</b> Inativo</p>) : (<p></p>)}
                                <p><b>RFID:</b> {item.RFID}</p>
                                <div className="btnArea">
                                    <Button endIcon={<EditIcon />} onClick={() => { this.modalOpen(item) }} style={{ backgroundColor: 'green', color: '#FFF', marginRight: 10 }}>Editar</Button>
                                </div>
                            </div>


                        )}
                        /* sorchBy={['status', 'cargo', 'nome']} */
                        renderWhenEmpty={() => (
                            <div className="div-loader">
                                <Loader
                                    type="Oval"
                                    //color="#ffa200"
                                    color="#FFF"
                                    height={100}
                                    width={100}
                                //timeout={3000} //3 secs
                                />
                            </div>)}
                    />
                    {/* Modal */}
                    <Dialog
                        fullWidth={true}
                        className="detailsModal"
                        open={this.state.modalOpen}
                        onClose={this.modalClose}
                        aria-labelledby="alert-dialog-title"
                        aria-aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{"Detalhes do usuário"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                <TextField
                                    autoFocus
                                    margin='dense'
                                    label='Nome'
                                    type='text'
                                    value={this.state.selectedUser.name}
                                    onChange={this.handleNameChange}
                                    fullWidth

                                />
                                <FormControl disabled>
                                    <InputLabel>Idade</InputLabel>
                                    <Input value={this.state.selectedUser.idade} />
                                </FormControl>

                                <TextField
                                    autoFocus
                                    margin='dense'
                                    label='Função'
                                    type='text'
                                    value={this.state.selectedUser.cargo}
                                    onChange={this.handleOfficeChange}
                                    fullWidth

                                />
                                <InputLabel className="selectLabel">Status</InputLabel>
                                <Select
                                    value={this.state.selectedUser.status}
                                    onChange={this.handleStatusChange}
                                >
                                    <MenuItem value="A">Ativo</MenuItem>
                                    <MenuItem value="I">Inativo</MenuItem>
                                </Select>

                                <FormControl disabled>
                                    <InputLabel>RFID</InputLabel>
                                    <Input value={this.state.selectedUser.rfid} />
                                </FormControl>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleUpdateUser} autoFocus style={{ backgroundColor: 'green', color: '#FFF' }}>Salvar</Button>
                            <Button onClick={this.modalClose} style={{ backgroundColor: 'red', color: '#FFF' }} autoFocus>
                                Cancelar
                            </Button>
                        </DialogActions>
                    </Dialog>
                    {/* Desativar usuário */}
                    <Dialog open={this.state.modalDeactivateOpen} onClose={this.handleDeactivateUser} arial-label-title="form-dialog-title">
                        <DialogTitle id='form-dialog-title'>Desetivar Usuário</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Tem certeza que deseja desativar o usuário <b>{this.state.selectedUser.name} </b>?
                        </DialogContentText>
                        </DialogContent>


                        <DialogActions>
                            <Button onClick={() => { this.deactivateUser(this.state.selectedUser.name) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                            <Button onClick={this.handleCloseDeactivate} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                        </DialogActions>
                    </Dialog>
                    {/* Reativar usuario */}
                    <Dialog open={this.state.modalReactivateOpen} onClose={this.handleReactivate} arial-label-title='form-ialog-title'>
                        <DialogTitle>
                            Reativar Usuário
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>Deseja reativar usuário <b>{this.state.selectedUser.name}</b>?</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => { this.reactivateUser(this.state.selectedUser.key) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                            <Button onClick={this.handleCloseReactivateUser} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            );
        }
    }
}
export default withRouter(UsersRFID);