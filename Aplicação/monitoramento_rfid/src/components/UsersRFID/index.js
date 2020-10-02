import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import utils from '../../utils';
import FlatList from 'flatlist-react';
import Loader from 'react-loader-spinner';
import axios from 'axios';
import baseURL from '../../service';
import './UsersRFID.css';
import usuarios from '../../JSONs/updateUser.json';

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
import RemoveIcon from '@material-ui/icons/Remove';

import { FormControlLabel, Checkbox } from '@material-ui/core';

const fileUpload = require('fuctbase64');


class UsersRFID extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterUsers: [],
            filter: '',
            selectedUser: { id_user: '', name: '', age: '', office: '', status: '', RFID: '', perm: [] },
            permissoesEditadas: [],
            permissoesDesativadas: [],
            permissoesAdicionadas: [],
            setores: [],

            selectedSector: -1,
            fileResult: '',
            roomName: "",
            hr_inicio: "",
            hr_final: "",
            permanente: true,

            nome: localStorage.nome,
            cargo: localStorage.cargo,
            modalOpen: false,
            modalDeactivateOpen: false,
            modalReactivateOpen: false,
            users: [],
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
        this.handleSelectedSectorChange = this.handleSelectedSectorChange.bind(this);
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
        await this.getUsersRFID();
        console.log(this.state.users);
        //this.setState({ users: usuarios.usuarios });
    }

    //AQUI VÃO AS FUNÇÕES QUE ABREM E FECHAM OS MODAIS
    modalOpen = async (user) => { //Abre o modal de edição
        this.setState({
            selectedUser: {
                id_user: user.id_user,
                name: user.name,
                status: user.status,
                imgPerfil: user.imgPerfil,
                RFID: user.RFID,
                age: user.age,
                office: user.office,
                perm: user.perm
            }
        });
        this.setState({ modalOpen: true });
        this.getLocalizations();
    };

    modalClose = async () => { //Fecha o modal de edição
        this.setState({ modalOpen: false });
        this.getUsersRFID();
        this.setState({ selectedUser: { id_user: '', name: '', age: '', office: '', status: '', imgPerfil: '', RFID: '', perm: [] } });
        this.setState({ permissoesAdicionadas: [] });
        //window.location.reload();
        this.setState({ hr_inicio: "" });
        this.setState({ hr_final: "" });
        this.setState({ selectedSector: -1 });
        this.setState({ roomName: "" });
        this.setState({ permanente: true });
        this.setState({ fileResult: '' });
    };

    handleDeactivateUserOpen = (user) => { //Abre o modal de confirmação de desativação do usuário
        /* console.log("SelectedUser: ");
        console.log(user); */
        this.setState({
            selectedUser: {
                id_user: user.id_user,
                name: user.name,
                status: user.status,
                imgPerfil: user.imgPerfil,
                age: user.age,
                office: user.office,
                RFID: user.RFID,
                perm: user.perm
            }
        });
        //this.setState({ selectedUser: user });
        this.setState({ modalDeactivateOpen: true });
    };

    handleDeactivateUserClose = () => { //Fecha o modal de confirmação de desativação
        this.setState({ modalDeactivateOpen: false });
        this.setState({ selectedUser: { id_user: '', name: '', age: '', office: '', status: '', imgPerfil: '', RFID: '', perm: [] } });
        this.setState({ fileResult: '' });
        this.getUsersRFID();
    };

    handleUserStatusChange = async (user) => { //Função que realiza o pedido de desativação/ativação do usuário ao Servidor
        console.log("SelectedUser antes: ");
        console.log(user);
        if (user.status === "A") {
            user.status = "I";
        }
        else {
            user.status = "A";
        }

        axios.post(baseURL + "updateUser", user)
            .then(response => {
                if (user.status === "A") {
                    alert("Usuário reativado com sucesso!");
                }
                else {
                    alert("Usuário desabilitado com sucesso!");
                }
            })
            .catch(error => {
                console.log(error);
            });
        this.handleDeactivateUserClose();
        this.handleReactivateUserClose();

    };

    handleReactivateUserOpen = (user) => { //Abre o modal de confirmação de reativação do usuário
        console.log(user);
        this.setState({ selectedUser: user });
        this.setState({ modalReactivateOpen: true });
    };

    handleReactivateUserClose = () => { //Fecha o modal de confirmação de reativação
        this.setState({ modalReactivateOpen: false });
        this.setState({ selectedUser: { id_user: '', name: '', age: '', office: '', status: '', imgPerfil: '', RFID: '', perm: [] } });
        this.setState({ fileResult: '' });
        this.getUsersRFID();
    };

    /* reactivateUser = async (user) => { //Função que realiza o pedido de reativação do usuário ao Servidor
        let params = {
            id_user: key,
            status: "A"
        }

        axios.post(baseURL + "updateUser", params)
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                console.log(error);
            });

        this.handleReactivateUserClose();
        this.getUsersRFID();
    }; */

    getLocalizations = async () => { //Função que obtém os dispositivos para os quais se pode adicionar uma permissão
        axios.get(baseURL + "dispInfo")
            .then(response => {
                console.log("Responses");
                console.log(response.data.dispinfo);
                this.setState({ setores: response.data.dispinfo });
                this.setState({ selectedSector: response.data.dispinfo[0].id_disp_loc });
                this.setState({ roomName: response.data.dispinfo[0].no_loc });
            })
            .catch(error => {
                console.log(error);
            });
    }

    logout = async () => { //Função que efetua a saída do usuário logado
        await firebase.logout()
            .catch((error) => {
                console.log(error);
            });
        localStorage.removeItem("nome");
        this.props.history.push('/');
    }


    //FUNÇÕES QUE ALTERAM OS VALORES DOS DADOS DO USUÁRIO SELECIONADO
    handleFile = async (e) => {
        fileUpload(e).then(result => {
            //this.fileResult = result;
            this.setState({ fileResult: result.base64 });
            //alert("Result: " + JSON.stringify(result));
        });
    }

    handleNameChange = async (event) => { //Altera o nome do usuário atualmente sendo editado
        let newName = this.state.selectedUser;
        newName.name = event.target.value;
        this.setState({ selectedUser: newName })
    };

    handleStatusChange = async (event) => { //Altera o status(ativo/inativo) do usuário atualmente sendo editado
        let newSelectedPerson = this.state.selectedUser;
        newSelectedPerson.status = event.target.value;
        this.setState({ selectedPerson: newSelectedPerson })
        this.setState({ selectedUser: newSelectedPerson })
    };

    handleOfficeChange = async (event) => { //Altera o cargo do usuário atualmente sendo editado
        let newJob = this.state.selectedUser;
        newJob.office = event.target.value;
        this.setState({ selectedUser: newJob });
    };

    searchUser = () => { //Função que pesquisa um usuário na lista de usuários
        this.state.filterUsers = [];
        this.state.users.forEach((user) => {
            if (user.name.toUpperCase().includes(this.state.filter.toUpperCase()) || user.name.toUpperCase() == this.state.filter.toUpperCase()) {

                let list = {
                    id_user: user.id_user,
                    name: user.name,
                    age: user.age,
                    office: user.office,
                    status: user.status,
                    RFID: user.RFID,
                    perm: user.perm
                }

                let array = this.state.filterUsers;
                array.push(list)
                this.setState({ filterUsers: array })
            }
        })
    };

    handleClearFilter = () => { //Função que limpa o filtro e a variável de usuários filtrados
        this.setState({ filterUsers: [] });
        this.setState({ filter: '' });
    };

    getUsersRFID = async () => { //Função que obtém todos os usuários do Servidor
        await axios.get(baseURL + 'userInfo')
            .then(response => {
                console.log(response.data.usuarios);
                this.setState({ users: response.data.usuarios })
            })
            .catch(error => {
                alert('Error: ' + JSON.stringify(error))
            })
    };

    handleUpdateUser = async () => { //Função que manda os dados do usuário (editados/salvos) para o Servidor
        if (this.state.selectedUser.name !== '' &&
            this.state.selectedUser.office !== '' &&
            this.state.selectedUser.status !== '') {

            let perm = [];

            this.state.permissoesEditadas.map((permissao) => {
                perm.push(permissao);
            });

            this.state.permissoesDesativadas.map((permissao) => {
                perm.push(permissao);
            });

            this.state.permissoesAdicionadas.map((permissao) => {
                perm.push(permissao);
            });

            let params = {
                id_user: this.state.selectedUser.id_user,
                RFID: this.state.selectedUser.RFID,
                name: this.state.selectedUser.name,
                imgPerfil: this.state.fileResult !== '' ? this.state.fileResult : null,
                age: this.state.selectedUser.age,
                office: this.state.selectedUser.office,
                status: this.state.selectedUser.status,
                perm: perm
            }

            console.log("JSON QUE IRÁ PARA O SERVIDOR")
            console.log(params);
            //alert(JSON.stringify(params))

            await axios.post(baseURL + 'updateUser', params)
                .then(response => {
                    alert(JSON.stringify(response.data))
                    console.log(response)
                    this.modalClose();
                })
                .catch(error => {
                    console.log(error);
                });
        }
    };

    //AQUI VÃO AS FUNÇÕES DE EDIÇÃO DAS PERMISSÕES DO USUÁRIO RFID
    handleSelectedSectorChange = (e) => { //Função que altera o setor da nova permissão a ser cadastrada
        this.setState({ selectedSector: e.target.value });
        this.state.setores.map((setor) => {
            if (setor.id_loc === e.target.value) {
                this.setState({ roomName: setor.no_loc });
            }
        });
    };

    handleNewPermissionPermanentChange = async (event) => { //Função que altera o status de permanente de uma nova permissão a ser cadastrada
        let permanentStatus = !this.state.permanente;
        this.setState({ permanente: permanentStatus });
    };

    handleAddEditedPermission = async (permission) => { //FUNÇÃO PARA ADICIONAR UMA PERMISSÃO EDITADA
        let indexOfPermissionEncountered = -1;
        this.state.permissoesEditadas.map((newPermission) => {
            if (newPermission.id_perm_usu_disp === permission.id_perm_usu_disp) {
                indexOfPermissionEncountered = this.state.permissoesEditadas.indexOf(newPermission);
            }
        });

        let array = this.state.permissoesEditadas;
        if (indexOfPermissionEncountered !== -1) {
            array.splice(indexOfPermissionEncountered, 1);
        }

        let list = {
            id_perm_usu_disp: permission.id_perm_usu_disp,
            hr_final: permission.hr_final === "" ? null : permission.hr_final,
            hr_inicio: permission.hr_inicio === "" ? null : permission.hr_inicio,
            permanente: permission.permanente
        }

        array.push(list);
        await this.setState({ permissoesEditadas: array });
        console.log(this.state.permissoesEditadas);
    };

    handlePermissionInitialHourChange = async (event, permissionIndex) => { //exemplo de alteração de dado da permissao
        let actualUser = this.state.selectedUser;
        actualUser.perm[permissionIndex].hr_inicio = event.target.value;
        await this.setState({ selectedUser: actualUser });
        console.log(this.state.selectedUser.perm[permissionIndex].company);
    };

    handlePermissionFinalHourChange = async (event, permissionIndex) => { //exemplo de alteração de dado da permissao
        let actualUser = this.state.selectedUser;
        actualUser.perm[permissionIndex].hr_final = event.target.value;
        await this.setState({ selectedUser: actualUser });
        console.log(this.state.selectedUser.perm[permissionIndex].company);
    };

    handleAddPermission = async () => { //Função que adiciona uma permissão nova a ser cadastrada durante a edição de um usuário e suas permissões
        if ((this.state.hr_inicio !== '' && this.state.hr_final !== '' && this.state.selectedSector !== '') || (this.state.hr_inicio === '' && this.state.hr_final === '' && this.state.selectedSector !== '')) {
            let newPermissions = this.state.permissoesAdicionadas;
            newPermissions.push({
                id_disp_loc: this.state.selectedSector,
                roomName: this.state.roomName,
                hr_inicio: this.state.hr_inicio === "" ? null : this.state.hr_inicio,
                hr_final: this.state.hr_final === "" ? null : this.state.hr_final,
                permanente: this.state.permanente === true ? "S" : "N"
            });
            await this.setState({ permissoesAdicionadas: newPermissions });
            //alert(JSON.stringify(this.state.permissoesAdicionadas));
        }
        else {
            alert('Os campos de hora e fim precisam ser preenchidos');
            return null;
        }
    };

    handleRemovePermission = (index) => { //Função que remove uma permissão que seria cadastrada
        let deleteItem = this.state.permissoesAdicionadas;
        deleteItem.splice(index, 1)
        this.setState({ permissoesAdicionadas: deleteItem });
    };

    handlePermissionPermanentChange = async (event, permissionIndex) => { //Função que altera o status de permanente de uma permissão já existente
        let actualUser = this.state.selectedUser;
        if (actualUser.perm[permissionIndex].permanente === "S") {
            actualUser.perm[permissionIndex].permanente = "N";
        }
        else {
            actualUser.perm[permissionIndex].permanente = "S";
        }
        await this.setState({ selectedUser: actualUser });
        //alert(this.state.selectedUser.perm[permissionIndex].permanente);
    };

    handlePermissionStatusChange = async (permission) => { //AQUI VÃO AS FUNÇÕES PARA DESATIVAÇÃO DE UMA PERMISSÃO
        let permissionStatus;
        console.log("Era " + permission.status);
        if (permission.status === "A") {
            permissionStatus = "I";
        }
        else {
            permissionStatus = "A";
        }
        console.log("Virou " + permissionStatus);

        let array = this.state.permissoesDesativadas;
        this.state.selectedUser.perm.map((permissao) => {
            if (permissao.id_perm_usu_disp === permission.id_perm_usu_disp) {
                if (permissao.status === "A") {
                    permissao.status = "I"
                } else {
                    permissao.status = "A"
                }
            }
        });

        let newSelectedUser = this.state.selectedUser;
        await this.setState({ selectedUser: newSelectedUser });

        let indexOfPermissionEncountered = -1;
        this.state.permissoesDesativadas.map((newPermission) => {
            if (newPermission.id_perm_usu_disp === permission.id_perm_usu_disp) {
                indexOfPermissionEncountered = this.state.permissoesDesativadas.indexOf(newPermission);
                //console.log("Index encontrado: " + indexOfPermissionEncountered);
            }
        });

        if (indexOfPermissionEncountered !== -1) {
            array.splice(indexOfPermissionEncountered, 1);
        }

        let list = {
            id_perm_usu_disp: permission.id_perm_usu_disp,
            st_perm_usu_disp: permissionStatus
        }
        array.push(list);
        await this.setState({ permissoesDesativadas: array });
        console.log(this.state.permissoesDesativadas);
    };

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

                    <div className="users-rfid-list">
                        <p className="resultado-pesquisa">Exibindo <b>{this.state.filterUsers.length > 0 ? this.state.filterUsers.length : this.state.users.length}</b> registros</p>
                        <br></br>

                        <FlatList
                            list={this.state.filterUsers.length > 0 ? this.state.filterUsers : this.state.users}
                            renderItem={(item) => (
                                <div className="users-rfid-item">
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start" }} className={item.status === 'A' ? "users-rfid-item-info" : "users-rfid-item-info-disabled"} key={item.id_user}>
                                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                            <img className="person-avatar" src={item.imgPerfil} ></img>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                            <p><b>ID:</b> {item.id_user}</p>
                                            <p><b>Nome:</b> {item.name}</p>
                                            <p><b>Idade:</b> {item.age}</p>
                                            <p><b>Cargo:</b> {item.office}</p>
                                            {item.status === 'A' ? (<p><b>Status:</b> Ativo</p>) : (<p></p>)}
                                            {item.status === 'I' ? (<p><b>Status:</b> Inativo</p>) : (<p></p>)}
                                            <p><b>RFID:</b> {item.RFID}</p>
                                        </div>
                                        {/* {item.perm.forEach((p) => {
                                            return (
                                                <p>{JSON.stringify(p)}</p>
                                            );
                                        })} */}
                                    </div>

                                    <div className="users-rfid-options">
                                        <Button
                                            disabled={!utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario)}
                                            endIcon={<EditIcon />}
                                            onClick={() => { this.modalOpen(item) }}
                                            style={{ backgroundColor: 'green', color: '#FFF', width: '80%', height: '35%', marginBottom: '1%' }}
                                        >
                                            Editar
                                        </Button>

                                        {item.status === 'A' ? (
                                            <Button
                                                disabled={!utils.checkSpecificPermission("Remover", this.state.loggedOffice.permissoes.usuario)}
                                                endIcon={<EditIcon />}
                                                onClick={() => { this.handleDeactivateUserOpen(item) }}
                                                style={{ backgroundColor: 'red', color: '#FFF', width: '80%', height: '35%' }}
                                            >
                                                Desativar
                                            </Button>
                                        ) : (
                                                <Button
                                                    disabled={!utils.checkSpecificPermission("Remover", this.state.loggedOffice.permissoes.usuario)}
                                                    endIcon={<EditIcon />}
                                                    onClick={() => { this.handleReactivateUserOpen(item) }}
                                                    style={{ backgroundColor: 'blue', color: '#FFF', width: '80%', height: '35%' }}
                                                >
                                                    Reativar
                                                </Button>
                                            )
                                        }
                                    </div>
                                </div>
                            )}
                            /* sorchBy={['status', 'office', 'nome']} */
                            renderWhenEmpty={() => (
                                <div className="loader">
                                    <Loader
                                        type="Oval"
                                        //color="#ffa200"
                                        color="#FFF"
                                        height={100}
                                        width={100}
                                    //timeout={3000} //3 secs

                                    />
                                </div>
                            )}
                        />
                    </div>

                    {/* Modal */}
                    <Dialog
                        maxWidth={700}
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
                                {this.state.fileResult !== '' ?
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                        <img style={{ marginBottom: 10 }} className="img-perfil" src={"data:image/png;base64, " + this.state.fileResult} />
                                    </div>
                                    :
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                        <img style={{ marginBottom: 10 }} className="img-perfil" src={this.state.selectedUser.imgPerfil} />
                                    </div>
                                }

                                <div className='input-wrapper'>
                                    <label for='input-file'>
                                        Selecionar um arquivo
                                    </label>
                                    <input type="file" id="input-file" placeholder="Imagem de Perfil"
                                        onChange={this.handleFile} />
                                    <span id='file-name'></span>
                                </div>

                                <TextField
                                    disabled={!utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario)}
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
                                    <Input value={this.state.selectedUser.age} />
                                </FormControl>

                                <TextField
                                    disabled={!utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario)}
                                    autoFocus
                                    margin='dense'
                                    label='Função'
                                    type='text'
                                    value={this.state.selectedUser.office}
                                    onChange={this.handleOfficeChange}
                                    fullWidth

                                />
                                <InputLabel className="selectLabel">Status</InputLabel>
                                <Select
                                    //disabled={!utils.checkSpecificPermission("Remover", this.state.loggedOffice.permissoes.usuario)}
                                    disabled={true}
                                    value={this.state.selectedUser.status}
                                    onChange={this.handleStatusChange}
                                >
                                    <MenuItem value="A">Ativo</MenuItem>
                                    <MenuItem value="I">Inativo</MenuItem>
                                </Select>

                                <InputLabel className="selectLabel">Permissões</InputLabel>
                                <div className="user-permissions">
                                    <FlatList
                                        list={this.state.selectedUser.perm}
                                        renderItem={(permission) => (
                                            <div className="users-rfid-item">
                                                <div className="users-rfid-item-info" style={{ backgroundColor: '#999', width: '100%', color: '#000' }}>
                                                    <TextField
                                                        //disabled={!utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario)}
                                                        disabled={true}
                                                        autoFocus
                                                        margin='dense'
                                                        label='Empresa'
                                                        type='text'
                                                        value={this.state.selectedUser.perm[this.state.selectedUser.perm.indexOf(permission)].company}
                                                        //onChange={(e) => { this.handlePermissionCompanyNameChange(e, this.state.selectedUser.perm.indexOf(permission)) }}
                                                        fullWidth
                                                    />

                                                    <TextField
                                                        //disabled={!utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario)}
                                                        disabled={true}
                                                        autoFocus
                                                        margin='dense'
                                                        label='Sala'
                                                        type='text'
                                                        value={this.state.selectedUser.perm[this.state.selectedUser.perm.indexOf(permission)].no_localizacao}
                                                        //onChange={(e) => { this.handlePermissionCompanyNameChange(e, this.state.selectedUser.perm.indexOf(permission)) }}
                                                        fullWidth
                                                    />

                                                    <TextField
                                                        //disabled={!utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario)}
                                                        disabled={permission.status === "A" && utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario) === true ? false : true}
                                                        autoFocus
                                                        margin='dense'
                                                        label='Hora Início'
                                                        type='text'
                                                        value={this.state.selectedUser.perm[this.state.selectedUser.perm.indexOf(permission)].hr_inicio}
                                                        onChange={(e) => { this.handlePermissionInitialHourChange(e, this.state.selectedUser.perm.indexOf(permission)) }}
                                                        fullWidth
                                                    />

                                                    <TextField
                                                        //disabled={!utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario)}
                                                        disabled={permission.status === "A" && utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario) === true ? false : true}
                                                        autoFocus
                                                        margin='dense'
                                                        label='Hora Fim'
                                                        type='text'
                                                        value={this.state.selectedUser.perm[this.state.selectedUser.perm.indexOf(permission)].hr_final}
                                                        onChange={(e) => { this.handlePermissionFinalHourChange(e, this.state.selectedUser.perm.indexOf(permission)) }}
                                                        fullWidth
                                                    />

                                                    <FormControlLabel
                                                        style={{ width: '32.5%', paddingLeft: 5 }}
                                                        control={<Checkbox
                                                            color="primary"
                                                            checked={this.state.selectedUser.perm[this.state.selectedUser.perm.indexOf(permission)].permanente === "S" ? true : false}
                                                            onChange={(e) => { this.handlePermissionPermanentChange(e, this.state.selectedUser.perm.indexOf(permission)) }} />}
                                                        label="Permanente"
                                                    />

                                                    <TextField
                                                        //disabled={!utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario)}
                                                        disabled={true}
                                                        autoFocus
                                                        margin='dense'
                                                        label='Status'
                                                        type='text'
                                                        value={this.state.selectedUser.perm[this.state.selectedUser.perm.indexOf(permission)].status === "A" ? "Ativo" : "Inativo"}
                                                        //onChange={(e) => { this.handlePermissionCompanyNameChange(e, this.state.selectedUser.perm.indexOf(permission)) }}
                                                        fullWidth
                                                    />
                                                    {/* <p><b>Sala:</b> {permission.no_localizacao}</p>
                                                    <p><b>Hora Inicial:</b> {permission.hr_inicio}</p>
                                                    <p><b>Hora Final:</b> {permission.hr_final}</p>
                                                    <p><b>Permanente:</b> {permission.permanente}</p>
                                                    <p><b>Status:</b> {permission.status}</p> */}
                                                </div>

                                                <div className="users-rfid-options" style={{ backgroundColor: '#999' }}>
                                                    <Button
                                                        disabled={permission.status === "A" && utils.checkSpecificPermission("Editar", this.state.loggedOffice.permissoes.usuario) === true ? false : true}
                                                        endIcon={<EditIcon />}
                                                        onClick={() => { this.handleAddEditedPermission(permission) }}
                                                        style={{ backgroundColor: 'green', color: '#FFF', width: '80%', height: '35%', marginBottom: '1%' }}
                                                    >
                                                        Atualizar
                                                    </Button>

                                                    {permission.status === 'A' ? (
                                                        <Button
                                                            disabled={!utils.checkSpecificPermission("Remover", this.state.loggedOffice.permissoes.usuario)}
                                                            endIcon={<EditIcon />}
                                                            onClick={() => { this.handlePermissionStatusChange(permission) }}
                                                            style={{ backgroundColor: 'red', color: '#FFF', width: '80%', height: '35%' }}
                                                        >
                                                            Desativar
                                                        </Button>
                                                    ) : (
                                                            <Button
                                                                disabled={!utils.checkSpecificPermission("Remover", this.state.loggedOffice.permissoes.usuario)}
                                                                endIcon={<EditIcon />}
                                                                onClick={() => { this.handlePermissionStatusChange(permission) }}
                                                                style={{ backgroundColor: 'blue', color: '#FFF', width: '80%', height: '35%' }}
                                                            >
                                                                Reativar
                                                            </Button>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        )}
                                        renderWhenEmpty={() => (
                                            <div></div>
                                        )}
                                    />
                                </div>

                                <InputLabel id='labelTitle'>Permissão</InputLabel>
                                <div className="new-permission">
                                    <Select
                                        variant='outlined'
                                        labelId='labelTitle'
                                        label='Permissão'
                                        value={this.state.selectedSector}
                                        onChange={(e) => { this.handleSelectedSectorChange(e) }}
                                    >
                                        {this.state.setores.map((setor) => {
                                            if (setor.status === "A") {
                                                return (
                                                    <MenuItem key={setor.id_disp_loc} value={setor.id_disp_loc}>{setor.id_disp_loc} - {setor.no_loc}</MenuItem>
                                                );
                                            }
                                        })}
                                    </Select>

                                    <TextField
                                        type="time"
                                        name='hrini'
                                        label='Hora de inicio'
                                        InputLabelProps={{ shrink: true }}
                                        variant='outlined'
                                        style={{ background: '#FFF', borderRadius: 8, width: '20%', marginLeft: '2%', marginBottom: 10 }}
                                        value={this.state.hr_inicio} onChange={(e) => this.setState({ hr_inicio: e.target.value })}
                                    />
                                    <TextField
                                        type="time"
                                        label='Hora de fim'
                                        InputLabelProps={{ shrink: true }}
                                        variant='outlined'
                                        style={{ background: '#FFF', borderRadius: 8, width: '20%', marginLeft: '2%', marginBottom: 10 }}
                                        value={this.state.hr_final} onChange={(e) => this.setState({ hr_final: e.target.value })}
                                    />

                                    <FormControlLabel
                                        style={{ width: '32.5%', paddingLeft: 5 }}
                                        control={<Checkbox
                                            color="primary"
                                            checked={this.state.permanente}
                                            onChange={(e) => { this.handleNewPermissionPermanentChange(e) }} />}
                                        label="Permanente"
                                    />

                                    <Button
                                        onClick={this.handleAddPermission}
                                        variant='contained'
                                        style={{ marginLeft: '2%', background: 'green', color: "#FFF", height: 42 }} >
                                        <AddIcon color={"#FFF"} />
                                    </Button>
                                </div>

                                <div className='flatScroll'>
                                    <FlatList
                                        renderWhenEmpty={() => <div></div>}
                                        list={this.state.permissoesAdicionadas}
                                        renderItem={(item) => (
                                            <div style={{ display: "flex", flexDirection: "row", width: '100%' }}>
                                                <div className='usersList'>
                                                    <p><b>Localização: </b>{item.no_loc}</p>
                                                    <p><b>Hora de inicio: </b>{item.hr_inicio}</p>
                                                    <p><b>Hora fim: </b>{item.hr_final}</p>
                                                    <p><b>Permanente: </b>{item.permanente === "S" ? "Sim" : "Não"}</p>
                                                </div>

                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                    <Button
                                                        startIcon={<RemoveIcon color={"#FFF"} />}
                                                        onClick={() => (this.handleRemovePermission(this.state.permissoesAdicionadas.indexOf(item)))}
                                                        variant='contained'
                                                        style={{ background: 'red', color: "#FFF", marginLeft: '90%', marginTop: '-10%' }} />
                                                </div>
                                            </div>
                                        )}
                                    >
                                    </FlatList>
                                </div>

                                <FormControl disabled>
                                    <InputLabel>RFID</InputLabel>
                                    <Input value={this.state.selectedUser.RFID} />
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
                    <Dialog open={this.state.modalDeactivateOpen} onClose={this.handleDeactivateUserClose} arial-label-title="form-dialog-title">
                        <DialogTitle id='form-dialog-title'>Desativar Usuário</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Tem certeza que deseja desativar o usuário <b>{this.state.selectedUser.name} </b>?
                        </DialogContentText>
                        </DialogContent>


                        <DialogActions>
                            <Button onClick={() => { this.handleUserStatusChange(this.state.selectedUser) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                            <Button onClick={this.handleDeactivateUserClose} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                        </DialogActions>
                    </Dialog>
                    {/* Reativar usuario */}
                    <Dialog open={this.state.modalReactivateOpen} onClose={this.handleReactivateUserClose} arial-label-title='form-ialog-title'>
                        <DialogTitle>
                            Reativar Usuário
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>Deseja reativar usuário <b>{this.state.selectedUser.name}</b>?</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => { this.handleUserStatusChange(this.state.selectedUser) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                            <Button onClick={this.handleReactivateUserClose} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            );
        }
    }
}
export default withRouter(UsersRFID);