import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import './dispositivos.css';

//pesquisa
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import FlatList from 'flatlist-react';
import Loader from 'react-loader-spinner';


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

class DispositivoCadastrado extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filterDevice: [],
            filter: '',
            selectedDevice: { key: '', nameDevice: '', status: '' },
            nome: localStorage.nomeDevice,
            modalDeactivateOpen: false,
            modalReactivateOpen: false,
            devices: [{
                key: 1,
                nameDevice: "Sala de reunião",
                status: "Ativo",
            }, {
                key: 2,
                nameDevice: "Sala Principal",
                status: "Inativo",
            }],

            selectedPerson: {
                nameDevice: "",
                status: "",

            }
        };

        this.logout = this.logout.bind(this);
    }

    async componentDidMount() {
        if (!firebase.getCurrent()) {
            this.props.history.replace('/login');
            return null;
        }

    }

    modalOpen = async (user) => {
        this.setState({
            selectedDevice: {
                key: user.key,
                nameDevice: user.nameDevice,
                status: user.status,
            }
        })
        this.setState({ modalOpen: true });
    };

    modalClose = async () => {
        this.setState({ modalOpen: false });
    }

    logout = async () => {
        await firebase.logout()
            .catch((error) => {
                console.log(error);
            });
        localStorage.removeItem("nome");
        this.props.history.push('/');

    }


    nameDevice = async (event) => {
        let newNameDevice = this.state.selectedDevice;
        newNameDevice.nameDevice = event.target.value;
        this.setState({ selectedDevice: newNameDevice })
    }

    statusDevice = async (event) => {
        let newSelectedDevice = this.state.selectedDevice;
        newSelectedDevice.status = event.target.value;
        this.setState({ selectedDevice: newSelectedDevice })
    }


    editDevice = async () => {
        alert(JSON.stringify(this.state.selectedDevice))
    }

    searchDevice = () => {
        this.state.filterDevice = [];
        this.state.devices.forEach((user) => {

            if (user.nameDevice.toUpperCase().includes(this.state.filter.toUpperCase()) || user.nameDevice.toUpperCase() == this.state.filter.toUpperCase()) {

                let list = {
                    key: user.key,
                    nameDevice: user.nameDevice,
                    status: user.status
                }

                let array = this.state.filterDevice;
                array.push(list)
                this.setState({ filterDevice: array })
            }
        })
    }

    getUsers = () => {
        this.setState({ devices: [] });
        this.state.selectedDevice.map((allUsers) => {
            allUsers.forEach((oneUser) => {
                let list = {
                    key: oneUser.key,
                    nameDevice: oneUser.val().nameDevice,
                    status: oneUser.val().status,
                }
                this.setState({ devices: [...this.state.devices, list] });
            })
        })
    }

    reativeUser = () => {
        alert('Dispositivo reativado');
        this.handleCloseReactivateDevice();
        this.getUsers();
    }

    handleCloseReactivateDevice = () => {
        this.setState({ modalReactivateOpen: false });
        this.setState({ selectedUser: { key: '', nameDevice: '', status: '' } })
    }

    handleClearFilter = () => {
        this.setState({ filterDevice: [] });
        this.setState({ filter: '' });
    }

    handleDeactiveDevice = (user) => {
        this.setState({ selectedUser: { key: user.key, name: user.nameDevice, status: user.status } })
        this.setState({ modalDeactivateOpen: true })
    }

    handleCloseDeactiveUser = () => {
        this.setState({ modalOpen: false });
        this.setState({ selectedDevice: { key: '', nameDevice: '', status: '' } })
    }

    handleReative = (user) => {
        this.setState({ selectedUser: { key: user.key, nameDevice: user.nameDevice, status: user.status } })
        this.setState({ modalReactivateOpen: true })
    }

    deactiveUser = async (key) => {
        alert('dispositivo desativado')
        this.handleCloseDeactiveUser();
        this.getUsers();
    }

    handleCloseDeactivate = () => {
        this.setState({ modalDeactivateOpen: false });
        this.setState({ selectedUser: { key: '', nameDevice: '', status: '' } })
    }


    render() {
        return (
            <div id="area">
                <h1>Dispositivos Cadastrados</h1>
                <div className="pesquisa">
                    <Paper style={{ marginTop: 50 }}>
                        <InputBase
                            value={this.state.filter}
                            style={{ paddingLeft: 20, width: 500 }}
                            onChange={(e) => this.setState({ filter: e.target.value })}
                            placeholder="Faça uma pesquisa..."
                        />
                        <IconButton type="button" onClick={this.searchDevice}>
                            <SearchIcon />
                        </IconButton>

                        <IconButton type="button" onClick={this.handleClearFilter}>
                            <ClearIcon />
                        </IconButton>

                        <IconButton type="button" onClick={() => { this.props.history.push("/dispositivos/cadastro-dispositivo") }}>
                            <AddIcon style={{ color: 'green' }} />
                        </IconButton>
                    </Paper>
                </div>
                <FlatList
                    list={this.state.filterDevice.length > 0 ? this.state.filterDevice : this.state.devices}
                    renderItem={(item) => (
                        <div className="room-list">
                            <div className={item.status === "Ativo" ? "card" : "card-disabled"}>
                                <p><b>ID:</b> {item.key}</p>
                                <p><b>Localização do Dispositivo:</b> {item.nameDevice}</p>
                                <p><b>Status:</b> {item.status}</p>
                                <div className="btnArea">
                                    <Button endIcon={<EditIcon />} onClick={() => { this.modalOpen(item) }} style={{ backgroundColor: 'green', color: '#FFF', marginRight: 10 }}>Editar</Button>
                                    {item.status == 'Ativo' ? (
                                        <Button endIcon={<EditIcon />} onClick={() => { this.handleDeactiveDevice(item) }} style={{ backgroundColor: 'red', color: '#FFF' }}>Desativar</Button>
                                    ) : (
                                            <Button endIcon={<EditIcon />} onClick={() => { this.handleReative(item) }} style={{ backgroundColor: 'blue', color: '#FFF' }}>Reativar</Button>
                                        )
                                    }
                                </div>
                            </div>
                        </div>

                    )}
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
                    <DialogTitle id="alert-dialog-title">{"Detalhes do dispositivo"}</DialogTitle>
                    <DialogContent>
                        <FormControl disabled>
                            <InputLabel>ID</InputLabel>
                            <Input value={this.state.selectedDevice.key} />
                        </FormControl>
                        <DialogContentText id="alert-dialog-description">
                            <TextField
                                autoFocus
                                margin='dense'
                                id='name'
                                label='Nome'
                                type='text'
                                value={this.state.selectedDevice.nameDevice}
                                onChange={this.nameDevice}
                                fullWidth

                            />


                            <InputLabel className="selectLabel">Status</InputLabel>
                            <Select
                                value={this.state.selectedDevice.status}
                                onChange={this.statusDevice}
                            >
                                <MenuItem value="Ativo">Ativo</MenuItem>
                                <MenuItem value="Inativo">Inativo</MenuItem>
                            </Select>

                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.editDevice} autoFocus style={{ backgroundColor: 'green', color: '#FFF' }}>Salvar</Button>
                        <Button onClick={this.modalClose} style={{ backgroundColor: 'red', color: '#FFF' }} autoFocus>
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>


                {/* Desativar usuário */}
                <Dialog open={this.state.modalDeactivateOpen} onClose={this.handleDeactiveDevice} arial-label-title="form-dialog-title">
                    <DialogTitle id='form-dialog-title'>Desetivar Usuário</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Tem certeza que deseja desativar o usuário <b>{this.state.selectedDevice.nameDevice} </b>?
                    </DialogContentText>
                    </DialogContent>


                    <DialogActions>
                        <Button onClick={() => { this.deactiveUser(this.state.selectedDevice.nameDevice) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                        <Button onClick={this.handleCloseDeactivate} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                    </DialogActions>
                </Dialog>

                {/* Reativar usuario */}
                <Dialog open={this.state.modalReactivateOpen} onClose={this.handleReative} arial-label-title='form-ialog-title'>
                    <DialogTitle>
                        Reativar Usuário
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>Deseja reativar usuário <b>{this.state.selectedDevice.nameDevice}</b>?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { this.reativeUser(this.state.selectedDevice.key) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                        <Button onClick={this.handleCloseReactivateDevice} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withRouter(DispositivoCadastrado);