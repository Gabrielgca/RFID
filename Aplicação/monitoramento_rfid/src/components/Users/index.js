import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import './users.css';

import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import BlockIcon from '@material-ui/icons/Block';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';


import FlatList from 'flatlist-react';


class Users extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nome: localStorage.nome,
            cargo: localStorage.cargo,
            users: [],
            filteredUsers: [],
            offices: [],
            selectedUser: { key: '', cargo: '', nome: '', status: '' },
            filter: '',
            modalOpen: false,
            modalDeactivateOpen: false,
            modalReactivateOpen: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleClearFilter = this.handleClearFilter.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleDeactivateUserOpen = this.handleDeactivateUserOpen.bind(this);
        this.handleReactivateUser = this.handleReactivateUser.bind(this);
    }

    handleClickOpen = (user) => {
        this.setState({ selectedUser: { key: user.key, cargo: user.cargo, nome: user.nome, status: user.status } });
        this.setState({ modalOpen: true });
        this.getOffices();
    };

    handleClose = () => {
        this.setState({ modalOpen: false });
        this.setState({ selectedUser: { key: '', cargo: '', nome: '', status: '' } });
    };

    handleCloseDeactivate = () => {
        this.setState({ modalDeactivateOpen: false });
        this.setState({ selectedUser: { key: '', cargo: '', nome: '', status: '' } });
    }

    handleClearFilter = () => {
        this.setState({ filteredUsers: [] });
        this.setState({ filter: '' });
    };

    handleChange = (event) => {
        //setAge(event.target.value);
        let newObject = this.state.selectedUser;
        newObject.cargo = event.target.value;
        this.setState({ selectedUser: newObject });
    };

    handleUpdate = () => {
        //alert("Novos dados: " + JSON.stringify(this.state.selectedUser));
        const { key } = this.state.selectedUser;
        firebase.updateUser(key, this.state.selectedUser.nome, this.state.selectedUser.cargo, this.state.selectedUser.status);
        this.handleClose();
        this.getUsers();
    }

    getOffices = () => {
        this.setState({ offices: [] });
        firebase.getAllOffices((allOffices) => {
            allOffices.forEach((oneOffice) => {
                let list = {
                    key: oneOffice.key,
                    nomeCargo: oneOffice.val().nomeCargo
                }
                //alert(JSON.stringify(list));
                this.setState({ offices: [...this.state.offices, list] });
            });
        });
    }

    async componentDidMount() {
        if (!firebase.getCurrent()) {
            this.props.history.replace('/login');
            return null;
        }

        firebase.getUserName((info) => {
            localStorage.nome = info.val().nome;
            this.setState({ nome: localStorage.nome });
        });

        firebase.getUserPerfil((info) => {
            localStorage.cargo = info.val().cargo;
            this.setState({ cargo: localStorage.cargo });
        });

        /* if (this.state.cargo === "Administrador" || this.state.cargo === "Gestor") {
            alert("Acesso autorizado");
        }
        else {
            this.props.history.replace("/dashboard");
            return null;
        } */

        firebase.getAllUsers((allUsers) => {
            allUsers.forEach((oneUser) => {
                //alert("Key: " + oneUser.key);
                let list = {
                    key: oneUser.key,
                    nome: oneUser.val().nome,
                    cargo: oneUser.val().cargo,
                    status: oneUser.val().status
                }
                this.setState({ users: [...this.state.users, list] });
            })
        });
    }

    getUsers = () => {
        this.setState({ users: [] });
        firebase.getAllUsers((allUsers) => {
            allUsers.forEach((oneUser) => {
                //alert("Key: " + oneUser.key);
                let list = {
                    key: oneUser.key,
                    nome: oneUser.val().nome,
                    cargo: oneUser.val().cargo,
                    status: oneUser.val().status,
                }
                this.setState({ users: [...this.state.users, list] });
            })
        });
    }

    handleDeactivateUserOpen = (user) => {
        this.setState({ selectedUser: { key: user.key, cargo: user.cargo, nome: user.nome, status: user.status } });
        this.setState({ modalDeactivateOpen: true });
    }

    handleCloseReactivate = () => {
        this.setState({ modalReactivateOpen: false });
        this.setState({ selectedUser: { key: '', cargo: '', nome: '', status: '' } });
    }

    handleReactivateUser = (user) => {
        this.setState({ selectedUser: { key: user.key, cargo: user.cargo, nome: user.nome, status: user.status } });
        this.setState({ modalReactivateOpen: true });
    }

    deactivateUser = async (key) => {
        if (key !== firebase.getCurrentUid()) {
            //alert("Pode excluir\nKey: " + key + "\nLoggedKey: " + firebase.getCurrentUid());
            await firebase.deactivateUser(key);
            alert("Usuário deletado com sucesso!");
            this.handleCloseDeactivate();
            this.getUsers();
        }
        else {
            alert("Desculpe, você não pode excluir o seu próprio usuário!");
            this.handleCloseDeactivate();
        }
    }

    reactivateUser = async (key) => {
        await firebase.reactivateUser(key);
        alert("Usuário reativado com sucesso!");
        this.handleCloseReactivate();
        this.getUsers();
    }

    searchUser = () => {
        //alert(this.state.filter);
        //this.setState({ filteredUsers: emptyArray });
        this.state.filteredUsers = [];
        this.state.users.forEach((user) => {
            if (user.nome.toUpperCase().includes(this.state.filter.toUpperCase()) || user.nome.toUpperCase() == this.state.filter.toUpperCase() || user.cargo.toUpperCase().includes(this.state.filter.toUpperCase()) || user.cargo.toUpperCase() == this.state.filter.toUpperCase()) {
                let list = {
                    key: user.key,
                    nome: user.nome,
                    cargo: user.cargo,
                    status: user.status
                }
                //alert(JSON.stringify(list));
                let array = this.state.filteredUsers;
                array.push(list);
                this.setState({ filteredUsers: array });
                //alert(JSON.stringify(list));
            }
        });
    }

    render() {
        return (
            <div className="container">
                <header id="new">
                    {/* <Link to="/dashboard">Voltar</Link> */}
                    <Button startIcon={<ArrowBackIcon />} style={{ backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize" }} type="button" onClick={() => { this.props.history.goBack() }}>
                        Voltar
                    </Button>
                </header>
                <h1 style={{ color: '#FFF' }}>Usuários de Conta</h1>
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

                    <IconButton type="button" onClick={() => { this.props.history.push("/users/new") }}>
                        <AddIcon style={{ color: 'green' }} />
                    </IconButton>
                </Paper>

                <FlatList
                    list={this.state.filteredUsers.length > 0 ? this.state.filteredUsers : this.state.users}
                    renderItem={(item) => (
                        <div className={item.status === 'Ativo' ? "card" : "card-disabled"} key={item.key}>
                            <p><b>Nome: </b>{item.nome}</p>
                            <p><b>Cargo: </b>{item.cargo}</p>
                            <p><b>Status: </b>{item.status}</p>
                            <div className="buttonsArea">
                                {/* <button className="addButton" onClick={() => { this.handleClickOpen(item) }}>Editar</button> */}
                                <Button endIcon={<EditIcon />} onClick={() => { this.handleClickOpen(item) }} style={{ backgroundColor: 'green', color: '#FFF', marginRight: 10 }}>
                                    Editar
                                </Button>

                                {item.status === 'Ativo' ? (
                                    <Button endIcon={<BlockIcon />} onClick={() => { this.handleDeactivateUserOpen(item) }} style={{ backgroundColor: 'red', color: '#FFF' }}>
                                        Desativar
                                    </Button>
                                ) : (
                                        <Button endIcon={<CheckCircleOutlineIcon />} onClick={() => { this.handleReactivateUser(item) }} style={{ backgroundColor: 'blue', color: '#FFF' }}>
                                            Reativar
                                        </Button>
                                    )
                                }
                                {/* <button className="deleteButton" onClick={() => { this.handleDeactivateUserOpen(item) }}>Excluir</button> */}
                            </div>
                        </div>
                    )}
                    renderWhenEmpty={() => <div>Carregando...</div>}
                    //sortBy={["item.cargo", { key: "lastName", descending: true }]}
                    sortBy={["status", "cargo", "nome"]}
                //groupBy={person => person.info.age > 18 ? 'Over 18' : 'Under 18'}
                />

                {/* Modal para edição dos dados da conta selecionada */}
                <Dialog open={this.state.modalOpen} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Editar Usuário</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Faça as alterações necessárias abaixo e clique em Salvar.
                        </DialogContentText>
                        <TextField
                            disabled={true}
                            value={this.state.selectedUser.status}
                            //onChange={(e) => { let array = this.state.selectedUser; array.nome = e.target.value; this.setState({ selectedUser: array }) }}
                            style={{ width: 500 }}
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Status"
                            type="text"
                            fullWidth
                        />

                        <TextField
                            value={this.state.selectedUser.nome}
                            onChange={(e) => { let array = this.state.selectedUser; array.nome = e.target.value; this.setState({ selectedUser: array }) }}
                            style={{ width: 500 }}
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Nome do Usuário"
                            type="text"
                            fullWidth
                        />

                        <InputLabel id="demo-simple-select-label">Cargo</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={this.state.selectedUser.cargo}
                            onChange={this.handleChange}
                        >

                            {this.state.offices.map((office) => {
                                return (
                                    <MenuItem value={office.key}>{office.nomeCargo}</MenuItem>
                                );
                            })}
                        </Select>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleUpdate} style={{ backgroundColor: 'green', color: '#FFF' }}>
                            Salvar
                        </Button>
                        <Button onClick={this.handleClose} style={{ backgroundColor: 'red', color: '#FFF' }}>
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Modal para confirmação de operação de desativação do usuário */}
                <Dialog open={this.state.modalDeactivateOpen} onClose={this.handleCloseDeactivate} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Editar Usuário</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Tem certeza de que deseja desativar o <b> {this.state.selectedUser.cargo} {this.state.selectedUser.nome} </b> ?
                        </DialogContentText>


                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { this.deactivateUser(this.state.selectedUser.key) }} style={{ backgroundColor: 'green', color: '#FFF' }}>
                            Sim
                        </Button>
                        <Button onClick={this.handleCloseDeactivate} style={{ backgroundColor: 'red', color: '#FFF' }}>
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Modal para confirmação de operação de reativação do usuário */}
                <Dialog open={this.state.modalReactivateOpen} onClose={this.handleCloseDeactivate} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Reativar Usuário</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Tem certeza de que deseja reativar o <b> {this.state.selectedUser.cargo} {this.state.selectedUser.nome} </b> ?
                        </DialogContentText>


                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { this.reactivateUser(this.state.selectedUser.key) }} style={{ backgroundColor: 'green', color: '#FFF' }}>
                            Sim
                        </Button>
                        <Button onClick={this.handleCloseReactivate} style={{ backgroundColor: 'red', color: '#FFF' }}>
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>
        );
    }
}

export default withRouter(Users);