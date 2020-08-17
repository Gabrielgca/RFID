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


const actions = [
  { icon: <AddIcon />, name: 'Novo RFID', action: 1 },
  { icon: <ExitToApp />, name: 'Sair', action: 2 }
];


//const baseURL = 'http://192.168.2.196:5000/'; //Rede do IBTI

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false, //Controla o estado do modal de detalhes do usuário
      open: false, //Controla o estado do botão flutuante que funciona como menu
      nome: localStorage.nome, //Armazenará o nome do Usuário logado
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
      }
    };

    this.logout = this.logout.bind(this);
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

    setInterval(() => {
      this.getRooms();
    }, 30000); //60.000ms equivalem a 1 minuto

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

  getRooms = async () => {
    await axios.get(baseURL + "rooms")
      .then(response => {
        this.setState({ rooms: response.data.salas });
      })
      .catch(error => {
        alert("Erro: " + JSON.stringify(error));
      })
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
      this.props.history.push("/dashboard/new");
      //alert("Função Novo RFID");
    }
    else {
      if (action === 2) {
        this.logout();
        //alert("Função Sair");
      }
    }
  };

  getSelectedPerson = async (personId) => {
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
    })
  }

  render() {
    const { rooms, selectedRoom } = this.state;
    return (
      <div id="dashboard">
        <div className="user-info">
          <h1 style={{ color: "#FFF", marginRight: 20 }}>Olá, {this.state.nome}</h1>
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
            {actions.map((action) => (
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
        <p style={{ color: "#FFF" }}>Email: {firebase.getCurrent()}</p><br />
        <div className="rooms">
          <div className="rooms-list">
            <h2 className="sector-title">Setores</h2>
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
                        <img className="person-avatar" src={"data:image/png;base64, " + person.imgPerfil} />
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
                <img className="img-mapa-sala" src={"data:image/png;base64, " + selectedRoom.imgMapaSala} />
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