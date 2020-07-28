import React, { Component } from 'react';
import firebase from '../../firebase';
import './home.css';
import Header from '../Header';


class Home extends Component {

  state = {
    posts: [],
    //Rooms será retorno de /getRooms do servidor
    rooms: [
      { id: 1, name: "Sala IBTI", occupation: 0 },
      { id: 2, name: "Sala 2", occupation: 2 },
      { id: 3, name: "Sala 3", occupation: 4 },
      { id: 4, name: "Sala 4", occupation: 6 },
      { id: 5, name: "Sala 5", occupation: 8 },
    ]
  };

  componentDidMount() {
    firebase.app.ref('posts').once('value', (snapshot) => {
      let state = this.state;
      state.posts = [];

      snapshot.forEach((childItem) => {
        state.posts.push({
          key: childItem.key,
          titulo: childItem.val().titulo,
          image: childItem.val().image,
          descricao: childItem.val().descricao,
          autor: childItem.val().autor,
        })
      });
      state.posts.reverse();
      this.setState(state);

    })
  }

  render() {
    const { rooms } = this.state;
    return (
      <section id="rooms">
        <h1>Salas</h1>
        {this.state.rooms.map((room) => {
          return (
            <article key={room.id}>
              <strong>Nome: {room.name}</strong>
              <p>Ocupantes: {room.occupation}</p>
            </article>
          );
        })}
      </section>
    );
  }
}

export default Home;
