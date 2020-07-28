import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import './index.css';

class NewRFID extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      RFIDCode: '',
      imagem: null,
      alert: '',
      progress: 0,
      check: []
    };

    this.cadastrar = this.cadastrar.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  componentDidMount() {
    if (!firebase.getCurrent()) {
      this.props.history.replace('/');
      return null;
    }
  }

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

  handleFile = async (e) => {

    if (e.target.files[0]) {

      const image = e.target.files[0];

      if (image.type === 'image/png' || image.type === 'image/jpeg') {
        await this.setState({ imagem: image });
        await this.handleUpload();
      } else {
        alert('Envie uma imagem do tipo PNG ou JPG');
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
          </div>
          <h4>Status: Cartão disponível</h4>

          <input type="text" placeholder="Nome Completo..." value={this.state.titulo} autoFocus
            onChange={(e) => this.setState({ name: e.target.value })} /><br />

          <input type="text" placeholder="Código do Cartão RFID" value={this.state.descricao}
            onChange={(e) => this.setState({ RFIDCode: e.target.value })}></input>

          <button type="submit">Cadastrar</button>
        </form>
      </div>
    );
  }
}

export default withRouter(NewRFID);