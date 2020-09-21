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
                cargo: {
                    cadastrar: "",
                    editar: "",
                    remover: ""
                },
                conta: {
                    cadastrar: "",
                    editar: "",
                    remover: ""
                },
                dashboard: {
                    usersDetails: "",
                    viewQuantity: "",
                    viewWho: ""
                },
                dispositivo: {
                    cadastrar: "",
                    editar: "",
                    remover: ""
                },
                setor: {
                    cadastrar: "",
                    editar: "",
                    remover: ""
                },
                usuario: {
                    cadastrar: "",
                    editar: "",
                    remover: ""
                }
            },
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

    handlePermissionChange(event) {
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
    }

    async handleRegister() {
        if (this.state.officeName !== '') {
            await firebase.addOffice(this.reducePermissions(), this.state.officeName);
            //alert(JSON.stringify(this.reducePermissions()));
            //alert(JSON.stringify(this.state.permissions));
            this.setState({ modalConfirmOpen: false });
            this.setState({ modalSuccessOpen: true });
        }
        else {
            alert("Por favor, digite um nome para o cargo e selecione pelo menos uma permissão!");
        }
    }

    separatePermissions = (category) => {
        category.forEach((permissao) => {
            var perm;
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

            if (category.key === "dashboard") {
                if (permissao.key === 'viewQuantity') {
                    perm.viewQuantity = permissao.val();
                    this.setState({ permissions: perm });
                }
                else {
                    if (permissao.key === 'viewWho') {
                        perm.viewWho = permissao.val();
                        this.setState({ permissions: perm });
                    }
                    else {
                        if (permissao.key === 'usersDetails') {
                            perm.usersDetails = permissao.val();
                            this.setState({ permissions: perm });
                        }
                    }
                }
            }
            else {
                if (permissao.key === 'cadastrar') {
                    perm.cadastrar = permissao.val();
                    this.setState({ permissions: perm });
                }
                else {
                    if (permissao.key === 'editar') {
                        perm.editar = permissao.val();
                        this.setState({ permissions: perm });
                    }
                    else {
                        if (permissao.key === 'remover') {
                            perm.remover = permissao.val();
                            this.setState({ permissions: perm });
                        }
                    }
                }
            }
        })
    }

    async getPermissions() {
        await firebase.getPermissions((allPermissions) => {
            //this.state.permissions = [];
            allPermissions.forEach((category) => {
                /* if (category.key === 'cargo') {
                    this.separatePermissions(category);
                }else{
                    
                } */
                this.separatePermissions(category);
            });
        });
    }

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

    searchPermissionStatus(permissionkey) {
        this.state.permissions.map((permission) => {
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

        if (this.state.cargo === "Administrador") {
            /* alert("Acesso autorizado"); */
        }
        else {
            this.props.history.replace("/dashboard");
            return null;
        }

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
                        //value={this.state.selectedOffice.nomeCargo}
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

                    <FormGroup row>
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