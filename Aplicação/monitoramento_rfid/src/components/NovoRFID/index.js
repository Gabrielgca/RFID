import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import axios from 'axios';
import './index.css';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import baseURL from "../../service";
import io from 'socket.io-client';

const fileUpload = require('fuctbase64');

class NewRFID extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '', //Armazenará o nome do usuário logado, que virá do Firebase Auth
      RFIDCode: '', //Armazenará o código 
      imagem: null, //Armazenará a imagem que o usuário selecionou
      alert: '',
      progress: 0,
      open: false,
      cardStatus: false,
      cardCodeRFID: '',
      fileResult: '',
      loading: false,
      age: '',//Armazenará a idade do usuario
      office: ''//Armazenará o cargo
    };

    this.register = this.register.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }


  componentDidMount() {
    if (!firebase.getCurrent()) {
      this.props.history.replace('/');
      return null;
    }

    var ENDPOINT = 'http://192.168.2.196:7000';
    this.socket = io.connect(ENDPOINT, {
      reconnection: true
    })

    this.socket.on('register', response => {
      this.setState({ cardCodeRFID: response })
      this.setState({ cardStatus: true })
      console.log('Register: ' + response)
    })

  }

  /* getCardCodeStatus = async () => { TESTANDO COM SOCKET
    //Resposta 0 = cartão já cadastrado
    //Resposta 1 = cartão disponível para cadastro
    this.setState({ loading: true });

    await axios.get(baseURL + "statusIdcard")
      .then(response => {
        //alert("getCardStatus: " + JSON.stringify(response));
        if (response.data === 0) {
          //this.setState({ cardStatus: false });
          alert("Por favor, passe um cartão e tente novamente!");
          this.setState({ loading: false });
        }
        else {
          this.setState({ loading: false });
          this.setState({ cardStatus: response.data.statusCartao }); // true =  cartão disponível para cadastro/ false = indisposnível
          this.setState({ cardCodeRFID: response.data.codigoRFIDCartao }); //código do cartão RFID lido
        }
      })
      .catch(error => {
        this.setState({ loading: false });
        alert("Error: " + JSON.stringify(error));
      })
  } */

  handleLoadingOn = async () => {
    this.setState({ loading: true });
  }

  handleLoadingOff = async () => {
    this.setState({ loading: false });
  }

  handleClickOpen = () => {
    //setOpen(true);
    this.setState({ open: true });
  };

  handleClose = () => {
    //setOpen(false);
    this.setState({ open: false });
  };

  register = async (e) => {
    e.preventDefault();

    if (this.state.name !== '' &&
      this.state.cardCodeRFID !== '' &&
      this.state.fileResult !== '' &&
      this.state.age !== '' &&
      this.state.office !== '') {

      const params = {
        codigoRFIDCartao: this.state.cardCodeRFID,
        nomeUsuario: this.state.name,
        idadeUsuario: this.state.age,
        cargoUsuario: this.state.office,
        imgPerfil: this.state.fileResult
      }

      //Se todos os dados necessários existirem, envia os dados para o servidor salvar no banco
      await axios.post(baseURL + "register", params)
        .then(response => {
          //alert("Sucesso! " + JSON.stringify(response));
          alert("Usuário cadastrado com sucesso!");
        })
        .catch(error => {
          alert("Erro: " + JSON.stringify(error));
        })
      //Após enviar os dados pro banco, reencaminhar para a Dashboard
      this.props.history.push('/dashboard');

    } else {
      //Caso algum campo não tenha sido preenchido, mostra mensagem de erro
      this.setState({ alert: 'Preencha todos os campos!' });
    }

  }

  handleFile = async (e) => {

    fileUpload(e).then(result => {
      //this.fileResult = result;
      this.setState({ fileResult: result.base64 });
      //alert("Result: " + JSON.stringify(result));
    });
  }

  render() {
    return (
      <div className="new-rfid-body">
        <header id="new">
          <Link to="/dashboard">Voltar</Link>
        </header>
        <form onSubmit={this.register} id="new-post">
          <h1>Cadastrar Novo Usuário</h1>
          <div className="check-area">
            <div className="empty-check">
              {this.state.fileResult !== '' ?
                <div className="div-img-perfil">
                  <img className="img-to-send" src={"data:image/png;base64, " + this.state.fileResult} />
                </div>
                :
                <div></div>
              }

              {this.state.cardStatus === true ? (
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                  <circle class="path circle" fill="none" stroke="#318a04" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1" />
                  <polyline class="path check" fill="none" stroke="#318a04" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 " />
                </svg>
              ) : (
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                    <circle class="path circle" fill="none" stroke="#FFA200" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1" />
                    <line class="path line" fill="none" stroke="#FFA200" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3" />
                    <line class="path line" fill="none" stroke="#FFA200" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2" />
                  </svg>
                )}
            </div>
            {/* <h4>Status: {this.state.cardStatus === true ? "Cartão disponível" : "Cartão já utilizado!"}</h4> */}
          </div>


          <div class='input-wrapper'>
            <label for='input-file'>
              Selecionar um arquivo
              </label>
            <input type="file" id="input-file" placeholder="Imagem de Perfil"
              onChange={this.handleFile} required />
            <span id='file-name'></span>
          </div>


          {/* <progress value={this.state.progress} max="100" /> */}

          <input type="text" placeholder="Nome Completo..." value={this.state.name} autoFocus
            onChange={(e) => this.setState({ name: e.target.value })} required /><br />

          <input type="text" placeholder="Idade" value={this.state.age} autoFocus
            onChange={(e) => this.setState({ age: e.target.value })} required /><br />


          <input type="text" placeholder="Cargo" value={this.state.office} autoFocus
            onChange={(e) => this.setState({ office: e.target.value })} required /><br />


          <input type="text" placeholder="Código do Cartão RFID" value={this.state.cardCodeRFID} disabled={true} />

          <button type="submit" disabled={this.state.cardStatus === true ? false : true}>Cadastrar</button>
        </form>

        <div>
          <Dialog
            open={this.state.open}
            onClose={() => { this.handleClose() }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Esta foi a imagem que você selecionou"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.state.fileResult !== '' ?
                  <img src={"data:image/png;base64, " + this.state.fileResult} />
                  :
                  <progress value={this.state.progress} max="100" />
                }
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { this.handleClose() }} color="primary" autoFocus>
                Ok
              </Button>
            </DialogActions>
          </Dialog>
        </div>

        <div>
          <Dialog
            PaperComponent={() => (
              <Loader
                type="Oval"
                //color="#ffa200"
                color="#FFF"
                height={100}
                width={100}
              //timeout={3000} //3 secs

              />
            )}
            disableBackdropClick={true}
            disableEscapeKeyDown={true}
            open={this.state.loading}
            onClose={() => { this.handleLoadingOff() }}
          >
          </Dialog>
        </div>
      </div>

    );
  }
}

export default withRouter(NewRFID);