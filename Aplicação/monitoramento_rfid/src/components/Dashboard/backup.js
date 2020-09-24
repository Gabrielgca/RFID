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


/*const actions = [
  { icon: <AddIcon />, name: 'Novo RFID', action: 1 },
  { icon: <ExitToApp />, name: 'Sair', action: 2 }
];*/


//const baseURL = 'http://192.168.2.196:5000/'; //Rede do IBTI

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
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
        idSala: 0,
        nomeSala: '',
        imgMapaSala: '',
        ocupantes: [],
      },
      actions: [
        { icon: <AccountCircleIcon />, name: 'Gerenciar Usuários', action: 1 },
        { icon: <HowToRegIcon />, name: 'Gerenciar Permissões', action: 3 },
        { icon: <TapAndPlayIcon />, name: 'Gerenciar Usuários RFID', action: 4 },
        { icon: <ApartmentIcon />, name: "Gerenciar Setores", action: 5 },
        { icon: <QueuePlayNextIcon />, name: 'Gerenciar Dispositivos', action: 6 },
        { icon: <ExitToApp />, name: 'Sair', action: 2 }
      ]
    };

    this.logout = this.logout.bind(this);
    this.checkCategory = this.checkCategory.bind(this);
    this.getAllPermissions = this.getAllPermissions.bind(this);
  }

  async getAllPermissions() {
    /* await firebase.getCategoryPermissions("cargo", (allPermissions) => {
      this.ordenatePermissions(allPermissions);
    });

    await firebase.getCategoryPermissions("conta", (allPermissions) => {
      this.ordenatePermissions(allPermissions)
    });

    await firebase.getCategoryPermissions("setor", (allPermissions) => {
      this.ordenatePermissions(allPermissions)
    });

    await firebase.getCategoryPermissions("dispositivo", (allPermissions) => {
      this.ordenatePermissions(allPermissions)
    });

    await firebase.getCategoryPermissions("usuario", (allPermissions) => {
      this.ordenatePermissions(allPermissions)
    });

    await firebase.getCategoryPermissions("dashboard", (allPermissions) => {
      this.ordenatePermissions(allPermissions)
    }); */

    /* await firebase.getOfficePermissions((officePermissions) => {
      officePermissions.forEach((category) => {
        //console.log(JSON.stringify(category.key));
        category.forEach((permission) => {
          //console.log(JSON.stringify(permission))
        })
        //this.ordenatePermissions(category);
      })
    }); */


    await firebase.getOfficePermissions("cargo", async (categoryPermissions) => {
      //console.log(categoryPermissions);
      var permissions = [];
      categoryPermissions.forEach((permission) => {
        let list = {
          key: permission.key,
          nomePermissao: permission.val().nomePermissao,
          status: permission.val().status
        }
        permissions.push(list);

        if (permission.val().status === true) {
          console.log(true);
        } else {
          console.log(false);
        }
      })
      console.log(permissions);
      await this.setState({ officePermissions: permissions });
    });
  }

  ordenatePermissions(category) {
    /* console.log(category.key)
    category.forEach((permission) => {
      console.log(permission.val().nomePermissao);
    })
    console.log("\n"); */

    /* console.log("Nome da categoria: " + category.key) */

    let perm;
    if (category.key === "cargo") {
      perm = this.state.permissions.cargo;
    }
    else {
      if (category.key === "conta") {
        perm = this.state.permissions.conta;
      }
      else {
        if (category.key === "dispositivo") {
          perm = this.state.permissions.dispositivo;
        }
        else {
          if (category.key === "setor") {
            perm = this.state.permissions.setor;
          }
          else {
            if (category.key === "usuario") {
              perm = this.state.permissions.usuario;
            }
            else {
              if (category.key === "dashboard") {
                perm = this.state.permissions.dashboard;
              }
            }
          }
        }
      }
    }

    var newPermissions = this.state.permissions;

    category.forEach((permission) => {
      /* console.log(JSON.stringify(permission)); */
      let list = {
        key: permission.val().key,
        nomePermissao: permission.val().nomePermissao,
        status: permission.val().status
      }
      //console.log(list)
      perm.push(list);
    });
    this.setState({ permissions: newPermissions });
  }

  checkCategory(category) { //Função que irá verificar se o usuário possui alguma permissão em uma categoria específica desejada
    
  }

  async componentDidMount() {
    if (!firebase.getCurrent()) {
      this.props.history.replace('/login');
      return null;
    }

    firebase.getUserName((info) => {
      localStorage.nome = info.val().nome;
      this.setState({ nome: localStorage.nome });
    });

    firebase.getUserPerfil((info) => {
      localStorage.cargo = info.val();
      this.setState({ cargo: localStorage.cargo });
      //console.log("Valor recebido: " + info.val());
    });

    await this.getAllPermissions();

    await this.checkCategory(this.state.officePermissions);

    if (this.state.cargo === 'Administrador') {
      let newActions = [
        { icon: <AccountCircleIcon />, name: 'Gerenciar Usuários', action: 1 },
        { icon: <HowToRegIcon />, name: 'Gerenciar Permissões', action: 3 },
        { icon: <TapAndPlayIcon />, name: 'Gerenciar Usuários RFID', action: 4 },
        { icon: <ApartmentIcon />, name: "Gerenciar Setores", action: 5 },
        { icon: <QueuePlayNextIcon />, name: 'Gerenciar Dispositivos', action: 6 },
        { icon: <ExitToApp />, name: 'Sair', action: 2 }
      ]
      this.setState({ actions: newActions });
    }
    else {
      if (this.state.cargo === "Auxiliar") {
        let newActions = [
          { icon: <ExitToApp />, name: 'Sair', action: 2 }
        ]
        this.setState({ actions: newActions });
      }
      else {
        if (this.state.cargo === "Operador") {
          let newActions = [
            { icon: <TapAndPlayIcon />, name: 'Gerenciar Usuários RFID', action: 4 },
            { icon: <ExitToApp />, name: 'Sair', action: 2 }
          ]
          this.setState({ actions: newActions });
        }
        else {
          if (this.state.cargo === "Operador Master") {
            let newActions = [
              { icon: <TapAndPlayIcon />, name: 'Gerenciar Usuários RFID', action: 4 },
              { icon: <ApartmentIcon />, name: "Gerenciar Setores", action: 5 },
              { icon: <QueuePlayNextIcon />, name: 'Gerenciar Dispositivos', action: 6 },
              { icon: <ExitToApp />, name: 'Sair', action: 2 }
            ]
            this.setState({ actions: newActions });
          }
          else {
            if (this.state.cargo === "Gestor") {
              let newActions = [
                { icon: <AccountCircleIcon />, name: 'Gerenciar Usuários', action: 1 },
                { icon: <TapAndPlayIcon />, name: 'Gerenciar Usuários RFID', action: 4 },
                { icon: <ApartmentIcon />, name: "Gerenciar Setores", action: 5 },
                { icon: <QueuePlayNextIcon />, name: 'Gerenciar Dispositivos', action: 6 },
              ]
              this.setState({ actions: newActions });
            }
          }
        }
      }
    }

    this.getRooms();
    this.setState({ updateCounter: 30 });

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
    this.props.history.push('/');

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
      this.setState({ rooms: response.salas });
    });
  }

  getRoomDetails = async (roomId) => {
    const params = {
      idSala: roomId //Aqui vai o ID da sala que desejamos obter os detalhes
    }
    //alert("Room Id: " + roomId);
    let newSelectedRoom = {
      idSala: -1,
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

  }

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
    if (this.state.cargo !== 'Auxiliar') {
      const { selectedRoom } = this.state;
      selectedRoom.ocupantes.map((ocupante) => {
        if (ocupante.idOcupante === personId) {
          let newSelectedPerson = {
            name: ocupante.nomeOcupante,
            imgPerfil: ocupante.imgPerfil
          }
          this.setState({ selectedPerson: newSelectedPerson });
          this.modalOpen();
        }
      });
    }
    else {
      alert("Você não tem permissão para ver os dados dos usuários!");
    }
  }

  render() {
    const { rooms, selectedRoom } = this.state;
    return (
      <div id="dashboard">
        <div className="user-info">
          <h1 style={{ color: "#FFF", marginRight: 20 }}>Olá, {this.state.nome}</h1>
          {/* <p>{JSON.stringify(this.state.permissions)}</p> */}
          { /* <Link to="/dashboard/new"><FaPlus style={{ marginRight: 10 }} /> RFID</Link> */}
          {/* <button style={{ backgroundColor: "red" }} className="sign-out-button" onClick={() => this.logout()}><FaSignOutAlt style={{ marginRight: 10 }} /> Sair</button> */}

          <SpeedDial
            ariaLabel="SpeedDial tooltip example"
            hidden={false}
            icon={<SpeedDialIcon />}
            onClose={() => { this.setState({ open: false }) }}
            onOpen={this.handleOpen}
            open={this.state.open}
            direction={"right"}
          >
            {this.state.actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={() => { this.handleClose(action.action) }}
                tooltipPlacement={"bottom"}
              />
            ))}
          </SpeedDial>
        </div>
        <p style={{ color: "#FFF" }}>Email: {firebase.getCurrent()}</p>
        <p style={{ color: "#FFF" }}>Cargo: {this.state.cargo}</p><br />
        <div className="rooms">
          <div className="rooms-list">
            <div style={{ display: "flex", flexDirection: "row" }}>
              <h2 className="sector-title">Setores</h2>
              <div style={{ width: "50%", display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                <AutorenewIcon fontSize="small" style={{ color: "#FFF", }}></AutorenewIcon>
                <p style={{ fontSize: 15, color: "#FFF", fontWeight: "bold" }}>{this.state.updateCounter.toString().padStart(2, '0')}s</p>
              </div>
            </div>
            {rooms.length > 0 ? (
              rooms.map((room) => {
                return (
                  <article key={room.idSala}>
                    <strong>Nome: {room.nomeSala}</strong>
                    <p>Pessoas no Setor: {room.qtdOcupantes}</p>
                    <button type="button" className="button-room-details" onClick={() => { this.getRoomDetails(room.idSala) }}><FaCaretRight style={{ fontSize: 20 }} /></button>
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
              {selectedRoom.idSala > 0 ? (
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

              {selectedRoom.idSala === -1 ? (
                <div className="people-loading-div">
                  <Loader
                    type="Oval"
                    //color="#ffa200"
                    color="#000"
                    height={50}
                    width={50}
                  //timeout={3000} //3 secs
                  />
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
                  <img className="person-avatar" src={"data:image/png;base64, " + this.state.selectedPerson.imgPerfil} />
                ) : (
                    <img className="person-avatar" src="https://cdn.icon-icons.com/icons2/1879/PNG/512/iconfinder-3-avatar-2754579_120516.png"></img>
                  )}
                <div className="person-details">
                  <p><b>Nome: </b>{this.state.selectedPerson.name}</p>
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