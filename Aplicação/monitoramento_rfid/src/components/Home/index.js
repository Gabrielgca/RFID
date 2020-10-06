import React, { Component } from 'react';
import Loader from 'react-loader-spinner';
import io from 'socket.io-client';
import ENDPOINT from '../../socketAPIService';
import './home.css';

class Home extends Component {
  state = {
    updateCounter: 30,
    rooms: [] //Rooms será retorno da função getRooms do servidor
  };

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

  componentDidMount() {
    this.getRooms();
  }

  render() {
    const { rooms } = this.state;
    return (
      <section id="rooms">
        <div style={{ display: "flex", flexDirection: "row" }}>
          <h1 style={{ width: "100%" }}>Salas</h1>
        </div>
        {rooms.length > 0 ? (
          rooms.map((room) => {
            return (
              <article key={room.idSala}>
                <strong>Nome: {room.companyName} - {room.nomeSala}</strong>
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
