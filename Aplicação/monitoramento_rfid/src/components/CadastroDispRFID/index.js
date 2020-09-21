import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import firebase from '../../firebase';
import './CadastroDisp.css';

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
import { InputLabel } from '@material-ui/core';


import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import baseURL from "../../service";
import io from 'socket.io-client';
import axios from 'axios';



class CadastroDispRFID extends Component {

    constructor(props) {
        super(props);
        this.state = {
            key: '',
            status: '',
            localization: '',
            nomeDispositivo: '',
            localization: [],
            cad: [],

            selectLocazation: {
                localization: '',
                status:''
            }

        }


        this.registerDevices = this.registerDevices.bind(this)
    }

    componentDidMount() {
        if (!firebase.getCurrent()) {
            this.props.history.replace('/');
            return null;
        }
        this.getLocalization();
    }


    localizationDevices = async (event) =>{
        let newLocalization = this.state.selectLocazation;
        newLocalization.localization = event.target.value;
        this.setState({ selectLocazation: newLocalization })
    }

    statusDevice = async (event) =>{
        let newStatus = this.state.selectLocazation;
        newStatus.status = event.target.value;
        this.setState({ selectLocazation: newStatus })
    }

    getStatusDevices = async () =>{
        await axios.get(baseURL + 'dispInfo')
        .then(response =>{
            this.setState({ status: response.data.status})
        })
        .catch(error =>{
            alert('Erro:' + JSON.stringify(error))
        })
    }

    getLocalization = async () => {
        await axios.get(baseURL + 'locInfo')
            .then(response => {
                this.setState({ localization: response.data.locinfo })
            })
            .catch(error => {
                alert('Erro:' + JSON.stringify(error))
            })
    }

    getStatus = async (user) =>{
        await this.setState({
            selectLocazation:{
                status: user.status,
                localization: user.loc
            }
        })
    }



    registerDevices = async (e) => {
        e.preventDefault();
        if (this.state.selectLocazation.status !== '' &&
            this.state.nomeDispositivo !== '') {
                
            const params = {
                desc: this.state.nomeDispositivo,
                status: this.state.selectLocazation.status,
                loc: this.state.selectLocazation.localization

            }
            
            
            await axios.post(baseURL + 'registerDisp' , params)
                .then(response => {
                    alert("Usuário salvo com sucesso")
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
        return (

            <div className="formArea">
                <header id="new">
                    <Link to="/dispositivos">Voltar</Link>
                </header>

                <form id="formRFID">
                    <h1>Cadastro de dispositivo RFID</h1>
                    <TextField label='Descrição do Dispositivo' variant='outlined' style={{ marginBottom: 20 }} onChange={(e) => this.setState({ nomeDispositivo: e.target.value }) } />
                    <FormControl variant="outlined" style={{ marginBottom: 20 }}>
                        <InputLabel>Localização</InputLabel>
                        <Select
                            value={this.state.selectLocazation.localization}
                            onChange={this.localizationDevices}
                            label="Localização"
                        >
                            {this.state.localization.map((loc) => {
                                return (
                                    <MenuItem value={loc.id_loc}>{loc.id_loc} - {loc.loc}</MenuItem>
                                )
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
                            value={this.state.selectLocazation.status}
                            onChange={this.statusDevice}
                        >
                            <MenuItem value='A'>Ativo</MenuItem>
                            <MenuItem value='I'>Inativo</MenuItem>
                        </Select>
                    </FormControl>

                    <Button onClick={this.registerDevices} variant="contained" disableElevation style={{ height: 50, background: 'green', color: '#FFF' }}>Salvar</Button>
                </form>

            </div>
        )
    }
}

export default withRouter(CadastroDispRFID);
