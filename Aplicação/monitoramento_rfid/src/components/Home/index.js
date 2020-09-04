import React, { Component } from 'react';
import './home.css';
import axios from 'axios';

import baseURL from "../../service";
import Loader from 'react-loader-spinner';
import AutorenewIcon from '@material-ui/icons/Autorenew';

class Home extends Component {

  state = {
    updateCounter: 30,
    rooms: [] //Rooms será retorno de /getRooms do servidor
  };

  getRooms = async () => {
    await axios.get(baseURL + "rooms")
      .then(response => {
        this.setState({ rooms: response.data.salas });
      })
      .catch(error => {
        alert("Erro: " + JSON.stringify(error));
      })
  }

  exemploDeWebSocket = async () => {
    var websocket = new WebSocket("ws://localhost:2007/simplestchatever/talk");

    websocket.onopen = function () {
      console.log("Conectado com sucesso ao endpoint '/talk'.");
    }

    /**
       * Função para ser executada quando o cliente receber uma mensagem
       * do servidor.
       * A função também exibe essa mensagem numa div.
       * @param {type} message
       * @returns {undefined}
       */
    websocket.onmessage = function (message) {
      var ms = document.getElementsByClassName("messages")[0];
      ms.innerHTML += "<p>" + message.data + "</p>";
    }
  }

  componentDidMount() {
    this.getRooms();
    this.setState({ updateCounter: 30 });

    setInterval(() => {
      let count = this.state.updateCounter;
      count--;
      this.setState({ updateCounter: count });
      if (this.state.updateCounter === -1) {
        this.getRooms();
        console.log("GetRooms!");
        this.setState({ updateCounter: 30 });
      }
    }, 1000); //60.000ms equivalem a 1 minuto*/

    //this.getRooms(); RODA UMA VEZ SÓ A REQUISIÇÃO
  }

  render() {
    const { rooms } = this.state;
    return (
      <section id="rooms">
        <div style={{ display: "flex", flexDirection: "row" }}>
          <h1 style={{ width: "50%" }}>Salas</h1>
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
                <p>Ocupantes: {room.qtdOcupantes}</p>
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
      </section>
    );
  }
}

export default Home;
