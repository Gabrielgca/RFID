import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import './office.css';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FlatList from 'flatlist-react';

import firebase from '../../firebase';

class Offices extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nomeCargo: '',
            modalConfirmationOpen: false,
            offices: [],
            peoplePerOffice: []
        }
    }

    handleModalOpen = () => {
        this.addNewOffice();
        this.setState({ modalConfirmationOpen: true });
    }

    handleModalClose = () => {
        this.setState({ modalConfirmationOpen: false });
        this.setState({ nomeCargo: '' });
    }

    addNewOffice = () => {
        if (this.state.nomeCargo !== '') {
            firebase.addOffice(this.state.nomeCargo);
        }
        else {
            alert("Preencha o nome do cargo que deseja cadastrar!");
        }
    }

    countPeoplePerOffices = () => {
        firebase.getAllUsers((allUsers) => {
            allUsers.forEach((oneUser) => {
                //FAZER A LÓGICA DA CONTAGEM POR AQUI
            });
        });
    }

    async componentDidMount() {
        firebase.getAllOffices((allOffices) => {
            allOffices.forEach((oneOffice) => {
                let list = {
                    key: oneOffice.key,
                    nomeCargo: oneOffice.val().nomeCargo
                }
                this.setState({ offices: [...this.state.offices, list] });
            });
        })
    }

    render() {
        return (
            <div className="content">
                <header id="new">
                    <Link to="/users">Voltar</Link>
                </header>
                <h1 className="register-h1" style={{ color: '#FFF' }}>Novo Cargo</h1>
                <FlatList
                    list={this.state.offices}
                    renderItem={(item) => (
                        <div className="card">
                            <p>Cargo: <b>{item.nomeCargo}</b></p>
                        </div>
                    )}
                    renderWhenEmpty={() => <div>Carregando...</div>}
                    //sortBy={["item.cargo", { key: "lastName", descending: true }]}
                    sortBy={["cargo", "nome", "status"]}
                //groupBy={person => person.info.age > 18 ? 'Over 18' : 'Under 18'}
                />

                <TextField
                    value={this.state.nomeCargo}
                    onChange={(e) => { this.setState({ nomeCargo: e.target.value }) }}
                    style={{ width: 500 }}
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Nome do Cargo"
                    type="text"
                    fullWidth
                />

                <Button onClick={this.handleModalOpen} style={{ backgroundColor: 'white', color: 'green' }}>
                    Salvar
                    </Button>



                {/* Modal para confirmação do cadastro o novo cargo */}
                <Dialog open={this.state.modalConfirmationOpen} onClose={this.handleModalClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Cargo cadastrado com sucesso!</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.handleModalClose} style={{ backgroundColor: 'blue', color: '#FFF' }}>
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withRouter(Offices);