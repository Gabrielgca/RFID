import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import utils from '../../utils';
import axios from 'axios';
import './index.css';
import ENDPOINT from '../../socketAPIService';


import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CheckBox from '@material-ui/core/Checkbox';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import FormControlLabel from '@material-ui/core/FormControlLabel';



import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import baseURL from "../../service";
import io from 'socket.io-client';
import FlatList from 'flatlist-react';

const fileUpload = require('fuctbase64');

class NewRFID extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loggedName: localStorage.nome,
      cargo: localStorage.cargo,
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
      office: '',//Armazenará o cargo
      permissions: [],
      localization: '',
      roomName: '',
      localizations: [],
      hrini: '',
      hrfim: '',
      permanente: true,
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
      pageLoading: true,
      value: ''//mascara para hora, podendo ser usado para outras coisas
    };

    this.register = this.register.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
  }


  async componentDidMount() {
    this.setState({ isMounted: true });

    if (!firebase.getCurrent()) {
      this.props.history.replace('/');
      return null;
    }

    await firebase.getUserName((info) => {
      localStorage.nome = info.val().nome;
      this.setState({ loggedName: localStorage.nome });
    });

    await firebase.getUserPerfil((info) => {
      localStorage.cargo = info.val();
      this.setState({ cargo: localStorage.cargo });
      //console.log("Valor recebido: " + info.val());
    });

    let result = await utils.getOffice(localStorage.cargo);
    if (this.state.isMounted === true) {
      this.setState({ loggedOffice: result });
    }

    if (utils.checkSpecificPermission("Cadastrar", this.state.loggedOffice.permissoes.usuario) !== true) {
      /* alert("Você não possui permissão para acessar esta página!"); */
      console.log(utils.checkCategory(this.state.loggedOffice.permissoes.usuario))
      this.props.history.replace('/dashboard');
      return null;
    }
    else {
      this.setState({ pageLoading: false });
    }

    this.socket = io.connect(ENDPOINT, {
      reconnection: true
    })

    this.socket.on('register', response => {
      this.setState({ cardCodeRFID: response })
      this.setState({ cardStatus: true })
      console.log('Register: ' + response)
    })

    this.getLocalizations();

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

  handleSelectedLocalizationChange = (e) => { //Função que altera o setor da nova permissão a ser cadastrada
    this.setState({ localization: e.target.value });
    this.state.localizations.map((localization) => {
      if (localization.id_disp_loc === e.target.value) {
        this.setState({ roomName: localization.no_loc });
      }
    });
  };

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
      this.state.office !== '' &&
      this.state.permissions.length > 0) {

      const params = {
        codigoRFIDCartao: this.state.cardCodeRFID,
        nomeUsuario: this.state.name,
        idade: this.state.age,
        trab: this.state.office,
        imgPerfil: this.state.fileResult,
        permissoes: this.state.permissions
      }
      //alert(JSON.stringify(params));

      //Se todos os dados necessários existirem, envia os dados para o servidor salvar no banco
      await axios.post(baseURL + "register", params)
        .then(response => {
          //alert("Sucesso! " + JSON.stringify(response));
          alert("Usuário cadastrado com sucesso!");
          console.log(response)
        })
        .catch(error => {
          alert("Erro: " + JSON.stringify(error));
        })
      //Após enviar os dados pro banco, reencaminhar para a Dashboard
      this.props.history.push('/usersRFID');
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

  handleAddPermission = () => {
    if ((this.state.hrini !== '' && this.state.hrfim !== '' && this.state.localization !== '') || (this.state.hrini === '' && this.state.hrfim === '' && this.state.localization !== '')) {
      let newPermissions = this.state.permissions;
      newPermissions.push({
        id_disp_loc: this.state.localization,
        roomName: this.state.roomName,
        hrini: this.state.hrini === "" ? null : this.state.hrini,
        hrfim: this.state.hrfim === "" ? null : this.state.hrfim,
        permanente: this.state.permanente === true ? "S" : "N"
      });
      this.setState({ permissions: newPermissions });
    }
    else {
      alert('Os campos de hora e fim precisam ser preenchidos')
      return null;
    }
  }

  getLocalizations = async () => {
    axios.get(baseURL + "dispInfo")
      .then(response => {
        console.log("Responses");
        console.log(response.data.dispinfo);
        this.setState({ localizations: response.data.dispinfo });
        this.setState({ localization: response.data.dispinfo[0].id_disp_loc });
        this.setState({ roomName: response.data.dispinfo[0].no_loc });
      })
      .catch(error => {
        console.log(error);
      })
  }

  removeEntrada = (index) => {
    let deleteItem = this.state.permissions;
    deleteItem.splice(index, 1)
    this.setState({ permissions: deleteItem })
  }

  handleCheck = async (event) => {
    this.setState({
      permanente: event.target.checked
    })
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
        <div className="new-rfid-body">
          <header id="new">
            {/* <Link to="/offices">Voltar</Link> */}
            <Button startIcon={<ArrowBackIcon />} style={{ backgroundColor: '#FAFAFA', bordeRadius: '5px', color: '#272727', fontSize: '15px', textTransform: "capitalize" }} type="button" onClick={() => { this.props.history.goBack() }}>
              Voltar
                    </Button>
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
                    <circle className="path circle" fill="none" stroke="#318a04" strokeWidth="6" strokeMiterlimit="10" cx="65.1" cy="65.1" r="62.1" />
                    <polyline className="path check" fill="none" stroke="#318a04" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 " />
                  </svg>
                ) : (
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                      <circle className="path circle" fill="none" stroke="#FFA200" strokeWidth="6" strokeMiterlimit="10" cx="65.1" cy="65.1" r="62.1" />
                      <line className="path line" fill="none" stroke="#FFA200" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3" />
                      <line className="path line" fill="none" stroke="#FFA200" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2" />
                    </svg>
                  )}
              </div>
              {/* <h4>Status: {this.state.cardStatus === true ? "Cartão disponível" : "Cartão já utilizado!"}</h4> */}
            </div>


            <div className='input-wrapper'>
              <label for='input-file'>
                Selecionar um arquivo
              </label>
              <input type="file" id="input-file" placeholder="Imagem de Perfil"
                onChange={this.handleFile} />
              <span id='file-name'></span>
            </div>


            {/* <progress value={this.state.progress} max="100" /> */}
            <div className='inputs'>
              <TextField label='Nome Completo' variant='outlined' autoFocus style={{ background: '#FFF', borderRadius: 8, marginBottom: 10, width: '100%' }}
                value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} required
              />

              <TextField label='Codigo RFID' variant='outlined' style={{ background: '#FFF', borderRadius: 8, width: '20%' }}
                value={this.state.cardCodeRFID} disabled
              />

              <TextField type='number' label='Idade' variant='outlined' size='small' style={{ background: '#FFF', borderRadius: 8, width: '20%', marginLeft: '2%', height: 40 }}
                value={this.state.age} onChange={(e) => this.setState({ age: e.target.value })} required
              />

              <TextField label='Função' variant='outlined' style={{ background: '#FFF', borderRadius: 8, width: '56%', marginLeft: '2%', marginBottom: 10 }}
                value={this.state.office} onChange={(e) => this.setState({ office: e.target.value })} required
              />

              <FormControl style={{ background: '#FFF', borderRadius: 8, width: '20%' }}>
                <InputLabel id='labelTitle'>Permissão</InputLabel>
                <Select
                  variant='outlined'
                  labelId='labelTitle'
                  label='Permissão'
                  value={this.state.localization}
                  //onChange={(e) => this.setState({ localization: e.target.value })}
                  onChange={(e) => { this.handleSelectedLocalizationChange(e) }}
                >
                  {this.state.localizations.map((localization) => {
                    if (localization.status === "A") {
                      return (
                        <MenuItem key={localization.id_disp_loc} value={localization.id_disp_loc}>{localization.id_disp_loc} - {localization.no_loc}</MenuItem>
                      );
                    }
                  })}
                </Select>
              </FormControl>

              <TextField InputLabelProps={{ shrink: true }} type='time' label='Hora de inicio' variant='outlined' style={{ background: '#FFF', borderRadius: 8, width: '20%', marginLeft: '2%', marginBottom: 10 }}
                value={this.state.hrini} onChange={(e) => this.setState({ hrini: e.target.value })}
              />
              <TextField InputLabelProps={{ shrink: true }} type='time' label='Hora de fim' variant='outlined' style={{ background: '#FFF', borderRadius: 8, width: '20%', marginLeft: '2%', marginBottom: 10 }}
                value={this.state.hrfim} onChange={(e) => this.setState({ hrfim: e.target.value })}
              />
              <Button onClick={this.handleAddPermission} variant='contained' style={{ marginLeft: '2%', background: 'green', height: 54 }} ><AddIcon /></Button>
              <FormControlLabel control={<CheckBox checked={this.state.permanente} onChange={(e) => { this.handleCheck(e) }} />} label='Manter horário direto' />
              <div className='flatScroll'>
                <FlatList
                  renderWhenEmpty={() => <div></div>}
                  list={this.state.permissions}
                  renderItem={(item) => (
                    <div>
                      <div className='usersList'>
                        <p><b>Localização: </b> {item.roomName}</p>
                        <p><b>Hora de inicio: </b> {item.hrini}</p>
                        <p><b>Hora fim: </b> {item.hrfim}</p>
                        <p><b>Diario: </b>{item.permanente === "S" ? "Sim" : "Não"}</p>
                      </div>
                      <div>
                        <Button onClick={() => (this.removeEntrada(this.state.permissions.indexOf(item)))} variant='contained' style={{ background: 'red', marginLeft: '90%', marginTop: '-10%' }} ><RemoveIcon /></Button>
                      </div>
                    </div>
                  )}
                >
                </FlatList>
              </div>


              <Button
                onClick={this.register}
                style={{ background: 'green', width: ' 100%' }}>
                Cadastrar
            </Button>
              {/* <button type="submit" disabled={this.state.cardCodeRFID === '' ? true : false}>Cadastrar</button> */}
            </div>
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
}

export default withRouter(NewRFID);