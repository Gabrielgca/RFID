import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import utils from '../../utils';
import './office.css';

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
import DescriptionIcon from '@material-ui/icons/Description';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Loader from 'react-loader-spinner';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import FlatList from 'flatlist-react';
import { FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';


class Offices extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nome: localStorage.nome,
            cargo: localStorage.cargo,
            users: [],
            filteredOffices: [],
            offices: [],
            permissions: {
                cargo: [],
                conta: [],
                dashboard: [],
                dispositivo: [],
                setor: [],
                usuario: []
            },
            categoryNames: [
                { key: 0, name: "Cargo" },
                { key: 1, name: "Conta" },
                { key: 2, name: "Dashboard" },
                { key: 3, name: "Dispositivo" },
                { key: 4, name: "Setor" },
                { key: 5, name: "Usuario" }
            ],
            selectedOffice: { key: '', nomeCargo: '', status: '', permissoes: {} },
            filter: '',
            modalOpen: false,
            modalDeactivateOpen: false,
            modalReactivateOpen: false,
            permissionA: false,
            editDisable: true,
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
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleClearFilter = this.handleClearFilter.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleUpdateOffice = this.handleUpdateOffice.bind(this);
        this.handleDeactivateUserOpen = this.handleDeactivateUserOpen.bind(this);
        this.handleReactivateUser = this.handleReactivateUser.bind(this);
        this.handlePermissionChange = this.handlePermissionChange.bind(this);
    }

    handleUpdateOffice = async () => {
        var encontrou = 0;
        this.state.categoryNames.forEach((category) => {
            let perm = [];
            if (category.name.toLowerCase() === "cargo") {
                perm = this.state.permissions.cargo;
            }
            else {
                if (category.name.toLowerCase() === "conta") {
                    perm = this.state.permissions.conta;
                }
                else {
                    if (category.name.toLowerCase() === "dispositivo") {
                        perm = this.state.permissions.dispositivo;
                    }
                    else {
                        if (category.name.toLowerCase() === "setor") {
                            perm = this.state.permissions.setor;
                        }
                        else {
                            if (category.name.toLowerCase() === "usuario") {
                                perm = this.state.permissions.usuario;
                            }
                            else {
                                if (category.name.toLowerCase() === "dashboard") {
                                    perm = this.state.permissions.dashboard;
                                }
                            }
                        }
                    }
                }
            }

            perm.map((permission) => {
                if (permission.status === true) {
                    encontrou = 1;
                    return;
                }
            })
        })

        if (this.state.selectedOffice.nomeCargo !== '' && encontrou != 0) {
            const { permissions } = this.state;
            const { key, nomeCargo, status } = this.state.selectedOffice;
            await firebase.updateOffice(key, nomeCargo, permissions, status);
            this.handleClose();
            this.getOffices();
        }
        else {
            alert("O campo nome não pode ser vazio, e é necessário que exista ao menos uma permissão para o cargo.")
        }
    }

    handleClickOpen = async (office) => {
        //alert(JSON.stringify(office.permissoes));
        await this.setState({ selectedOffice: { key: office.key, nomeCargo: office.nomeCargo, permissoes: office.permissoes, status: office.status } });
        console.log(this.state.selectedOffice);
        /* office.permissoes.map((permissao) => {
            this.state.permissions.map((permission) => {
                if (permissao.key === permission.key) {
                    let list = {
                        key: permission.key,
                        nomePermissao: permission.nomePermissao,
                        status: permissao.status
                    }
                    newPermissions.push(list);
                }
            })
        }); */
        await this.setState({ permissions: office.permissoes });
        //alert("PERMISSÕES: " + JSON.stringify(this.state.permissions));
        this.setState({ modalOpen: true });
        this.getOffices();
    };

    handleClose = () => {
        this.setState({ modalOpen: false });
        this.setState({ selectedOffice: { key: '', nomeCargo: '', status: 'Ativo', permissoes: {} } });
        this.setState({ editDisable: true });
    };

    handleCloseDeactivate = () => {
        this.setState({ modalDeactivateOpen: false });
        this.setState({ selectedOffice: { key: '', nomeCargo: '', status: 'Ativo' } });
    }

    handleClearFilter = () => {
        this.setState({ filteredOffices: [] });
        this.setState({ filter: '' });
    };

    handleChange = (event) => {
        //setAge(event.target.value);
        let newObject = this.state.selectedOffice;
        newObject.nomeCargo = event.target.value;
        this.setState({ selectedOffice: newObject });
    };

    handleUpdate = () => {
        //alert("Novos dados: " + JSON.stringify(this.state.selectedOffice));
        const { key } = this.state.selectedOffice;
        firebase.updateOffice(key, this.state.selectedOffice.nomeCargo);
        this.handleClose();
        this.getUsers();
    }

    getOffices = () => {
        this.setState({ offices: [] });
        firebase.getAllOffices((allOffices) => {
            allOffices.forEach((oneOffice) => {
                let list = {
                    key: oneOffice.key,
                    nomeCargo: oneOffice.val().nomeCargo,
                    permissoes: oneOffice.val().permissoes,
                    status: oneOffice.val().status
                }
                //alert(JSON.stringify(list));
                this.setState({ offices: [...this.state.offices, list] });
            });
        });
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

        if (utils.checkCategory(this.state.loggedOffice.permissoes.cargo) !== true) {
            /* alert("Você não possui permissão para acessar esta página!"); */
            this.props.history.replace('/dashboard');
            return null;
        }
        else {
            this.setState({ pageLoading: false });
        }

        await firebase.getCategoryPermissions("cargo", (allPermissions) => {
            this.ordenatePermissions(allPermissions);
        });

        await firebase.getCategoryPermissions("conta", (allPermissions) => {
            this.ordenatePermissions(allPermissions)
        });

        await firebase.getCategoryPermissions("setor", (allPermissions) => {
            this.ordenatePermissions(allPermissions)
        });

        await firebase.getCategoryPermissions("dispositivo", (allPermissions) => {
            this.ordenatePermissions(allPermissions)
        });

        await firebase.getCategoryPermissions("usuario", (allPermissions) => {
            this.ordenatePermissions(allPermissions)
        });

        await firebase.getCategoryPermissions("dashboard", (allPermissions) => {
            this.ordenatePermissions(allPermissions)
        });


        /* if (this.state.cargo !== "Administrador") {
            this.props.history.replace("/dashboard");
            return null;
        }
        else {
            alert("Acesso autorizado");
        } */

        /* await firebase.getPermissions((allPermissions) => {
            this.state.permissions = [];
            allPermissions.forEach((onePermission) => {
                let list = {
                    key: onePermission.key,
                    nomePermissao: onePermission.val().nomePermissao,
                    status: false
                }
                this.setState({ permissions: [...this.state.permissions, list] });
            });
        }); */
        this.getOffices();

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

    handleDeactivateUserOpen = (office) => {
        this.setState({ selectedOffice: { key: office.key, cargo: office.cargo, nome: office.nome, status: office.status, permissoes: {} } });
        this.setState({ modalDeactivateOpen: true });
    }

    handleCloseReactivate = () => {
        this.setState({ modalReactivateOpen: false });
        this.setState({ selectedOffice: { key: '', cargo: '', nome: '', status: '' } });
    }

    handleReactivateUser = (office) => {
        this.setState({ selectedOffice: { key: office.key, cargo: office.cargo, nome: office.nome, status: office.status, permissoes: {} } });
        this.setState({ modalReactivateOpen: true });
    }

    /* handlePermissionChange(event) {
        let newPermissions = [];
        this.state.permissions.map((permission) => {
            if (permission.key === event.target.name) {
                let list = {
                    key: permission.key,
                    nomePermissao: permission.nomePermissao,
                    status: !permission.status
                }
                newPermissions.push(list);
                //alert(JSON.stringify(newPermissions));
            }
            else {
                newPermissions.push(permission);
            }
            this.setState({ permissions: newPermissions });
        });
    } */

    handlePermissionChange(categoryName, event) {
        let perm = [];
        if (categoryName === "cargo") {
            perm = this.state.permissions.cargo;
        }
        else {
            if (categoryName === "conta") {
                perm = this.state.permissions.conta;
            }
            else {
                if (categoryName === "dispositivo") {
                    perm = this.state.permissions.dispositivo;
                }
                else {
                    if (categoryName === "setor") {
                        perm = this.state.permissions.setor;
                    }
                    else {
                        if (categoryName === "usuario") {
                            perm = this.state.permissions.usuario;
                        }
                        else {
                            if (categoryName === "dashboard") {
                                perm = this.state.permissions.dashboard;
                            }
                        }
                    }
                }
            }
        }

        var list = {};
        var permissionIndexToRemove;
        perm.map((permission) => {
            if (permission.key === event.target.name) {
                list = {
                    key: permission.key,
                    nomePermissao: permission.nomePermissao,
                    status: !permission.status
                }
                //alert("Encontrou a permissao");
                permissionIndexToRemove = perm.indexOf(permission);
                //perm.splice(perm.indexOf(permission), 1);
                //perm.push(list);
                //permission.status = !permission.status;
                //console.log(this.state.permissions)
            }
        });

        perm.splice(permissionIndexToRemove, 1);
        perm.push(list);

        let newPermissions = this.state.permissions;
        this.setState({ permissions: newPermissions });




    }

    handleEdit = () => {
        this.setState({ editDisable: false });
    }

    /* searchPermissionStatus(permissionkey) {
        alert(permissionkey);
        this.state.permissions.map((permission) => {
            if (permission.key === permissionkey) {
                return "true";
            }
        })
    } */

    reducePermissions() {
        let newPermissions = [];
        this.state.permissions.map((permission) => {
            let list = {
                key: permission.key,
                status: permission.status
            }
            newPermissions.push(list);
        });
        return newPermissions;
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

    searchOffice = () => {
        //alert(this.state.filter);
        //this.setState({ filteredOffices: emptyArray });
        this.state.filteredOffices = [];
        this.state.offices.forEach((office) => {
            if (office.nomeCargo.toUpperCase().includes(this.state.filter.toUpperCase()) || office.nomeCargo.toUpperCase() == this.state.filter.toUpperCase()) {
                let list = {
                    key: office.key,
                    nomeCargo: office.nomeCargo,
                    status: office.status
                }
                //alert(JSON.stringify(list));
                let array = this.state.filteredOffices;
                array.push(list);
                this.setState({ filteredOffices: array });
                //alert(JSON.stringify(list));
            }
        });
    }

    ordenatePermissions(category) {
        let perm;
        if (category.key === "cargo") {
            perm = this.state.permissions.cargo;
        }
        else {
            if (category.key === "conta") {
                perm = this.state.permissions.conta;
            }
            else {
                if (category.key === "dispositivo") {
                    perm = this.state.permissions.dispositivo;
                }
                else {
                    if (category.key === "setor") {
                        perm = this.state.permissions.setor;
                    }
                    else {
                        if (category.key === "usuario") {
                            perm = this.state.permissions.usuario;
                        }
                        else {
                            if (category.key === "dashboard") {
                                perm = this.state.permissions.dashboard;
                            }
                        }
                    }
                }
            }
        }

        var newPermissions = this.state.permissions;

        category.forEach((permission) => {
            let list = {
                key: permission.key,
                nomePermissao: permission.val().nomePermissao,
                status: false
            }
            perm.push(list);
        })
        this.setState({ permissions: newPermissions });
    }

    searchPermissionStatus(categoryName, permissionkey) {
        let perm = [];
        if (categoryName === "cargo") {
            perm = this.state.permissions.cargo;
        }
        else {
            if (categoryName === "conta") {
                perm = this.state.permissions.conta;
            }
            else {
                if (categoryName === "dispositivo") {
                    perm = this.state.permissions.dispositivo;
                }
                else {
                    if (categoryName === "setor") {
                        perm = this.state.permissions.setor;
                    }
                    else {
                        if (categoryName === "usuario") {
                            perm = this.state.permissions.usuario;
                        }
                        else {
                            if (categoryName === "dashboard") {
                                perm = this.state.permissions.dashboard;
                            }
                        }
                    }
                }
            }
        }

        perm.map((permission) => {
            if (permission.key === permissionkey) {
                return permission.status;
            }
        });
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
                    <h1 style={{ color: '#FFF' }}>Controle de Cargos</h1>
                    <Paper style={{ marginTop: 50 }}>
                        <InputBase
                            value={this.state.filter}
                            style={{ paddingLeft: 20, width: 500 }}
                            onChange={(e) => this.setState({ filter: e.target.value })}
                            placeholder="Pesquisa um cargo..."
                        />
                        <IconButton type="button" onClick={this.searchOffice}>
                            <SearchIcon />
                        </IconButton>

                        <IconButton type="button" onClick={this.handleClearFilter}>
                            <ClearIcon />
                        </IconButton>

                        <IconButton type="button" onClick={() => { this.props.history.push("/offices/new") }}>
                            <AddIcon style={{ color: 'green' }} />
                        </IconButton>
                    </Paper>

                    <p>{JSON.stringify(this.state.permissions)}</p>

                    <FlatList
                        list={this.state.filteredOffices.length > 0 ? this.state.filteredOffices : this.state.offices}
                        renderItem={(item) => (
                            <div className={item.status === 'Ativo' ? "card" : "card-disabled"} key={item.key}>
                                <FormGroup row style={{ justifyContent: "space-between" }}>
                                    <p><b>Cargo: </b>{item.nomeCargo}</p>
                                    {/* <p>{JSON.stringify(item)}</p> */}
                                    <FormGroup row>
                                        <Button endIcon={<DescriptionIcon />} onClick={() => { this.handleClickOpen(item) }} style={{ backgroundColor: 'green', zIndex: 3, color: '#FFF', marginRight: 10, width: 150 }}>
                                            Detalhes
                                        </Button>

                                        {item.status === 'Ativo' ? (
                                            <Button endIcon={<BlockIcon />} onClick={() => { firebase.disableOffice(item.nomeCargo, item.key).then((response) => { alert(response) }); this.getOffices() }} style={{ backgroundColor: 'red', color: '#FFF', marginRight: 10, width: 150 }}>
                                                Desativar
                                            </Button>
                                        ) : (
                                                <Button endIcon={<CheckCircleOutlineIcon />} onClick={() => { firebase.enableOffice(item.key); this.getOffices() }} style={{ backgroundColor: 'blue', color: '#FFF', marginRight: 10, width: 150 }}>
                                                    Reativar
                                                </Button>
                                            )}
                                    </FormGroup>
                                </FormGroup>
                            </div>
                        )}
                        renderWhenEmpty={() => <div>Carregando...</div>}
                        //sortBy={["item.cargo", { key: "lastName", descending: true }]}
                        sortBy={["status", "nomeCargo"]}
                    //groupBy={person => person.info.age > 18 ? 'Over 18' : 'Under 18'}
                    />

                    {/* Modal para edição dos dados da conta selecionada */}
                    <Dialog open={this.state.modalOpen} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Detalhes do Cargo</DialogTitle>
                        <DialogContent style={{ width: 700 }}>
                            <TextField
                                value={this.state.selectedOffice.nomeCargo}
                                onChange={(e) => { let array = this.state.selectedOffice; array.nomeCargo = e.target.value; this.setState({ selectedOffice: array }) }}
                                style={{ width: 500 }}
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Nome do Cargo"
                                type="text"
                                fullWidth
                                disabled={this.state.editDisable}
                            />

                            <form onSubmit={this.register} className="form">

                                <p>Cargo</p>
                                <FormGroup row style={{ marginBottom: 10 }}>
                                    <FlatList
                                        list={this.state.permissions.cargo}
                                        renderItem={(item) => (
                                            <FormControlLabel
                                                style={{ width: '32.5%', paddingLeft: 5 }}
                                                control={<Checkbox color="primary" checked={item.status} onChange={(e) => { this.handlePermissionChange("cargo", e) }} name={item.key} />}
                                                label={item.nomePermissao}
                                                disabled={this.state.editDisable}
                                            />
                                        )}
                                        renderWhenEmpty={() => <div>Carregando...</div>}
                                        //sortBy={["item.cargo", { key: "lastName", descending: true }]}
                                        sortBy={["nomePermissao"]}
                                    //groupBy={person => person.info.age > 18 ? 'Over 18' : 'Under 18'}
                                    />
                                </FormGroup>

                                <p>Conta</p>
                                <FormGroup row style={{ marginBottom: 10 }}>
                                    <FlatList
                                        list={this.state.permissions.conta}
                                        renderItem={(item) => (
                                            <FormControlLabel
                                                style={{ width: '32.5%', paddingLeft: 5 }}
                                                control={<Checkbox color="primary" checked={item.status} onChange={(e) => { this.handlePermissionChange("conta", e) }} name={item.key} />}
                                                label={item.nomePermissao}
                                                disabled={this.state.editDisable}
                                            />
                                        )}
                                        renderWhenEmpty={() => <div>Carregando...</div>}
                                        sortBy={["nomePermissao"]}
                                    />
                                </FormGroup>

                                <p>Setor</p>
                                <FormGroup row style={{ marginBottom: 10 }}>
                                    <FlatList
                                        list={this.state.permissions.setor}
                                        renderItem={(item) => (
                                            <FormControlLabel
                                                style={{ width: '32.5%', paddingLeft: 5 }}
                                                control={<Checkbox color="primary" checked={item.status} onChange={(e) => { this.handlePermissionChange("setor", e) }} name={item.key} />}
                                                label={item.nomePermissao}
                                                disabled={this.state.editDisable}
                                            />
                                        )}
                                        renderWhenEmpty={() => <div>Carregando...</div>}
                                        sortBy={["nomePermissao"]}
                                    />
                                </FormGroup>

                                <p>Dispositivo</p>
                                <FormGroup row style={{ marginBottom: 10 }}>
                                    <FlatList
                                        list={this.state.permissions.dispositivo}
                                        renderItem={(item) => (
                                            <FormControlLabel
                                                style={{ width: '32.5%', paddingLeft: 5 }}
                                                control={<Checkbox color="primary" checked={item.status} onChange={(e) => { this.handlePermissionChange("dispositivo", e) }} name={item.key} />}
                                                label={item.nomePermissao}
                                                disabled={this.state.editDisable}
                                            />
                                        )}
                                        renderWhenEmpty={() => <div>Carregando...</div>}
                                        sortBy={["nomePermissao"]}
                                    />
                                </FormGroup>

                                <p>Dashboard</p>
                                <FormGroup row style={{ marginBottom: 10 }}>
                                    <FlatList
                                        list={this.state.permissions.dashboard}
                                        renderItem={(item) => (
                                            <FormControlLabel
                                                style={{ width: '32.5%', paddingLeft: 5 }}
                                                control={<Checkbox color="primary" checked={item.status} onChange={(e) => { this.handlePermissionChange("dashboard", e) }} name={item.key} />}
                                                label={item.nomePermissao}
                                                disabled={this.state.editDisable}
                                            />
                                        )}
                                        renderWhenEmpty={() => <div>Carregando...</div>}
                                        sortBy={["nomePermissao"]}
                                    />
                                </FormGroup>

                                <p>Usuário (RFID)</p>
                                <FormGroup row style={{ marginBottom: 10 }}>
                                    <FlatList
                                        list={this.state.permissions.usuario}
                                        renderItem={(item) => (
                                            <FormControlLabel
                                                style={{ width: '32.5%', paddingLeft: 5 }}
                                                control={<Checkbox color="primary" checked={item.status} onChange={(e) => { this.handlePermissionChange("usuario", e) }} name={item.key} />}
                                                label={item.nomePermissao}
                                                disabled={this.state.editDisable}
                                            />
                                        )}
                                        renderWhenEmpty={() => <div>Carregando...</div>}
                                        sortBy={["nomePermissao"]}
                                    />
                                </FormGroup>
                            </form>

                        </DialogContent>
                        <DialogActions>
                            {this.state.editDisable === true ? (
                                <Button endIcon={<EditIcon />} onClick={this.handleEdit} style={{ backgroundColor: 'green', color: '#FFF' }}>
                                    Editar
                                </Button>
                            ) : (
                                    <Button onClick={this.handleUpdateOffice} style={{ backgroundColor: 'green', color: '#FFF' }}>
                                        Salvar
                                    </Button>
                                )}
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
                                Tem certeza de que deseja desativar o <b> {this.state.selectedOffice.cargo} {this.state.selectedOffice.nome} </b> ?
                            </DialogContentText>


                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => { this.deactivateUser(this.state.selectedOffice.key) }} style={{ backgroundColor: 'green', color: '#FFF' }}>
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
                                Tem certeza de que deseja reativar o <b> {this.state.selectedOffice.cargo} {this.state.selectedOffice.nome} </b> ?
                            </DialogContentText>


                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => { this.reactivateUser(this.state.selectedOffice.key) }} style={{ backgroundColor: 'green', color: '#FFF' }}>
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
}

export default withRouter(Offices);