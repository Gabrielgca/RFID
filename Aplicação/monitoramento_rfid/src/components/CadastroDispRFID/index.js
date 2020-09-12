import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, withRouter } from 'react-router-dom';
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
            nomeDispositivo: '',
        }

        
        this.registerDevices = this.registerDevices.bind(this)
    }

    componentDidMount() {
        if (!firebase.getCurrent()) {
            this.props.history.replace('/');
            return null;
        }
    }

    

    registerDevices = async (e) => {
        
        e.preventDefault();

        if (this.state.key !== '' &&
            this.state.status !== '' &&
            this.state.nomeDispositivo !== '') {
            const params = {
                codigoDispRFID: this.state.key,
                statusRFID: this.state.nomeDispositivo,
                nomeDispRFID: this.state.nomeDispositivo
            }
           
            await axios.post(baseURL + 'registerDevices' + params)
                .then(response => {
                    alert("Usuário salvo com sucesso")
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
                {JSON.stringify(this.codigoDispRFID)}
                <form onSubmit={this.registerDevices} id="formRFID">
                    <h1>Cadastro de dispositivo RFID</h1>
                    <TextField id="outlined-basic" label="ID" variant="outlined" style={{ marginBottom: 20 }}
                        value={this.state.key} autoFocus onChange={(e) => this.setState({ key: e.target.value })} required />
                    <Select
                        style={{ marginBottom: 20, width: 100 }}
                        autoFocus
                        margin='dense'
                        label='Status'
                        type='text'
                        value={this.state.status}
                        onChange={(e) => this.setState({ status: e.target.value })}
                    >
                        <MenuItem value='ativo'>Ativado</MenuItem>
                        <MenuItem value='inativo'>Inativo</MenuItem>
                    </Select>
                    <TextField id="outlined-basic" label="Localização" variant="outlined" style={{ marginBottom: 20 }}
                        value={this.state.nomeDispositivo} onChange={(e) => this.setState({ nomeDispositivo: e.target.value })} required />
                    <Button type='submit' variant="contained" disableElevation style={{ height: 50, background: 'green', color: '#FFF' }}>Salvar</Button>
                </form>

            </div>
        )
    }
}

export default withRouter(CadastroDispRFID);
