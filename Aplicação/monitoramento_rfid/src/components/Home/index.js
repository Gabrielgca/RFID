import React, { Component } from 'react';
import firebase from '../../firebase';
import './home.css';
import Header from '../Header';
import axios from 'axios';

import baseURL from "../../service";
import Loader from 'react-loader-spinner';

class Home extends Component {

  state = {
    //Rooms será retorno de /getRooms do servidor
    rooms: []
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
    /*
    setInterval(() => {
      this.getRooms();
    }, 60000); //60.000ms equivalem a 1 minuto
    */
    this.getRooms();
  }

  render() {
    const { rooms } = this.state;
    return (
      <section id="rooms">
        <h1>Salas</h1>
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
