import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
//import './index.css';

import TextField from '@material-ui/core/TextField';


class NewOffice extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nome: '',
            email: '',
            cargo: 'Auxiliar',
            password: '',
            selectValue: 'Auxiliar',
            offices: []
        };

        this.register = this.register.bind(this);
        this.onRegister = this.onRegister.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ cargo: event.target.value });
    }

    register(e) {
        e.preventDefault();

        this.onRegister();
    }

    onRegister = async () => {
        try {
            const { nome, email, cargo, password } = this.state;

            await firebase.register(nome, email, cargo, password);
            this.props.history.replace('/dashboard');

        } catch (error) {
            alert(error.message);
        }
    }

    getOffices = () => {
        this.setState({ offices: [] });
        firebase.getAllOffices((allOffices) => {
            allOffices.forEach((oneOffice) => {
                let list = {
                    key: oneOffice.key,
                    nomeCargo: oneOffice.val().nomeCargo
                }
                //alert(JSON.stringify(list));
                this.setState({ offices: [...this.state.offices, list] });
            });
        });
    }

    async componentDidMount() {
        this.getOffices();
    }

    render() {
        return (
            <div>
                <header id="new">
                    <Link to="/offices">Voltar</Link>
                </header>
                <h1 className="register-h1" style={{ color: '#FFF' }}>Cadastrar Novo Cargo</h1>
                <form id="register">
                <TextField
                        //value={this.state.selectedOffice.nomeCargo}
                        //onChange={(e) => { let array = this.state.selectedOffice; array.nomeCargo = e.target.value; this.setState({ selectedOffice: array }) }}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Nome do Cargo2"
                        type="text"
                        fullWidth
                    //disabled={this.state.editDisable}
                    />
                </form>

                <form onSubmit={this.register} id="">
                    <TextField
                        //value={this.state.selectedOffice.nomeCargo}
                        //onChange={(e) => { let array = this.state.selectedOffice; array.nomeCargo = e.target.value; this.setState({ selectedOffice: array }) }}
                        style={{ width: '100%' }}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Nome do Cargo"
                        type="text"
                        fullWidth
                    //disabled={this.state.editDisable}
                    />
                </form>

            </div>
        );
    }
}

export default withRouter(NewOffice);