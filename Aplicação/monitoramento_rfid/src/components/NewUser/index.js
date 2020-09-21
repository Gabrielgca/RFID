import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import './register.css';

import Button from '@material-ui/core/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';


class NewUser extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loggedName: localStorage.nome,
      loggedCargo: localStorage.cargo,
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
    alert("Cargo: " + event.target.value);
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
    if (!firebase.getCurrent()) {
      this.props.history.replace('/login');
      return null;
    }

    firebase.getUserName((info) => {
      localStorage.nome = info.val().nome;
      this.setState({ loggedName: localStorage.nome });
    });

    firebase.getUserPerfil((info) => {
      localStorage.cargo = info.val().cargo;
      this.setState({ loggedCargo: localStorage.cargo });
    });

    /* if (this.state.cargo === "Administrador" || this.state.cargo === "Gestor") {
      alert("Acesso autorizado");
    }
    else {
      this.props.history.replace("/dashboard");
      return null;
    } */

    this.getOffices();
  }

  render() {
    return (
      <div>
        <header id="new">
          {/* <Link to="/users">Voltar</Link> */}
          <Button startIcon={<ArrowBackIcon />} style={{ backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize" }} type="button" onClick={() => { this.props.history.goBack() }}>
            Voltar
          </Button>
        </header>
        <h1 className="register-h1" style={{ color: '#FFF' }}>Novo Usuario</h1>
        <form onSubmit={this.register} id="register">
          <label>Nome:</label><br />
          <input type="text" value={this.state.nome} autoFocus autoComplete="off"
            onChange={(e) => this.setState({ nome: e.target.value })} placeholder="Nome" /><br />

          <label>Email:</label><br />
          <input type="text" value={this.state.email} autoComplete="off"
            onChange={(e) => this.setState({ email: e.target.value })} placeholder="teste@teste.com" /><br />

          <label>Senha:</label><br />
          <input type="password" value={this.state.password} autoComplete="off"
            onChange={(e) => this.setState({ password: e.target.value })} placeholder="123123" /><br />

          {/*}
          <label>
            Cargo:
          <select value={this.state.cargo} onChange={this.handleChange}>
              <option value="Auxiliar">Auxiliar</option>
              <option value="Operador">Operador</option>
              <option value="Operador Master">Operador Master</option>
              <option value="Gestor">Gestor</option>
              <option value="Administrador">Administrador</option>
            </select>
          </label>
    {*/}

          <InputLabel id="demo-simple-select-label">Cargo</InputLabel>
          <Select
            style={{ marginBottom: 20 }}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={this.state.cargo}
            onChange={this.handleChange}
          >

            {this.state.offices.map((office) => {
              return (
                <MenuItem value={office.key}>{office.nomeCargo}</MenuItem>
              );
            })}
          </Select>

          <button type="submit">Cadastrar</button>

        </form>

      </div>
    );
  }
}

export default withRouter(NewUser);