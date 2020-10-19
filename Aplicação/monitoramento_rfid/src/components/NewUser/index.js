import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import utils from '../../utils';
import './register.css';

import Button from '@material-ui/core/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Loader from 'react-loader-spinner';


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
      offices: [],
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
    this.setState({ isMounted: true });

    if (!firebase.getCurrent()) {
      this.props.history.replace('/');
      return null;
    }

    let result = await utils.getOffice(localStorage.cargo);
    if (this.state.isMounted === true) {
      this.setState({ loggedOffice: result });
    }

    if (utils.checkSpecificPermission("Cadastrar", this.state.loggedOffice.permissoes.conta) !== true) {
      /* alert("Você não possui permissão para acessar esta página!"); */
      this.props.history.replace('/dashboard');
      return null;
    }
    else {
      this.setState({ pageLoading: false });
    }

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
        <div>
          {/* <header id="new">
            <Link to="/users">Voltar</Link>
            <Button startIcon={<ArrowBackIcon />} style={{ backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize" }} type="button" onClick={() => { this.props.history.goBack() }}>
              Voltar
          </Button>
          </header> */}
          <div style={{ display: "flex", flexDirection: "row", width: '80%', margin: "0 auto", marginTop: 20, }}>
            <Button startIcon={<ArrowBackIcon />} style={{ backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize", width: "7.5%" }} type="button" onClick={() => { this.props.history.goBack() }}>
              Voltar
            </Button>
            <h1 style={{ color: '#008C35', textAlign: "center", width: "92.5%", paddingRight: "7.5%" }}>Novo Usuario</h1>
          </div>
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
}

export default withRouter(NewUser);