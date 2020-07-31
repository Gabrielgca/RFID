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
import { IconButton } from '@material-ui/core';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';

const fileUpload = require('fuctbase64');

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

    this.cadastrar = this.cadastrar.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.testeEnvioImagem = this.testeEnvioImagem.bind(this);
  }

  componentDidMount() {
    if (!firebase.getCurrent()) {
      this.props.history.replace('/');
      return null;
    }
  }

  handleClickOpen = () => {
    //setOpen(true);
    this.setState({ open: true });
  };

  handleClose = () => {
    //setOpen(false);
    this.setState({ open: false });
  };

  cadastrar = async (e) => {
    e.preventDefault();

    if (this.state.name !== '' &&
      this.state.RFIDCode !== '') {

      //Se todos os dados necessários existirem, envia os dados para o servidor salvar no banco

      //Após enviar os dados pro banco, reencaminhar para a Dashboard
      this.props.history.push('/dashboard');
    } else {
      //Caso algum campo não tenha sido preenchido, mostra mensagem de erro
      this.setState({ alert: 'Preencha todos os campos!' });
    }

  }

  testeEnvioImagem = async (e) => {
    fileUpload(e).then(result => {
      this.setState ({fileResult: result});
      alert(JSON.stringify(result));
    });
    
    if (e.target.files[0]) {
      const image = e.target.files[0];
      if (image.type === "image/png" || image.type === "image/jpeg") {
        await axios.post("http://192.168.2.196:5000/testeimagem", { img: this.fileResult })
          .then((response) => {
            alert(JSON.stringify(response));
          })
          .catch((error) => {
            alert("Erro: " + JSON.stringify(error));
          })
      }
    }
  }

  handleFile = async (e) => {

    if (e.target.files[0]) {

      const image = e.target.files[0];
      this.setState({ progress: 0 });
      this.setState({ url: '' });

      if ((image.type === 'image/png' || image.type === 'image/jpeg') && image.size <= 1048576) {
        await this.setState({ imagem: image });
        await this.handleUpload();
      } else {
        alert('Envie uma imagem do tipo PNG ou JPG com tamanho máximo de 1MB');
        this.setState({ imagem: null });
        return null;
      }

    }
  }

  handleUpload = async () => {
    const { imagem } = this.state;
    const currentUid = firebase.getCurrentUid();

    const uploadTaks = firebase.storage
      .ref(`images/${currentUid}/${imagem.name}`)
      .put(imagem);

    await uploadTaks.on('state_changed',
      (snapshot) => {
        //progress
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        this.setState({ progress });
      },
      (error) => {
        //error
        console.log('Error imagem: ' + error);
      },
      () => {
        //sucessO!
        firebase.storage.ref(`images/${currentUid}`)
          .child(imagem.name).getDownloadURL()
          .then(url => {
            this.setState({ url: url });
            this.handleClickOpen();
          })
      })
  }

  render() {
    return (
      <div className="new-rfid-body">
        <header id="new">
          <Link to="/dashboard">Voltar</Link>
        </header>
        <form onSubmit={this.cadastrar} id="new-post">
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
                <div className="empty-check"></div>
              )}
            {/* <h4>Status: {this.state.cardStatus === true ? "Cartão disponível" : "Cartão já utilizado!"}</h4> */}
          </div>

          <input type="file" placeholder="Imagem de Perfil"
            onChange={this.testeEnvioImagem} required/><br />
          <progress value={this.state.progress} max="100" />

          <input type="text" placeholder="Nome Completo..." value={this.state.titulo} autoFocus
            onChange={(e) => this.setState({ name: e.target.value })} required/><br />

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
                {this.state.url !== '' ?
                  <img className="img" src={this.state.url} width="250" height="150" alt="Capa do post" />
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