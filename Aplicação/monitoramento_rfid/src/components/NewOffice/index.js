import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import './NewOffice.css';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import FlatList from 'flatlist-react';


class NewOffice extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nome: localStorage.nome,
            cargo: localStorage.cargo,
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
            officeName: '',
            modalSuccessOpen: false,
            modalConfirmOpen: false
        };

        this.reducePermissions = this.reducePermissions.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handlePermissionChange = this.handlePermissionChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ cargo: event.target.value });
    }

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

        perm.map((permission) => {
            if (permission.key === event.target.name) {
                permission.status = !permission.status;
            }
        });
    }

    async handleRegister() {
        //alert(JSON.stringify(this.state.permissions));
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

        if (this.state.officeName !== '' && encontrou != 0) {
            await firebase.addOffice(this.state.permissions, this.state.officeName);
            //alert(JSON.stringify(this.reducePermissions()));
            //alert(JSON.stringify(this.state.permissions));
            this.setState({ modalConfirmOpen: false });
            this.setState({ modalSuccessOpen: true });
            this.setState({
                permissions: {
                    cargo: [],
                    conta: [],
                    dashboard: [],
                    dispositivo: [],
                    setor: [],
                    usuario: []
                }
            });
            this.getPermissions();
            this.setState({ officeName: '' });
        }
        else {
            alert("Por favor, digite um nome para o cargo e selecione pelo menos uma permissão!");
        }
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

    async getPermissions() {

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


        await firebase.getPermissions((allPermissions) => {
            //this.state.permissions = [];
            allPermissions.forEach((category) => {
                /* if (category.key === 'cargo') {
                    this.separatePermissions(category);
                }else{
                    
                } */
                //this.separatePermissions(category);
            });
        });
    }

    reducePermissions() {
        let newPermissions = [];

        this.state.permissions.map((permission) => {
            let list = {
                key: permission.key,
                nomePermissao: permission.nomePermissao,
                status: permission.status
            }
            newPermissions.push(list);
        });
        return newPermissions;
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

    async componentDidMount() {
        if (!firebase.getCurrent()) {
            this.props.history.replace('/login');
            return null;
        }

        firebase.getUserName((info) => {
            localStorage.nome = info.val().nome;
            this.setState({ loggedName: localStorage.nome });
        });

        firebase.getUserPerfil((info) => {
            localStorage.cargo = info.val().cargo;
            this.setState({ loggedCargo: localStorage.cargo });
        });

        /* if (this.state.cargo === "Administrador") {
            alert("Acesso autorizado");
        }
        else {
            this.props.history.replace("/dashboard");
            return null;
        } */

        this.getPermissions();
    }

    render() {
        return (
            <div>
                <header id="new">
                    {/* <Link to="/offices">Voltar</Link> */}
                    <Button startIcon={<ArrowBackIcon />} style={{ backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize" }} type="button" onClick={() => { this.props.history.goBack() }}>
                        Voltar
                    </Button>
                </header>
                <h1 className="register-h1" style={{ color: '#FFF' }}>Cadastrar Novo Cargo</h1>

                <form onSubmit={this.register} className="form">
                    <TextField
                        value={this.state.officeName}
                        onChange={(e) => { this.setState({ officeName: e.target.value }) }}
                        style={{ width: '100%' }}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Nome do Cargo"
                        type="text"
                        fullWidth
                    //disabled={this.state.editDisable}
                    />

                    <p>Cargo</p>
                    <FormGroup row style={{ marginBottom: 10 }}>
                        {/* <FlatList
                            list={this.state.permissions}
                            renderItem={(item) => (
                                <FormControlLabel
                                    style={{ width: '49%', paddingLeft: 5 }}
                                    control={<Checkbox color="primary" checked={this.searchPermissionStatus(item.key)} onChange={this.handlePermissionChange} name={item.key} />}
                                    label={item.nomePermissao}
                                    disabled={this.state.editDisable}
                                />
                            )}
                            renderWhenEmpty={() => <div>Carregando...</div>}
                            //sortBy={["item.cargo", { key: "lastName", descending: true }]}
                            sortBy={["nomePermissao"]}
                        //groupBy={person => person.info.age > 18 ? 'Over 18' : 'Under 18'}
                        /> */}
                        <FlatList
                            list={this.state.permissions.cargo}
                            renderItem={(item) => (
                                <FormControlLabel
                                    style={{ width: '32.5%', paddingLeft: 5 }}
                                    control={<Checkbox color="primary" checked={this.searchPermissionStatus("cargo", item.key)} onChange={(e) => { this.handlePermissionChange("cargo", e) }} name={item.key} />}
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
                                    control={<Checkbox color="primary" checked={this.searchPermissionStatus("conta",item.key)} onChange={(e) => { this.handlePermissionChange("conta", e) }} name={item.key} />}
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
                                    control={<Checkbox color="primary" checked={this.searchPermissionStatus("setor", item.key)} onChange={(e) => { this.handlePermissionChange("setor", e) }} name={item.key} />}
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
                                    control={<Checkbox color="primary" checked={this.searchPermissionStatus("dispositivo", item.key)} onChange={(e) => { this.handlePermissionChange("dispositivo", e) }} name={item.key} />}
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
                                    control={<Checkbox color="primary" checked={this.searchPermissionStatus("dashboard", item.key)} onChange={(e) => { this.handlePermissionChange("dashboard", e) }} name={item.key} />}
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
                                    control={<Checkbox color="primary" checked={this.searchPermissionStatus("usuario", item.key)} onChange={(e) => { this.handlePermissionChange("usuario", e) }} name={item.key} />}
                                    label={item.nomePermissao}
                                    disabled={this.state.editDisable}
                                />
                            )}
                            renderWhenEmpty={() => <div>Carregando...</div>}
                            sortBy={["nomePermissao"]}
                        />
                    </FormGroup>

                    <Button onClick={() => { this.setState({ modalConfirmOpen: true }) }} style={{ backgroundColor: 'green', color: '#FFF', width: '100%', marginTop: 30 }}>
                        Cadastrar
                    </Button>
                </form>


                {/* Modal para confirmação de operação de desativação do usuário */}
                <Dialog open={this.state.modalSuccessOpen} onClose={() => { this.setState({ modalSuccessOpen: false }) }} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Cargo cadastrado com sucesso!</DialogTitle>
                    <DialogActions>
                        <Button onClick={() => { this.setState({ modalSuccessOpen: false }) }} style={{ backgroundColor: 'green', color: '#FFF' }}>
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Modal para confirmação de operação de reativação do usuário */}
                <Dialog open={this.state.modalConfirmOpen} onClose={() => { this.setState({ modalConfirmOpen: false }) }} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Cadastrar Cargo</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Tem certeza de que deseja cadastrar o cargo <b>{this.state.officeName}</b>?
                        </DialogContentText>


                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleRegister} style={{ backgroundColor: 'green', color: '#FFF' }}>
                            Sim
                        </Button>
                        <Button onClick={() => { this.setState({ modalConfirmOpen: false }) }} style={{ backgroundColor: 'red', color: '#FFF' }}>
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>
        );
    }
}

export default withRouter(NewOffice);