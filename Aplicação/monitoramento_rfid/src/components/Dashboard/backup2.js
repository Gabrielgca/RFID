import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import firebase from '../../firebase';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nome: localStorage.nome,
      cargo: localStorage.cargo,
      selectedOffice: { key: '', nomeCargo: '', status: '', permissoes: { cargo: [], conta: [], dispositivo: [], setor: [], usuario: [], dashboard: [] } },
    }

    this.checkCategory = this.checkCategory.bind(this);
  }

  async getOffice() {
    await firebase.getAllOffices((allOffices) => {
      allOffices.forEach((office) => {
        if (office.val().nomeCargo === this.state.cargo) {
          let list = {
            key: office.key,
            nomeCargo: office.val().nomeCargo,
            permissoes: office.val().permissoes,
            status: office.val().status
          }
          this.setState({ selectedOffice: list });
        }
      })
    });
  }

  checkCategory(categoryName) {
    let perm;
    if (categoryName === "cargo") {
      perm = this.state.selectedOffice.permissoes.cargo;
    }
    else {
      if (categoryName === "conta") {
        perm = this.state.selectedOffice.permissoes.conta;
      }
      else {
        if (categoryName === "dispositivo") {
          perm = this.state.selectedOffice.permissoes.dispositivo;
        }
        else {
          if (categoryName === "setor") {
            perm = this.state.selectedOffice.permissoes.setor;
          }
          else {
            if (categoryName === "usuario") {
              perm = this.state.selectedOffice.permissoes.usuario;
            }
            else {
              if (categoryName === "dashboard") {
                perm = this.state.selectedOffice.permissoes.dashboard;
              }
            }
          }
        }
      }
    }

    let encontrou = 0;
    perm.map((permission) => {
      if (permission.status === true) {
        encontrou = 1;
      }
    });

    if (encontrou === 0) {
      return false;
    }
    else {
      return true;
    }
  }

  async componentDidMount() {
    await this.getOffice();

    firebase.getUserName((info) => {
      localStorage.nome = info.val().nome;
      this.setState({ nome: localStorage.nome });
    });

    firebase.getUserPerfil((info) => {
      localStorage.cargo = info.val();
      this.setState({ cargo: localStorage.cargo });
    });

    let result = this.checkCategory("cargo");
    console.log("A função retornou: " + result);
  }



  render() {
    return (
      <div>
        <p>{JSON.stringify(this.state.selectedOffice)}</p>
      </div>
    );
  }
}


export default withRouter(Dashboard);