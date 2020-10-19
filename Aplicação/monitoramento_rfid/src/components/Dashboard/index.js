import React, { Component } from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';
import firebase from '../../firebase';
import { FaCaretRight, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import './dashboard.css';

import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import AddIcon from '@material-ui/icons/Add';
import ExitToApp from '@material-ui/icons/ExitToApp';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import TapAndPlayIcon from '@material-ui/icons/TapAndPlay';
import ApartmentIcon from '@material-ui/icons/Apartment';
import QueuePlayNextIcon from '@material-ui/icons/QueuePlayNext';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import axios from 'axios';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import baseURL from "../../service";
import io from 'socket.io-client';
import ENDPOINT from '../../socketAPIService';

import utils from '../../utils';


/*const actions = [
  { icon: <AddIcon />, name: 'Novo RFID', action: 1 },
  { icon: <ExitToApp />, name: 'Sair', action: 2 }
];*/


//const baseURL = 'http://192.168.2.196:5000/'; //Rede do IBTI

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isMounted: false,
      officePermissions: [],
      updateCounter: 30,
      modalOpen: false, //Controla o estado do modal de detalhes do usuário
      open: false, //Controla o estado do botão flutuante que funciona como menu
      nome: localStorage.nome, //Armazenará o nome do Usuário logado
      cargo: localStorage.cargo,
      permissions: {
        cargo: [],
        conta: [],
        dashboard: [],
        dispositivo: [],
        setor: [],
        usuario: []
      },
      rooms: [], //Armazenará as salas cadastradas no sistema
      selectedPerson: {
        name: "",
        imgPerfil: ''
      },
      selectedRoom: {
        id_disp: -1,
        nomeSala: '',
        imgMapaSala: '',
        ocupantes: [],
      },
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
      actions: [
        /* { icon: <AccountCircleIcon />, name: 'Gerenciar Usuários', action: 1 },
        { icon: <HowToRegIcon />, name: 'Gerenciar Permissões', action: 3 },
        { icon: <TapAndPlayIcon />, name: 'Gerenciar Usuários RFID', action: 4 },
        { icon: <ApartmentIcon />, name: "Gerenciar Setores", action: 5 },
        { icon: <QueuePlayNextIcon />, name: 'Gerenciar Dispositivos', action: 6 }, */
        { icon: <ExitToApp />, name: 'Sair', action: 2 }
      ]
    };

    this.logout = this.logout.bind(this);
    /* this.checkCategory = this.checkCategory.bind(this); */
  }

  /*   async getOffice() {
      await firebase.getAllOffices((allOffices) => {
        allOffices.forEach((office) => {
          if (office.val().nomeCargo === this.state.cargo) {
            let list = {
              key: office.key,
              nomeCargo: office.val().nomeCargo,
              permissoes: office.val().permissoes,
              status: office.val().status
            }
            /* alert(JSON.stringify(list));
            if (this.state.isMounted === true) {
              this.setState({ loggedOffice: list });
            }
          }
        })
      });
    } */

  /*   checkCategory(categoryName) {
      let perm;
      if (categoryName === "cargo") {
        perm = this.state.loggedOffice.permissoes.cargo;
      }
      else {
        if (categoryName === "conta") {
          perm = this.state.loggedOffice.permissoes.conta;
        }
        else {
          if (categoryName === "dispositivo") {
            perm = this.state.loggedOffice.permissoes.dispositivo;
          }
          else {
            if (categoryName === "setor") {
              perm = this.state.loggedOffice.permissoes.setor;
            }
            else {
              if (categoryName === "usuario") {
                perm = this.state.loggedOffice.permissoes.usuario;
              }
              else {
                if (categoryName === "dashboard") {
                  perm = this.state.loggedOffice.permissoes.dashboard;
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
    } */

  componentWillUnmount() {
    this.setState({ isMounted: false });
  }

  async componentDidMount() {
    this.setState({ isMounted: true });
    if (localStorage.mustBeReloaded === "Sim") {
      localStorage.mustBeReloaded = "Não";
      window.location.reload();
    }

    if (!firebase.getCurrent()) {
      this.props.history.replace('/login');
      return null;
    }

    await firebase.getUserName((info) => {
      localStorage.nome = info.val().nome;
      this.setState({ nome: localStorage.nome });
    });

    await firebase.getUserPerfil((info) => {
      localStorage.cargo = info.val();
      this.setState({ cargo: localStorage.cargo });
      //console.log("Valor recebido: " + info.val());
    });

    //await this.getOffice();
    let result = await utils.getOffice(this.state.cargo);
    if (this.state.isMounted === true) {
      this.setState({ loggedOffice: result });
    }

    if (utils.checkCategory(this.state.loggedOffice.permissoes.usuario) === true) {
      let newActions = this.state.actions;
      newActions.unshift({ icon: <TapAndPlayIcon />, name: 'Gerenciar Usuários RFID', action: 4 })
      this.setState({ actions: newActions });
    }

    if (utils.checkCategory(this.state.loggedOffice.permissoes.setor) === true) {
      let newActions = this.state.actions;
      newActions.unshift({ icon: <ApartmentIcon />, name: "Gerenciar Setores", action: 5 })
      this.setState({ actions: newActions });
    }

    if (utils.checkCategory(this.state.loggedOffice.permissoes.dispositivo) === true) {
      let newActions = this.state.actions;
      newActions.unshift({ icon: <QueuePlayNextIcon />, name: 'Gerenciar Dispositivos', action: 6 })
      this.setState({ actions: newActions });
    }

    if (utils.checkCategory(this.state.loggedOffice.permissoes.conta) === true) {
      let newActions = this.state.actions;
      newActions.unshift({ icon: <AccountCircleIcon />, name: 'Gerenciar Contas', action: 1 })
      this.setState({ actions: newActions });
    }

    if (utils.checkCategory(this.state.loggedOffice.permissoes.cargo) === true) {
      let newActions = this.state.actions;
      newActions.unshift({ icon: <HowToRegIcon />, name: 'Gerenciar Cargos', action: 3 })
      this.setState({ actions: newActions });
    }

    this.getRooms();
    //this.setState({ updateCounter: 30 });

    /* setInterval(() => {
      let count = this.state.updateCounter;
      count--;
      this.setState({ updateCounter: count });
      if (this.state.updateCounter === -1) {
        this.getRooms();
        console.log("GetRooms!");
        this.setState({ updateCounter: 30 });
      }
    }, 1000); */ //60.000ms equivalem a 1 minuto*/

    //this.getRooms(); RODA UMA VEZ SÓ A REQUISIÇÃO
  }

  modalOpen = async () => {
    //setOpen(true);
    this.setState({ modalOpen: true });
  };

  modalClose = async () => {
    //setOpen(false);
    this.setState({ modalOpen: false });
  };

  logout = async () => {
    await firebase.logout()
      .catch((error) => {
        console.log(error);
      });
    localStorage.removeItem("nome");
    // this.props.history.push('/');

  }

  /* getRooms = async () => {
    await axios.get(baseURL + "rooms")
      .then(response => {
        this.setState({ rooms: response.data.salas });
      })
      .catch(error => {
        alert("Erro: " + JSON.stringify(error));
      })
  } */

  getRooms() {
    //var ENDPOINT = "http://192.168.2.196:7000"; //ENDPOINT
    var socket = io.connect(ENDPOINT, {
      reconnection: true,
      //timeout: 30000
      // transports: ['websocket']
    });

    // Inicia os eventos que ficarão em estado de observação, 
    // onde cada alteração, será enviada do servidor para a aplicação em tempo real
    socket.emit("rooms");
    socket.on("rooms_update", response => {
      console.log(response);
      this.setState({ rooms: response.salas });
    });
  }

  getRoomDetails = async (roomId) => {
    var socket = io.connect(ENDPOINT, {
      reconnection: true
    });

    const params = {
      id_disp: roomId //Aqui vai o ID da sala que desejamos obter os detalhes
    }

    socket.emit("roominfo", params);
    socket.on("news_from_roominfo", response => {
      console.log("News From Room Info: ");
      console.log(response);
      this.setState({ selectedRoom: {} });
      this.setState({ selectedRoom: response.salaSelecionada });
      this.setState({ rooms: response.salas });
    });
  }

  /* getRoomDetails = async (roomId) => {
    const params = {
      id_disp: roomId //Aqui vai o ID da sala que desejamos obter os detalhes
    }
    //alert("Room Id: " + roomId);
    let newSelectedRoom = {
      id_disp: -1,
      nomeSala: '',
      imgMapaSala: '',
      ocupantes: [],
    }
    this.setState({ selectedRoom: newSelectedRoom });

    await axios.post(baseURL + 'roominfo', params)
      .then(response => {
        //alert("Sucesso na requisição: \n" + JSON.stringify(response.data.salaSelecionada));
        this.setState({ selectedRoom: response.data.salaSelecionada });
      })
      .catch(error => {
        alert("Erro: " + JSON.stringify(error));
      }).finally(() => {
        this.getRooms();
      });

    //A linha abaixo o simula o retorno dos dados que virão do servidor, utilizando os dados do JSON local
    //this.setState({ selectedRoom: dataRoomDetails.selectedRoom[0] });

  } */

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = (action) => {
    if (action === 1) {
      this.setState({ open: false });
      this.props.history.push("/users");
      //alert("Função Novo RFID");
    }
    else {
      if (action === 2) {
        this.logout();
        //alert("Função Sair");
      }
      else {
        if (action === 3) {
          this.props.history.push("/offices");
        }
        else {
          if (action === 4) {
            this.props.history.push("/usersRFID");
          }
          else {
            if (action === 5) {
              this.props.history.push("/sectors");
            }
            else {
              if (action === 6) {
                this.props.history.push("/devices");
              }
            }
          }
        }
      }
    }
  };

  getSelectedPerson = async (personId) => {
    if (utils.checkSpecificPermission("dados", this.state.loggedOffice.permissoes.dashboard) === false) {
      alert("Você não possui permissão para visualizar os dados dos usuários!");
      return null;
    }
    const { selectedRoom } = this.state;
    selectedRoom.ocupantes.map((ocupante) => {
      if (ocupante.idOcupante === personId) {
        let newSelectedPerson = {
          ageOcupante: ocupante.ageOcupante,
          cargoOcupante: ocupante.cargoOcupante,
          idOcupante: ocupante.idOcupante,
          nomeOcupante: ocupante.nomeOcupante,
          imgPerfil: ocupante.imgPerfil
        }
        this.setState({ selectedPerson: newSelectedPerson });
        this.modalOpen();
      }
    });
  }

  render() {
    const { rooms, selectedRoom } = this.state;
    return (
      <div id="dashboard">
        <h1>Olá, {this.state.nome}</h1>
        {/* <div style={{border: "1px solid black", height: "50px"}}>

        </div> */}
        <br></br>
        <h3>Email: {firebase.getCurrent()}</h3>
        <h3>Cargo: {this.state.cargo}</h3><br />
        <div className="user-info">

        </div>
        <div className="rooms">
          <div className="rooms-list">
            <div style={{ display: "flex", flexDirection: "row" }}>
              <h2>Setores</h2>
            </div>
            {rooms.length > 0 ? (
              rooms.map((room) => {
                return (
                  <article key={room.id_disp}>
                    <strong>Sala: {room.companyName} - {room.nomeSala}</strong>
                    <p>Pessoas no Setor: {room.qtdOcupantes}</p>
                    <button type="button" className="button-room-details" onClick={() => { this.getRoomDetails(room.id_disp) }}><FaCaretRight style={{ fontSize: 20 }} /></button>
                  </article>
                );
              })
            ) : (
                <div className="div-loader">
                  <Loader
                    type="Oval"
                    //color="#ffa200"
                    color="#FFF"
                    height={100}
                    width={100}
                  //timeout={3000} //3 secs

                  />
                </div>
              )}
          </div>

          <div className="room-details">

            <div className="occupants">
              {selectedRoom.id_disp > 0 ? (
                selectedRoom.ocupantes.map((person) => {
                  if (person.imgPerfil != "") {
                    return (
                      <div className="person-avatar" onClick={() => { this.getSelectedPerson(person.idOcupante) }}>
                        {/* <img className="person-avatar" src={"data:image/png;base64, " + person.imgPerfil} /> */}
                        <img className="person-avatar" src={person.imgPerfil} />
                      </div>
                    )
                  }
                  else {
                    return (
                      <div className="person-avatar" onClick={() => { this.getSelectedPerson(person.idOcupante) }}>
                        <img className="person-avatar" src={"https://cdn.icon-icons.com/icons2/1879/PNG/512/iconfinder-3-avatar-2754579_120516.png"}></img>
                      </div>
                    )
                  }
                })
              ) : (
                  <div></div>
                )}

              {selectedRoom.id_disp === -1 ? (
                <div className="people-loading-div">
                  {/* <Loader
                    type="Oval"
                    //color="#ffa200"
                    color="#000"
                    height={50}
                    width={50}
                  //timeout={3000} //3 secs
                  /> */}
                </div>
              ) : (
                  <div></div>
                )}
            </div>

            <div className="room-map">
              {selectedRoom.imgMapaSala !== '' ? (
                <img className="img-mapa-sala" src={selectedRoom.imgMapaSala} />
              ) : (
                  <div className="sem-sala">Nenhuma sala selecionada...</div>
                )}
            </div>
          </div>
        </div>


        <div>
          <Dialog
            fullWidth={true}
            className="detailsModal"
            open={this.state.modalOpen}
            onClose={this.modalClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Detalhes do usuário"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.state.selectedPerson.imgPerfil !== '' ? (
                  <img className="person-avatar" src={this.state.selectedPerson.imgPerfil} style={{ marginRight: '60%', marginBottom: 30 }} />
                ) : (
                    <img className="person-avatar" src="https://cdn.icon-icons.com/icons2/1879/PNG/512/iconfinder-3-avatar-2754579_120516.png"></img>
                  )}
                <div className="person-details">
                  <p><b>ID: </b>{this.state.selectedPerson.idOcupante}</p>
                  <p><b>Nome: </b>{this.state.selectedPerson.nomeOcupante}</p>
                  <p><b>Idade: </b>{this.state.selectedPerson.ageOcupante}</p>
                  <p><b>Cargo: </b>{this.state.selectedPerson.cargoOcupante}</p>
                </div>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.modalClose} color="primary" autoFocus>
                Ok
          </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div >
    );
  }
}

export default withRouter(Dashboard);