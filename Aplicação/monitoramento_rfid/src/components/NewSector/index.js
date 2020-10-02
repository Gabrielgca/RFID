import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import utils from '../../utils';

import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Loader from 'react-loader-spinner';
import axios from 'axios';
import baseURL from '../../service';


import './NewSectors.css';

const fileUpload = require('fuctbase64');

class NewSectors extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nome: localStorage.nome,
            cargo: localStorage.cargo,
            companyName: '',
            roomName: '',
            fileResult:'',
            imgStatus: false,
            area: 0,
            floor: 0,
            maxOccupation: 0,
            modalConfirmVisible: false,
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
    }

    handleAreaUpdate = async (e) => {
        await this.setState({ area: e.target.value });
        await this.setState({ maxOccupation: Math.trunc(this.state.area / 2) });
    }

    handleFile = async (e) => {
        fileUpload(e).then(result => {
            //this.fileResult = result;
            this.setState({ fileResult: result.base64 });
            this.setState({ imgStatus: true})
            //alert("Result: " + JSON.stringify(result));
        });
    }

    handleAddSector = async () => {
        /* alert(this.state.companyName);
        alert(this.state.roomName);
        alert(this.state.area);
        alert(this.state.floor);
        alert(this.state.maxOccupation); */
        if ((this.state.companyName !== '')
            && (this.state.roomName !== '')
            && (this.state.floor !== '')
            && (this.state.fileResult !== '')) {
        }
        else {
            alert('Os campos precisam ser preenchidos!')
            return null
        }
        let params = {
            companyName: this.state.companyName,
            roomName: this.state.roomName,
            floor: this.state.floor,
            area: this.state.area,
            img: this.state.fileResult
        }
        await axios.post(baseURL + "registerLoc", params)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
            })

            console.log(params)



        this.handleCloseConfirmModal();
    }

    handleOpenConfirmModal = () => {
        this.setState({ modalConfirmVisible: true });
    }

    handleCloseConfirmModal = () => {
        this.setState({ modalConfirmVisible: false });
    }

    async componentDidMount() {
        this.setState({ isMounted: true });
        

        if (!firebase.getCurrent()) {
            this.props.history.replace('/');
            return null;
        }

        let result = await utils.getOffice(localStorage.cargo);
        if (this.state.isMounted === true) {
            this.setState({ loggedOffice: result });
            
        }

        if (utils.checkSpecificPermission("Cadastrar", this.state.loggedOffice.permissoes.setor) !== true) {
            /* alert("Você não possui permissão para acessar esta página!"); */
            this.props.history.replace('/dashboard');
            return null;
        }
        else {
            this.setState({ pageLoading: false });
        }

        /* if (this.state.cargo === "Auxiliar" || this.state.cargo === "Operador") {
            this.props.history.replace("/dashboard");
            return null;
        }
        else {
            alert("Acesso autorizado");
        } */
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
                        <Button startIcon={<ArrowBackIcon />} style={{ backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize" }} type="button" onClick={() => { this.props.history.goBack() }}>
                            Voltar
                        </Button>
                    </header>
                    <h1 style={{ color: '#FFF', marginTop: 10, marginBottom: 25 }}>Cadastrar Novo Setor</h1>
                    <FormControl  style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 5, width:'50%' }}>
                        <div className="check-area">
                            <div className="empty-check">
                                {this.state.fileResult !== '' ?
                                    <div className="div-img-perfil">
                                        <img className="img-to-send" src={"data:image/png;base64, " + this.state.fileResult} />
                                    </div>
                                    :
                                    <div></div>
                                }

                                {this.state.imgStatus === true ? (
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                        <circle className="path circle" fill="none" stroke="#318a04" strokeWidth="6" strokeMiterlimit="10" cx="65.1" cy="65.1" r="62.1" />
                                        <polyline className="path check" fill="none" stroke="#318a04" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 " />
                                    </svg>
                                ) : (
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                                            <circle className="path circle" fill="none" stroke="#FFA200" strokeWidth="6" strokeMiterlimit="10" cx="65.1" cy="65.1" r="62.1" />
                                            <line className="path line" fill="none" stroke="#FFA200" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3" />
                                            <line className="path line" fill="none" stroke="#FFA200" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2" />
                                        </svg>
                                    )}
                            </div>
                            {/* <h4>Status: {this.state.imgStatus === true ? "Cartão disponível" : "Cartão já utilizado!"}</h4> */}
                        </div>


                        <div className='input-wrapper'>
                            <label for='input-file'>
                                Selecionar uma imagem
              </label>
                            <input type="file" id="input-file" placeholder="Imagem de Perfil"
                                onChange={this.handleFile} />
                            <span id='file-name'></span>
                        </div>
                        <TextField
                            //value={this.state.selectedOffice.nomeCargo}
                            onChange={(e) => { this.setState({ companyName: e.target.value }) }}
                            style={{ width: 500 }}
                            autoFocus
                            margin="dense"
                            label="Nome da Empresa"
                            type="text"
                            fullWidth
                            required
                        />

                        <TextField
                            //value={this.state.selectedOffice.nomeCargo}
                            onChange={(e) => { this.setState({ roomName: e.target.value }) }}
                            style={{ width: 500 }}
                            margin="dense"
                            label="Nome/Nº Sala"
                            type="text"
                            fullWidth
                            required
                        />

                        <TextField
                            //value={this.state.selectedOffice.nomeCargo}
                            onChange={(e) => { this.handleAreaUpdate(e) }}
                            style={{ width: 500 }}
                            margin="dense"
                            label="Área"
                            type="number"
                            fullWidth
                            required
                        />

                        <TextField
                            //value={this.state.selectedOffice.nomeCargo}
                            onChange={(e) => { this.setState({ floor: e.target.value }) }}
                            style={{ width: 500 }}
                            margin="dense"
                            label="Andar"
                            type="number"
                            fullWidth
                            required
                        />

                        <TextField
                            value={this.state.maxOccupation}
                            style={{ width: 500 }}
                            margin="dense"
                            label="Limite Máximo de Pessoas"
                            type="number"
                            fullWidth
                            disabled
                        />

                        <Button onClick={this.handleOpenConfirmModal} style={{ backgroundColor: 'green', color: '#FFF', marginRight: 10, width: '100%' }}>
                            Cadastrar
                        </Button>
                    </FormControl>

                    <Dialog open={this.state.modalConfirmVisible} onClose={this.handleCloseConfirmModal}>
                        <DialogTitle id="alert-dialog-title">{"Tem certeza de que deseja cadastrar este Setor?"}</DialogTitle>
                        <DialogActions>
                            <Button onClick={this.handleAddSector} color="primary">
                                Cadastrar
                            </Button>
                            <Button onClick={this.handleCloseConfirmModal} color="primary" autoFocus>
                                Cancelar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            );
        }
    }
}

export default withRouter(NewSectors);