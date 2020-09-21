import app from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/storage';
import Offices from './components/Offices';

// Your web app's Firebase configuration
let firebaseConfig = {
  apiKey: "AIzaSyCAdUjOBR1ifpGkDh6icf2WXVW8tYFexr4",
  authDomain: "monitoramentorfid.firebaseapp.com",
  databaseURL: "https://monitoramentorfid.firebaseio.com",
  projectId: "monitoramentorfid",
  storageBucket: "monitoramentorfid.appspot.com",
  messagingSenderId: "1087745896959",
  appId: "1:1087745896959:web:65a1a7cd0188a7d880f7ca",
  measurementId: "G-363DQ4XQT5"
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);

    //Referenciando a database para acessar em outros locais
    this.app = app.database();

    this.storage = app.storage();
  }

  login(email, password) {
    return app.auth().signInWithEmailAndPassword(email, password)
  }

  logout() {
    return app.auth().signOut();
  }

  async register(nome, email, cargo, password) {
    await app.auth().createUserWithEmailAndPassword(email, password)

    const uid = app.auth().currentUser.uid;

    return app.database().ref('usuarios').child(uid).set({
      nome: nome,
      email: email,
      cargo: cargo
      //cargo: cargo
      //tipoUsuario: 'Administrador' // Exemplo
    });

  }

  isInitialized() {
    return new Promise(resolve => {
      app.auth().onAuthStateChanged(resolve);
    })
  }

  getCurrent() {
    return app.auth().currentUser && app.auth().currentUser.email
  }

  getCurrentUid() {
    return app.auth().currentUser && app.auth().currentUser.uid
  }

  async getUserName(callback) {
    if (!app.auth().currentUser) {
      return null;
    }

    const uid = app.auth().currentUser.uid;
    await app.database().ref('usuarios').child(uid)
      .once('value').then(callback);

  }

  async getUserPerfil(callback) {
    if (!app.auth().currentUser) {
      return null;
    }
    else {
      const uid = app.auth().currentUser.uid;
      var officeKey;
      await app.database().ref('usuarios').child(uid).once('value', (snapshot) => {
        //console.log(snapshot.val().cargo);
        officeKey = snapshot.val().cargo;
      });
    }

    await app.database().ref('cargos').child(officeKey).child('nomeCargo').once('value').then(callback);
  }

  async getAllUsers(callback) {
    if (!app.auth().currentUser) {
      return null;
    }
    else {
      //await app.database().ref('usuarios').once('value').then(callback);
      await app.database().ref('usuarios').once('value').then(callback);
    }
  }

  async getAllOffices(callback) {
    if (!app.auth().currentUser) {
      return null;
    }
    else {
      await app.database().ref('cargos').once('value').then(callback);
    }
  }

  async updateUser(userKey, userName, userOffice, userStatus) {
    app.database().ref('usuarios').child(userKey).set({
      nome: userName,
      cargo: userOffice,
      status: userStatus
      //tipoUsuario: 'Administrador' // Exemplo
    });
  }

  async deactivateUser(userKey) {
    //app.database().ref('usuarios').child(userKey).remove(); // Esta linha exclui definitivamente os dados do BD daquele usuário
    app.database().ref('usuarios').child(userKey).update({ status: "Inativo" });
  }

  async reactivateUser(userKey) {
    app.database().ref('usuarios').child(userKey).update({ status: "Ativo" });
  }


  /* async addOffice(permissions, officeName) {
    let newOfficeKey = app.database().ref('cargos').push().key;
    return app.database().ref('cargos').child(newOfficeKey).set({
      nomeCargo: officeName,
      status: 'Ativo',
      permissoes: permissions
    });
  } */

  async addOffice(permissions, officeName) {
    let newOfficeKey = app.database().ref('cargos').push().key;
    return app.database().ref('cargos').child(newOfficeKey).set({
      nomeCargo: officeName,
      status: 'Ativo',
      permissoes: permissions
    });
  }

  async addPermission(permissionName) {
    let newPermissionKey = app.database().ref('permissions').child('dispositivo').push().key;
    return app.database().ref('permissions').child('dispositivo').child(newPermissionKey).set({
      nomePermissao: permissionName
    });
  }

  async getPermissions(callback) {
    await app.database().ref('permissions').once('value').then(callback);
  }

  async getCategoryPermissions(category, callback) {
    await app.database().ref("permissions").child(category).once('value').then(callback);
  }

  async updateOffice(officeKey, officeName, permissions, officeStatus) {
    app.database().ref('cargos').child(officeKey).set({
      nomeCargo: officeName,
      permissoes: permissions,
      status: officeStatus
      //tipoUsuario: 'Administrador' // Exemplo
    });
  }

  async getOfficePermissions(callback) {
    var officeKey;
    this.getUserName(async (info) => {
      //console.log(info.val().cargo);
      officeKey = info.val().cargo;
      await app.database().ref('cargos').child(officeKey).child('permissoes').once('value').then(callback);
    });
    //await app.database().ref('cargos').child(officeKey).child('permissoes').once('value').then(callback);
  }

  async disableOffice(officeName, officeKey) {
    var find = 0;
    await app.database().ref('usuarios').once('value', async (snapshot) => {
      //console.log(JSON.stringify(snapshot));
      snapshot.forEach((childItem) => {
        if (childItem.val().cargo === officeName) {
          find = 1;
        }
      })
    });

    if (find === 1) {
      return "Erro! Você não pode desabilitar um cargo enquanto houver usuários atrelados a ele!";
    }
    else {
      await app.database().ref('cargos').child(officeKey).update({
        status: 'Inativo'
      });
      return "Usuário desabilitado com sucesso!";
    }
  }

  async enableOffice(officeKey) {
    await app.database().ref('cargos').child(officeKey).update({
      status: 'Ativo'
    });
  }

}

export default new Firebase();