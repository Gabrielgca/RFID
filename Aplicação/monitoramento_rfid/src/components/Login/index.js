import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import './login.css';


class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    };

    this.entrar = this.entrar.bind(this);
    this.login = this.login.bind(this);
  }

  componentDidMount() {
    //Verificar se tem algum usuario logado!
    if (firebase.getCurrent()) {
      return this.props.history.replace('dashboard');
    }
  }

  entrar(e) {
    e.preventDefault();

    this.login();
  }

  login = async () => {
    const { email, password } = this.state;

    try {

      await firebase.login(email, password)
        .catch((error) => {
          if (error.code === 'auth/user-not-found') {
            alert('Este usuario não existe!');
          } else {
            alert('Codigo de erro:' + error.code);
            return null;
          }
        });
      this.props.history.replace('/dashboard');

    } catch (error) {
      alert(error.message);
    }

  }

  render() {
    return (
      <div>
        <form onSubmit={this.entrar} id="login">
          <h2>Acessar</h2>
          {/* <label>Email:</label><br /> */}
          <input type="email" autoComplete="off" autoFocus value={this.state.email}
            onChange={(e) => this.setState({ email: e.target.value })} placeholder="teste@teste.com"
          /><br />
          {/* <label>Password:</label><br /> */}
          <input type="password" autoComplete="off" value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })} placeholder="Sua senha"
          /><br />

          <button type="submit">Entrar</button>

          {/* <Link to="/register">Criar conta</Link> */}
        </form>
      </div>
    );
  }
}

export default withRouter(Login);