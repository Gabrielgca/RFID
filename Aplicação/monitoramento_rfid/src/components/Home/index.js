import React, { Component } from 'react';
import firebase from '../../firebase';
import './home.css';
import Header from '../Header';
import axios from 'axios';

import baseURL from "../../service";


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

  componentDidMount() {
    this.getRooms();
  }

  render() {
    const { rooms } = this.state;
    return (
      <section id="rooms">
        <h1>Salas</h1>
        {rooms.map((room) => {
          return (
            <article key={room.idSala}>
              <strong>Nome: {room.nomeSala}</strong>
              <p>Ocupantes: {room.qtdOcupantes}</p>
            </article>
          );
        })}
      </section>
    );
  }
}

export default Home;
