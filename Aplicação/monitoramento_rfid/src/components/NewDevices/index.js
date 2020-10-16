import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import firebase from '../../firebase';
import utils from '../../utils';
import './NewDevices.css';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { InputLabel } from '@material-ui/core';


import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import baseURL from "../../service";
import io from 'socket.io-client';
import axios from 'axios';



class NewDevices extends Component {

    constructor(props) {
        super(props);
        this.state = {
            key: '',
            status: '',
            localization: '',
            nomeDispositivo: '',
            localization: [],
            cad: [],

            selectLocalization: {
                localization: '',
                status: 'A'
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
        }


        this.registerDevices = this.registerDevices.bind(this)
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

        if (utils.checkSpecificPermission("Cadastrar", this.state.loggedOffice.permissoes.dispositivo) !== true) {
            /* alert("Você não possui permissão para acessar esta página!"); */
            this.props.history.replace('/dashboard');
            return null;
        }
        else {
            this.setState({ pageLoading: false });
        }

        this.getLocalization();
    }


    localizationDevices = async (event) => {
        let newLocalization = this.state.selectLocalization;
        newLocalization.localization = event.target.value;
        this.setState({ selectLocalization: newLocalization })
    }

    statusDevice = async (event) => {
        let newStatus = this.state.selectLocalization;
        newStatus.status = event.target.value;
        this.setState({ selectLocalization: newStatus })
    }

    getStatusDevices = async () => {
        await axios.get(baseURL + 'dispInfo')
            .then(response => {
                this.setState({ status: response.data.status })
            })
            .catch(error => {
                alert('Erro:' + JSON.stringify(error))
            })
    }

    getLocalization = async () => {
        await axios.get(baseURL + 'locInfo')
            .then(response => {
                console.log(response.data.locinfo)
                this.setState({ localization: response.data.locinfo })
            })
            .catch(error => {
                alert('Erro:' + JSON.stringify(error))
            })
    }

    getStatus = async (user) => {
        await this.setState({
            selectLocalization: {
                status: user.status,
                localization: user.loc
            }
        })
    }

    registerDevices = async (e) => {
        e.preventDefault();
        if (this.state.selectLocalization.status !== '' &&
            this.state.nomeDispositivo !== '') {

            const params = {
                desc: this.state.nomeDispositivo,
                status: this.state.selectLocalization.status,
                loc: this.state.selectLocalization.localization

            }

            await axios.post(baseURL + 'registerDisp', params)
                .then(response => {
                    alert("Dispositivo salvo com sucesso")
                    console.log(response);

                })
                .catch(error => {
                    alert("Erro: " + JSON.stringify(error))
                })

            this.props.history.push('/dashboard')
        } else {
            this.setState({ alert: 'Preencha todos os campos!' })
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
                <div className="formArea">
                    <header id="new">
                        {/* <Link to="/offices">Voltar</Link> */}
                        <Button startIcon={<ArrowBackIcon />} style={{marginTop:'15%', backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize" }} type="button" onClick={() => { this.props.history.goBack() }}>
                            Voltar
                        </Button>
                    </header>

                    <form id="formRFID">
                        <h1>Cadastro de dispositivo RFID</h1>
                        <TextField label='Descrição do Dispositivo' variant='outlined' style={{ marginBottom: 20 }} onChange={(e) => this.setState({ nomeDispositivo: e.target.value })} />
                        <FormControl variant="outlined" style={{ marginBottom: 20 }}>
                            <InputLabel>Localização</InputLabel>
                            <Select
                                value={this.state.selectLocalization.localization}
                                onChange={this.localizationDevices}
                                label="Localização"
                            >
                                {this.state.localization.map((loc) => {
                                    if ((loc.status === "A" && loc.available) === true) {
                                        return (
                                            <MenuItem value={loc.id_loc}>{loc.companyName} - {loc.roomName}</MenuItem>
                                        )
                                    }
                                })}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined">
                            <InputLabel>Status</InputLabel>
                            <Select
                                style={{ marginBottom: 20, width: 100 }}
                                autoFocus
                                margin='dense'
                                label='Status'
                                type='text'
                                value={this.state.selectLocalization.status}
                                onChange={this.statusDevice}
                            >
                                <MenuItem value='A'>Ativo</MenuItem>
                                <MenuItem value='I'>Inativo</MenuItem>
                            </Select>
                        </FormControl>

                        <Button onClick={this.registerDevices} variant="contained" disableElevation style={{ height: 50, background: 'green', color: '#FFF' }}>Salvar</Button>
                    </form>

                </div>
            );
        }
    }
}

export default withRouter(NewDevices);
