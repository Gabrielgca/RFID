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

import * as dataRoomDetails from '../../JSONs/salaDetalhes.json';

import axios from 'axios';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';


const actions = [
  { icon: <AddIcon />, name: 'Novo RFID', action: 1 },
  { icon: <ExitToApp />, name: 'Sair', action: 2 }
];

const baseURL = 'http://172.20.10.2:5000/';

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false, //Controla o estado do modal de detalhes do usuário
      open: false, //Controla o estado do botão flutuante que funciona como menu
      nome: localStorage.nome, //Armazenará o nome do Usuário logado
      rooms: [], //Armazenará as salas cadastradas no sistema
      selectedPerson: {
        name: "Silvio",
        sector: "IBTI",
        email: "silvio_junior96@hotmail.com"
      },
      selectedRoom: {
        roomId: 0,
        roomName: '',
        roomImgMap: '',
        roomOccupants: [],
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

    this.getRooms();
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
      roomId: roomId //Aqui vai o ID da sala que desejamos obter os detalhes
    }
    alert("Room Id: " + roomId);

    /*await axios.post('http://192.168.2.196:5000/roomDetails', params)
      .then(response => {
        alert("Sucesso na requisição");
        this.setState({ selectedRoom: response.selectedRoom[0] });
      })
      .catch(error => {
        alert("Erro: " + JSON.stringify(error));
      });*/

    //A linha abaixo o simula o retorno dos dados que virão do servidor, utilizando os dados do JSON local
    this.setState({ selectedRoom: dataRoomDetails.selectedRoom[0] });
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
            {rooms.map((room) => {
              return (
                <article key={room.idSala}>
                  <strong>Nome: {room.nomeSala}</strong>
                  <p>Pessoas no Setor: {room.qtdOcupantes}</p>
                  <button type="button" className="button-room-details" onClick={() => { this.getRoomDetails(room.idSala) }}><FaCaretRight style={{ fontSize: 20 }} /></button>
                </article>
              );
            })}
          </div>

          <div className="room-details">
            <div className="occupants">
              {selectedRoom.roomOccupants.map((person) => {
                return (
                  <div className="person-avatar" onClick={() => { this.modalOpen() }}>
                    <img className="person-avatar" src={"https://cdn.icon-icons.com/icons2/1879/PNG/512/iconfinder-3-avatar-2754579_120516.png"}></img>
                  </div>
                );
              })}
            </div>
            <div className="room-map">
              {selectedRoom.roomImgMap !== '' ? (
                <img src={selectedRoom.roomImgMap}></img>
              ) : (
                  <div>Nenhuma sala selecionada...</div>
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
                <img className="person-avatar" src="https://cdn.icon-icons.com/icons2/1879/PNG/512/iconfinder-3-avatar-2754579_120516.png"></img>
                <p><b>Nome: </b>{this.state.selectedPerson.name}</p>
                <p><b>Email: </b>{this.state.selectedPerson.email}</p>
                <p><b>Setor: </b>{this.state.selectedPerson.sector}</p>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.modalClose} color="primary" autoFocus>
                Ok
          </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    );
  }
}

export default withRouter(Dashboard);