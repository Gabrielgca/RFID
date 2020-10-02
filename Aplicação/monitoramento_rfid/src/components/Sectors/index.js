import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import utils from '../../utils';
import Loader from 'react-loader-spinner';

import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import BlockIcon from '@material-ui/icons/Block';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import DescriptionIcon from '@material-ui/icons/Description';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Avatar from '@material-ui/core/Avatar';

import FlatList from 'flatlist-react';
import { FormGroup, FormControlLabel } from '@material-ui/core';
import axios from 'axios';
import baseURL from '../../service';

import "./sectors.css";

const fileUpload = require('fuctbase64');

class Sectors extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nome: localStorage.nome,
            cargo: localStorage.cargo,
            filter: '',
            sectors: [],
            fileResult: '',
            filteredSectors: [],
            selectedSector: {
                id_loc: 0,
                companyName: '',
                roomName: '',
                area: 0,
                floor: 0,
                maxOccupation: 0,
                img: '',
            },
            modalConfirmShow: false,
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

        this.handleAreaUpdate = this.handleAreaUpdate.bind(this);
        this.handleValidateForm = this.handleValidateForm.bind(this);
    }

    searchSector = () => {
        //alert(this.state.filter);
        //this.setState({ filteredOffices: emptyArray });
        this.state.filteredSectors = [];
        this.state.sectors.forEach((sector) => {
            if (sector.companyName.toUpperCase().includes(this.state.filter.toUpperCase()) || sector.companyName.toUpperCase() == this.state.filter.toUpperCase()) {
                let list = {
                    id_loc: sector.id_loc,
                    companyName: sector.companyName,
                    roomName: sector.roomName,
                    area: sector.area,
                    floor: sector.floor,
                    maxOccupation: sector.maxOccupation,
                    img: sector.img
                }
                //alert(JSON.stringify(list));
                let array = this.state.filteredSectors;
                array.push(list);
                this.setState({ filteredSectors: array });
                //alert(JSON.stringify(list));
            }
        });
    };

    handleClearFilter = () => {
        this.setState({ filteredSectors: [] });
        this.setState({ filter: '' });
    };

    getAllSectors = () => {
        this.setState({ sectors: [] });
        axios.get(baseURL + "locInfo")
            .then(response => {
                console.log(response.data);
                this.setState({ sectors: response.data.locinfo })
            })
            .catch(error => {
                console.log(error);
            })
        // Função que buscará os dados dos setores no servidor, e salvará os dados
        // na variável "sectors"
    }

    handleUpdateSector = async () => {
        this.handleCloseConfirmModal();
        this.getAllSectors();
    }


    handleConfirmModalOpen = (sector) => {
        this.setState({ modalConfirmShow: true });
        let array = {
            id_loc: sector.id_loc,
            companyName: sector.companyName,
            roomName: sector.roomName,
            area: sector.area,
            floor: sector.floor,
            maxOccupation: sector.maxOccupation,
            img: sector.img
        }

        this.setState({ selectedSector: array });
    }

    handleCloseConfirmModal = () => {
        this.getAllSectors();
        this.setState({ modalConfirmShow: false });
        this.setState({ selectedSector: { id_loc: 0, companyName: '', roomName: '', area: 0, floor: 0, maxOccupation: 0 } });
        this.setState({ fileResult: '' })
    }

    handleAreaUpdate = async (e) => {
        let array = this.state.selectedSector;
        array.area = e.target.value;
        array.maxOccupation = Math.trunc(e.target.value / 2);
        await this.setState({ selectedSector: array })
    }

    handleFloorUpdate = (e) => {
        let array = this.state.selectedSector;
        array.floor = e.target.value;
        this.setState({ selectedSector: array });
        let string = e.target.value.toString();
    }

    handleValidateForm = async () => {
        if (this.state.selectedSector.companyName !== "" &&
            this.state.selectedSector.roomName !== "" &&
            this.state.selectedSector.area !== "" &&
            this.state.selectedSector.floor !== "" &&
            this.state.selectedSector.maxOccupation !== "") {
            //alert("Aqui enviará os dados ao servidor, e receberá uma resposta, de sucesso ou erro, que será exibida para o usuário!");
            let params = {
                id_loc: this.state.selectedSector.id_loc,
                companyName: this.state.selectedSector.companyName,
                roomName: this.state.selectedSector.roomName,
                area: this.state.selectedSector.area,
                floor: this.state.selectedSector.floor,
                img: this.state.fileResult !== '' ? this.state.fileResult : null
                //maxOccupation: this.state.selectedSector.maxOccupation
            }
            await axios.post(baseURL + "updateLoc", params)
                .then(response => {
                    console.log(response.data);
                    this.handleCloseConfirmModal();
                })
                .catch(error => {
                    console.log(error)
                });
                console.log(params)
        }
        else {
            alert("Dados inválidos. Revise o formulário");
        }

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

        if (utils.checkCategory(this.state.loggedOffice.permissoes.setor) !== true) {
            /* alert("Você não possui permissão para acessar esta página!"); */
            this.props.history.replace('/dashboard');
            return null;
        }
        else {
            this.setState({ pageLoading: false });
        }

        this.getAllSectors();

        /* if (this.state.cargo === "Auxiliar" || this.state.cargo === "Operador") {
            this.props.history.replace("/dashboard");
            return null;
        }
        else {
            alert("Acesso autorizado");
        } */
    }

    handleFile = async (e) => {
        fileUpload(e).then(result => {
            //this.fileResult = result;
            this.setState({ fileResult: result.base64 });
            //alert("Result: " + JSON.stringify(result));
        })
    }

    handleSelectFile = async (event) => {
        this.setState({ fileResult: event.target.value })
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
                    <h1 style={{ color: '#FFF' }}>Controle de Setores</h1>
                    <Paper style={{ marginTop: 50, marginBottom: 10 }}>
                        <InputBase
                            value={this.state.filter}
                            style={{ paddingLeft: 20, width: 500 }}
                            onChange={(e) => this.setState({ filter: e.target.value })}
                            placeholder="Pesquisa um setor..."
                        />
                        <IconButton type="button" onClick={this.searchSector}>
                            <SearchIcon />
                        </IconButton>

                        <IconButton type="button" onClick={this.handleClearFilter}>
                            <ClearIcon />
                        </IconButton>

                        <IconButton type="button" onClick={() => { this.props.history.push("/sectors/new") }}>
                            <AddIcon style={{ color: 'green' }} />
                        </IconButton>
                    </Paper>

                    <div className="sectors-list">
                        <p className="resultado-pesquisa">Exibindo <b>{this.state.filteredSectors.length > 0 ? this.state.filteredSectors.length : this.state.sectors.length}</b> registros</p>
                        <br></br>
                        <FlatList
                            list={this.state.filteredSectors.length > 0 ? this.state.filteredSectors : this.state.sectors}
                            renderItem={(item) => (
                                <div className="sectors-item">
                                    <div className={item.status === 'A' ? "sectors-item-info" : "sectors-item-info-disabled"} key={item.id_loc}>
                                        <p><b>Nome da Empresa: </b>{item.companyName}</p>
                                        <p><b>Sala: </b>{item.roomName}</p>
                                        <p><b>Área: </b>{item.area}</p>
                                        <p><b>Andar: </b>{item.floor}</p>
                                        <p><b>Ocupação máxima: </b>{item.maxOccupation}</p>
                                    </div>

                                    <div className="sectors-options">
                                        <Button
                                            endIcon={<DescriptionIcon />}
                                            onClick={() => { this.handleConfirmModalOpen(item) }}
                                            style={{ backgroundColor: 'green', color: '#FFF', width: '80%', height: '35%', marginBottom: '1%' }}
                                        >
                                            Detalhes
                                        </Button>

                                        {item.status === 'I' ? (
                                            <Button
                                                endIcon={<CheckCircleOutlineIcon />}
                                                style={{ backgroundColor: 'red', color: '#FFF', width: '80%', height: '35%' }}
                                            >
                                                Reativar
                                            </Button>
                                        ) : (
                                                <Button
                                                    endIcon={<BlockIcon />}
                                                    style={{ backgroundColor: 'red', color: '#FFF', width: '80%', height: '35%' }}
                                                >
                                                    Desativar
                                                </Button>
                                            )}
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
                            //sortBy={["item.cargo", { key: "lastName", descending: true }]}
                            sortBy={["companyName"]}
                        //groupBy={person => person.info.age > 18 ? 'Over 18' : 'Under 18'}
                        />

                    </div>

                    {/* Modal para edição dos dados da conta selecionada */}
                    <Dialog maxWidth={700} open={this.state.modalConfirmShow} onClose={this.handleCloseConfirmModal} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Editar Setor</DialogTitle>
                        <DialogContent style={{ width: 500 }}>
                            <div id='img-select'>
                                <div className='imgSelect'>
                                    {this.state.fileResult !== '' ?
                                        <img src={'data:image/png;base64, ' + this.state.fileResult} />
                                        : <img src={this.state.selectedSector.img} />
                                    }
                                </div>
                                <div></div>
                                <div className='input-wrapper'>
                                    <label for='input-file'>
                                        Alterar imagem
                                 </label>
                                    <input type="file" id="input-file" placeholder="Imagem de Perfil" onChange={this.handleFile} />
                                    <span id='file-name'></span>
                                </div>
                            </div>
                            <TextField
                                value={this.state.selectedSector.companyName}
                                onChange={(e) => { let array = this.state.selectedSector; array.companyName = e.target.value; this.setState({ selectedSector: array }) }}
                                style={{ width: '100%' }}
                                autoFocus
                                margin="dense"
                                label="Nome da Empresa"
                                type="text"
                                fullWidth
                            />

                            <TextField
                                value={this.state.selectedSector.roomName}
                                onChange={(e) => { let array = this.state.selectedSector; array.roomName = e.target.value; this.setState({ selectedSector: array }) }}
                                style={{ width: '100%' }}
                                autoFocus
                                margin="dense"
                                label="Nome da Sala"
                                type="text"
                                fullWidth
                            />

                            <TextField
                                value={this.state.selectedSector.area}
                                onChange={(e) => { this.handleAreaUpdate(e) }}
                                style={{ width: '100%' }}
                                autoFocus
                                margin="dense"
                                label="Área"
                                type="number"
                                fullWidth
                            />

                            <TextField
                                value={this.state.selectedSector.floor}
                                onChange={(e) => { this.handleFloorUpdate(e) }}
                                style={{ width: '100%' }}
                                autoFocus
                                margin="dense"
                                label="Andar"
                                type="number"
                                fullWidth
                            />

                            <TextField
                                value={this.state.selectedSector.maxOccupation}
                                //onChange={(e) => { let array = this.state.selectedSector; array.companyName = e.target.value; this.setState({ selectedSector: array }) }}
                                style={{ width: '100%' }}
                                autoFocus
                                margin="dense"
                                label="Ocupação máxima"
                                type="number"
                                fullWidth
                                disabled
                            />

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleValidateForm} style={{ backgroundColor: 'green', color: '#FFF' }}>
                                Salvar
                            </Button>
                            <Button onClick={this.handleCloseConfirmModal} style={{ backgroundColor: 'red', color: '#FFF' }}>
                                Cancelar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            );
        }
    }
}

export default withRouter(Sectors);