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

const fileUpload = require('fuctbase64');
const baseURL = 'http://192.168.2.196:5000/';

class NewRFID extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      RFIDCode: '',
      imagem: null,
      url: '',
      alert: '',
      progress: 0,
      open: false,
      cardStatus: false,
      cardCodeRFID: 8524253658,
      fileResult: ''
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

    this.getCardCodeStatus();
  }

  getCardCodeStatus = async () => {
    //Resposta 0 = cartão já cadastrado
    //Resposta 1 = cartão disponível para cadastro
    await axios.get(baseURL + "/statusIdcard")
      .then(response => {
        //alert(JSON.stringify(response));
        if (response.data === 0) {
          this.setState({ cardStatus: false });
        }
        else {
          if (response.data === 1) {
            this.setState({ cardStatus: true });
          }
        }
      })
      .catch(error => {
        alert("Error: " + JSON.stringify(error));
      })
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
      this.state.RFIDCode !== '' &&
      this.state.fileResult !== '') {

      const params = {
        codigoRFIDCartao: this.state.RFIDCode,
        nomeUsuario: this.state.name,
        imgPerfil: this.state.fileResult
      }

      //Se todos os dados necessários existirem, envia os dados para o servidor salvar no banco
      await axios.post("http://192.168.2.196:5000/register", params)
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

    if (e.target.files[0]) {

      const image = e.target.files[0];
      this.setState({ progress: 0 });
      this.setState({ url: '' });

      if ((image.type === 'image/png' || image.type === 'image/jpeg') && image.size <= 1048576) {
        await this.setState({ imagem: image });
        //await this.handleUpload();
        this.handleClickOpen();
      } else {
        alert('Envie uma imagem do tipo PNG ou JPG com tamanho máximo de 1MB');
        this.setState({ imagem: null });
        return null;
      }

    }
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
            {this.state.cardStatus === true ? (
              <div className="check">
                <div class="success-checkmark">
                  <div class="check-icon">
                    <span class="icon-line line-tip"></span>
                    <span class="icon-line line-long"></span>
                    <div class="icon-circle"></div>
                    <div class="icon-fix"></div>
                  </div>
                </div>
              </div>
            ) : (
                <div className="empty-check">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                    <circle class="path circle" fill="none" stroke="#D06079" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1" />
                    <line class="path line" fill="none" stroke="#D06079" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3" />
                    <line class="path line" fill="none" stroke="#D06079" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2" />
                  </svg>
                </div>
              )}
            {/* <h4>Status: {this.state.cardStatus === true ? "Cartão disponível" : "Cartão já utilizado!"}</h4> */}
          </div>

          <input type="file" placeholder="Imagem de Perfil"
            onChange={this.handleFile} required /><br />
          {/* <progress value={this.state.progress} max="100" /> */}

          <input type="text" placeholder="Nome Completo..." value={this.state.titulo} autoFocus
            onChange={(e) => this.setState({ name: e.target.value })} required /><br />

          <input type="text" placeholder="Código do Cartão RFID" value={this.state.descricao}
            onChange={(e) => this.setState({ RFIDCode: e.target.value })}></input>

          <button type="submit">Cadastrar</button>
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
      </div>

    );
  }
}

export default withRouter(NewRFID);