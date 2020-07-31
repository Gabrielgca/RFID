import React, { Component } from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';
import firebase from '../../firebase';
import { FaCaretRight, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import './dashboard.css';
import Header from '../Header';

import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import AddIcon from '@material-ui/icons/Add';
import ExitToApp from '@material-ui/icons/ExitToApp';

const actions = [
  { icon: <AddIcon />, name: 'Novo RFID', action: 1 },
  { icon: <ExitToApp />, name: 'Sair', action: 2 }
];

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hidden: false,
      open: false,
      nome: localStorage.nome,
      rooms: [ //Armazenará as salas cadastradas no sistema
        { id: 1, name: "Sala IBTI", occupation: 0 },
        { id: 2, name: "Sala 2", occupation: 2 },
        { id: 3, name: "Sala 3", occupation: 4 },
        { id: 4, name: "Sala 4", occupation: 6 },
        { id: 5, name: "Sala 5", occupation: 8 },
        { id: 6, name: "Sala 6", occupation: 2 },
        { id: 7, name: "Sala 7", occupation: 4 },
        { id: 8, name: "Sala 8", occupation: 6 },
        { id: 9, name: "Sala 9", occupation: 8 }
      ],
      personsInSelectedRoom: [ //Armazenará as pessoas que estão na sala selecionada
        { name: "Silvio", sector: "IBTI", email: "silvio_junior96@hotmail.com" },
        { name: "Júnior", sector: "IBTI", email: "junior96@hotmail.com" }
      ]
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
    })
  }

  logout = async () => {
    await firebase.logout()
      .catch((error) => {
        console.log(error);
      });
    localStorage.removeItem("nome");
    this.props.history.push('/');

  }

  viewSectorDetails = () => {
    alert("View Sector Details");
  }


  handleVisibility = () => {
    this.setState({ hidden: false });
    //setHidden((prevHidden) => !prevHidden);
  };

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
    const { rooms, personsInSelectedRoom } = this.state;
    return (
      <div id="dashboard">
        <div className="user-info">
          <h1 style={{ color: "#FFF", marginRight: 20 }}>Olá, {this.state.nome}</h1>
          { /* <Link to="/dashboard/new"><FaPlus style={{ marginRight: 10 }} /> RFID</Link> */}
          {/* <button style={{ backgroundColor: "red" }} className="sign-out-button" onClick={() => this.logout()}><FaSignOutAlt style={{ marginRight: 10 }} /> Sair</button> */}

          <SpeedDial
            ariaLabel="SpeedDial tooltip example"
            hidden={this.state.hidden}
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
                <article key={room.id}>
                  <strong>Nome: {room.name}</strong>
                  <p>Pessoas no Setor: {room.occupation}</p>
                  <button type="button" className="button-room-details" onClick={() => { this.viewSectorDetails() }}><FaCaretRight style={{ fontSize: 20 }} /></button>
                </article>
              );
            })}
          </div>

          <div className="room-details">
            <div className="occupants">
              {personsInSelectedRoom.map((person) => {
                return (
                  <div className="person-avatar">
                    <img className="person-avatar" src={"https://cdn.icon-icons.com/icons2/1879/PNG/512/iconfinder-3-avatar-2754579_120516.png"}></img>
                  </div>
                );
              })}
            </div>
            <div className="room-map">
              <p>Nenhuma sala selecionada...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Dashboard);