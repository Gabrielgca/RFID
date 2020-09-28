import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import utils from '../../utils';
import axios from 'axios';
import baseURL from '../../service';
import './devices.css';

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
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

class Devices extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filteredDevices: [],
            filter: '',
            nome: localStorage.nomeDevice,
            modalDeactivateOpen: false,
            modalReactivateOpen: false,
            devices: [],
            localization: [],
            selectedDevice: {
                key: 0,
                nameDevice: '',
                localization: '',
                status: '',
            },
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
        this.localizationDevice = this.localizationDevice.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
    }

    async componentDidMount() {
        this.setState({ isMounted: true });

        if (!firebase.getCurrent()) {
            this.props.history.replace('/login');
            return null;
        }

        /* await firebase.getUserPerfil((info) => {
            localStorage.cargo = info.val();
            this.setState({ cargo: localStorage.cargo });
            //console.log("Valor recebido: " + info.val());
        }); */

        let result = await utils.getOffice(localStorage.cargo);
        if (this.state.isMounted === true) {
            this.setState({ loggedOffice: result });
        }

        if (utils.checkCategory(this.state.loggedOffice.permissoes.dispositivo) !== true) {
            /* alert("Você não possui permissão para acessar esta página!"); */
            this.props.history.replace('/dashboard');
            return null;
        }
        else {
            this.setState({ pageLoading: false });
        }

        /*         await firebase.getUserName((info) => {
                    localStorage.nome = info.val().nome;
                    this.setState({ nome: localStorage.nome });
                }); */

        this.getDevices();
    }

    handleNameChange = (e) => {
        let newSelectedDevice = this.state.selectedDevice;
        newSelectedDevice.nameDevice = e.target.value;
        this.setState({ selectedDevice: newSelectedDevice });
    }

    modalOpen = async (user) => {
        this.getLocalization();
        await this.setState({
            selectedDevice: {
                key: user.id_disp,
                nameDevice: user.desc,
                localization: user.id_loc,
                status: user.status,
            }
        })
        this.setState({ modalOpen: true });
    };

    modalClose = async () => {
        this.setState({ selectedDevice: { key: '', localization: '', nameDevice: '', status: '' } });
        this.setState({ modalOpen: false });
        this.getDevices();
    }

    logout = async () => {
        await firebase.logout()
            .catch((error) => {
                console.log(error);
            });
        localStorage.removeItem("nome");
        this.props.history.push('/');

    }


    localizationDevice = async (event) => {
        let newNameDevice = this.state.selectedDevice;
        newNameDevice.localization = event.target.value;
        this.setState({ selectedDevice: newNameDevice })
    }

    statusDevice = async (event) => {
        let newSelectedDevice = this.state.selectedDevice;
        newSelectedDevice.status = event.target.value;
        this.setState({ selectedDevice: newSelectedDevice })
    }


    handleUpdateDevice = async () => {
        alert(JSON.stringify(this.state.selectedDevice));

        let params = {
            id_disp: this.state.selectedDevice.key,
            disp: this.state.selectedDevice.nameDevice,
            status: this.state.selectedDevice.status,
            loc: this.state.selectedDevice.localization
        }

        await axios.post(baseURL + 'updateDisp', params)
            .then(response => {
                console.log(response.data);
                this.modalClose();
            })
            .catch(error => {
                console.log(error);
            });
    }

    searchDevice = () => {
        this.state.filteredDevices = [];
        this.state.devices.forEach((user) => {

            if (user.nameDevice.toUpperCase().includes(this.state.filter.toUpperCase()) || user.nameDevice.toUpperCase() == this.state.filter.toUpperCase()) {

                let list = {
                    key: user.key,
                    nameDevice: user.nameDevice,
                    status: user.status
                }

                let array = this.state.filteredDevices;
                array.push(list)
                this.setState({ filteredDevices: array })
            }
        })
    }

    handleCloseReactivateDevice = () => {
        this.setState({ modalReactivateOpen: false });
        this.setState({ selectedDevice: { key: '', nameDevice: '', status: '' } });
        this.getDevices();
    }

    handleClearFilter = () => {
        this.setState({ filteredDevices: [] });
        this.setState({ filter: '' });
    }

    handleDeactiveDeviceOpen = (device) => {
        this.setState({ selectedDevice: { key: device.id_disp, status: device.status } });
        this.setState({ modalDeactivateOpen: true });
    }

    handleReactivateDeviceOpen = (device) => {
        this.setState({ selectedDevice: { key: device.id_disp, status: device.status } });
        this.setState({ modalReactivateOpen: true });
    }

    handleCloseDeactivateDevice = () => {
        this.setState({ modalDeactivateOpen: false });
        this.setState({ selectedDevice: { key: '', nameDevice: '', status: '' } });
    }

    handleReative = (user) => {
        this.setState({ selectedDevice: { key: user.key, nameDevice: user.nameDevice, status: user.status } })
        this.setState({ modalReactivateOpen: true })
    }

    handleCloseDeactivate = () => {
        this.setState({ modalDeactivateOpen: false });
        this.setState({ selectedDevice: { key: '', nameDevice: '', status: '' } })
    }

    getDevices = async () => {
        await axios.get(baseURL + 'dispInfo')
            .then(response => {
                console.log(response.data.dispinfo)
                this.setState({ devices: response.data.dispinfo });
            })
            .catch(error => {
                alert('Erro:' + JSON.stringify(error))
            })
    }

    getLocalization = async () => {
        await axios.get(baseURL + 'locInfo')
            .then(response => {
                //console.log(response.data.locinfo);
                this.setState({ localization: response.data.locinfo });
            })
            .catch(error => {
                alert('Erro:' + JSON.stringify(error))
            })
    }

    changeDeviceStatus = async (dispKey, newStatusDisp) => {
        if (newStatusDisp === "A") {
            newStatusDisp = "I"
        } else {
            newStatusDisp = "A"
        }

        let params = {
            id_disp: dispKey,
            status: newStatusDisp
        }

        console.log(params);

        axios.post(baseURL + "statusDisp", params)
            .then(response => {
                console.log("SUCESSO");
                console.log(response.data);
            })
            .catch(error => {
                console.log("ERRO")
                console.log(error);
            });

        this.handleCloseReactivateDevice();
        this.handleCloseDeactivateDevice();
        this.getDevices();
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
                    <h1 style={{ color: '#FFF' }}>Controle de Dispositivos</h1>
                    <Paper style={{ marginTop: 50, marginBottom: 10 }}>
                        <InputBase
                            value={this.state.filter}
                            style={{ paddingLeft: 20, width: 500 }}
                            onChange={(e) => this.setState({ filter: e.target.value })}
                            placeholder="Pesquisar dispositivos..."
                        />
                        <IconButton type="button" onClick={this.searchDevice}>
                            <SearchIcon />
                        </IconButton>

                        <IconButton type="button" onClick={this.handleClearFilter}>
                            <ClearIcon />
                        </IconButton>

                        <IconButton type="button" onClick={() => { this.props.history.push("/devices/new") }}>
                            <AddIcon style={{ color: 'green' }} />
                        </IconButton>
                    </Paper>

                    <div className="devices-list">
                        <p className="resultado-pesquisa">Exibindo <b>{this.state.filteredDevices.length > 0 ? this.state.filteredDevices.length : this.state.devices.length}</b> registros</p>
                        <br></br>
                        <FlatList
                            list={this.state.filteredDevices.length > 0 ? this.state.filteredDevices : this.state.devices}
                            renderItem={(item) => (
                                <div className="devices-item">
                                    <div className={item.status === 'A' ? "offices-item-info" : "offices-item-info-disabled"} key={item.key}>
                                        <p><b>ID:</b> {item.id_disp}</p>
                                        <p><b>Descrição do Dispositivo:</b> {item.desc}</p>
                                        <p><b>Localização do Dispositivo:</b> {item.no_loc}</p>
                                        {item.status === 'A' ? (<p><b>Status:</b> Ativo</p>) : (<p></p>)}
                                        {item.status === 'I' ? (<p><b>Status:</b> Inativo</p>) : (<p></p>)}
                                        {/* <p>{JSON.stringify(item)}</p> */}
                                    </div>

                                    <div className="devices-options">
                                        <Button
                                            endIcon={<EditIcon />}
                                            onClick={() => { this.modalOpen(item) }}
                                            style={{ backgroundColor: 'green', color: '#FFF', width: '80%', height: '35%', marginBottom: '1%' }}
                                        >
                                            Editar
                                        </Button>

                                        {item.status === 'A' ? (
                                            <Button
                                                endIcon={<EditIcon />}
                                                onClick={() => { this.handleDeactiveDeviceOpen(item) }}
                                                style={{ backgroundColor: 'red', color: '#FFF', width: '80%', height: '35%' }}
                                            >
                                                Desativar
                                            </Button>
                                        ) : (
                                                <Button
                                                    endIcon={<EditIcon />}
                                                    onClick={() => { this.handleReactivateDeviceOpen(item) }}
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
                        fullWidth={true}
                        className="detailsModal"
                        open={this.state.modalOpen}
                        onClose={this.modalClose}
                        aria-labelledby="alert-dialog-title"
                        aria-aria-describedby="alert-dialog-description"

                    >
                        <DialogTitle id="alert-dialog-title">{"Detalhes do dispositivo"}</DialogTitle>
                        <DialogContent>

                            <FormControl disabled style={{ marginBottom: 25 }}>
                                <InputLabel>ID</InputLabel>
                                <Input value={this.state.selectedDevice.key} />
                            </FormControl>
                            <DialogContentText>
                                <TextField variant='outlined' label='Descrição do dispositivo' value={this.state.selectedDevice.nameDevice} onChange={this.handleNameChange} />
                            </DialogContentText>

                            <DialogContentText id="alert-dialog-description">
                                <InputLabel>Localização</InputLabel>

                                <Select
                                    style={{ width: 180 }}
                                    label="localização"
                                    value={this.state.selectedDevice.localization}
                                    onChange={(event) => { this.localizationDevice(event) }}
                                >
                                    {this.state.localization.map((loc) => {
                                        return (
                                            //Alterar para enviar id_loc em vez de roomName
                                            <MenuItem value={loc.roomName}>{loc.id_loc} - {loc.roomName} </MenuItem>
                                        )
                                    })}


                                </Select>
                            </DialogContentText>


                            <InputLabel className="selectLabel">Status</InputLabel>
                            <Select
                                value={this.state.selectedDevice.status}
                                onChange={this.statusDevice}
                            >
                                <MenuItem value="A">Ativo</MenuItem>
                                <MenuItem value="I">Inativo</MenuItem>
                            </Select>



                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleUpdateDevice} autoFocus style={{ backgroundColor: 'green', color: '#FFF' }}>Salvar</Button>
                            <Button onClick={this.modalClose} style={{ backgroundColor: 'red', color: '#FFF' }} autoFocus>
                                Cancelar
                        </Button>
                        </DialogActions>
                    </Dialog>


                    {/* Desativar usuário */}
                    <Dialog open={this.state.modalDeactivateOpen} onClose={this.handleCloseDeactivateDevice} arial-label-title="form-dialog-title">
                        <DialogTitle id='form-dialog-title'>Desativar Usuário RFID</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Tem certeza que deseja desativar o dispositivo <b>{this.state.selectedDevice.nameDevice} </b>?
                    </DialogContentText>
                        </DialogContent>


                        <DialogActions>
                            <Button onClick={() => { this.changeDeviceStatus(this.state.selectedDevice.key, this.state.selectedDevice.status) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                            <Button onClick={this.handleCloseDeactivateDevice} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Reativar usuario */}
                    <Dialog open={this.state.modalReactivateOpen} onClose={this.handleCloseReactivateDevice} arial-label-title='form-ialog-title'>
                        <DialogTitle>
                            Reativar Usuário
                    </DialogTitle>
                        <DialogContent>
                            <DialogContentText>Tem certeza que deseja reativar o dispositivo <b>{this.state.selectedDevice.nameDevice}</b>?</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => { this.changeDeviceStatus(this.state.selectedDevice.key, this.state.selectedDevice.status) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                            <Button onClick={this.handleCloseReactivateDevice} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            );
        }
    }
}

export default withRouter(Devices);