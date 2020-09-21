import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';

import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import './NewSectors.css';

class NewSectors extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nome: localStorage.nome,
            cargo: localStorage.cargo,
            companyName: '',
            roomName: '',
            area: 0,
            floor: 0,
            maxOccupation: 0,
            modalConfirmVisible: false
        };
    }

    handleAreaUpdate = async (e) => {
        await this.setState({ area: e.target.value });
        await this.setState({ maxOccupation: Math.trunc(this.state.area / 2) });
    }

    handleAddSector = () => {
        alert(this.state.companyName);
        alert(this.state.roomName);
        alert(this.state.area);
        alert(this.state.floor);
        alert(this.state.maxOccupation);
        this.handleCloseConfirmModal();
    }

    handleOpenConfirmModal = () => {
        this.setState({ modalConfirmVisible: true });
    }

    handleCloseConfirmModal = () => {
        this.setState({ modalConfirmVisible: false });
    }

    async componentDidMount() {
        if (!firebase.getCurrent()) {
            this.props.history.replace('/login');
            return null;
        }

        firebase.getUserName((info) => {
            localStorage.nome = info.val().nome;
            this.setState({ nome: localStorage.nome });
        });

        firebase.getUserPerfil((info) => {
            localStorage.cargo = info.val().cargo;
            this.setState({ cargo: localStorage.cargo });
        });

        /* if (this.state.cargo === "Auxiliar" || this.state.cargo === "Operador") {
            this.props.history.replace("/dashboard");
            return null;
        }
        else {
            alert("Acesso autorizado");
        } */
    }

    render() {
        return (
            <div className="container">
                <header id="new">
                    <Button startIcon={<ArrowBackIcon />} style={{ backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize" }} type="button" onClick={() => { this.props.history.goBack() }}>
                        Voltar
                    </Button>
                </header>
                <h1 style={{ color: '#FFF', marginTop: 10, marginBottom: 25 }}>Cadastrar Novo Setor</h1>
                <FormControl style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 5 }}>
                    <TextField
                        //value={this.state.selectedOffice.nomeCargo}
                        onChange={(e) => { this.setState({ companyName: e.target.value }) }}
                        style={{ width: 500 }}
                        autoFocus
                        margin="dense"
                        label="Nome da Empresa"
                        type="text"
                        fullWidth
                    />

                    <TextField
                        //value={this.state.selectedOffice.nomeCargo}
                        onChange={(e) => { this.setState({ roomName: e.target.value }) }}
                        style={{ width: 500 }}
                        autoFocus
                        margin="dense"
                        label="Nome/Nº Sala"
                        type="text"
                        fullWidth
                    />

                    <TextField
                        //value={this.state.selectedOffice.nomeCargo}
                        onChange={(e) => { this.handleAreaUpdate(e) }}
                        style={{ width: 500 }}
                        autoFocus
                        margin="dense"
                        label="Área"
                        type="number"
                        fullWidth
                    />

                    <TextField
                        //value={this.state.selectedOffice.nomeCargo}
                        onChange={(e) => { this.setState({ floor: e.target.value }) }}
                        style={{ width: 500 }}
                        autoFocus
                        margin="dense"
                        label="Andar"
                        type="number"
                        fullWidth
                    />

                    <TextField
                        value={this.state.maxOccupation}
                        style={{ width: 500 }}
                        autoFocus
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

export default withRouter(NewSectors);