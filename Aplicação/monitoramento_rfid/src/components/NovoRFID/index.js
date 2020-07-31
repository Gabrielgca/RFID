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
    var resultado;
    fileUpload(e).then(result => {
      //this.fileResult = result;
      alert(JSON.stringify(result));
    });
    alert(JSON.stringify(resultado));
    if (e.target.files[0]) {
      const image = e.target.files[0];
      if (image.type === "image/png" || image.type === "image/jpeg") {
        await axios.post("http://192.168.2.196:5000/testeimagem", { img: "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" })
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
            onChange={this.testeEnvioImagem} /><br />
          <progress value={this.state.progress} max="100" />

          <input type="text" placeholder="Nome Completo..." value={this.state.titulo} autoFocus
            onChange={(e) => this.setState({ name: e.target.value })} /><br />

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