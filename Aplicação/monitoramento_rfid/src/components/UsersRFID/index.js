import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import FlatList from 'flatlist-react';
import Loader from 'react-loader-spinner';
import './adm.css';

//pesquisa
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';


//modal
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';



class UsersRFID extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filterUsers: [],
            filter: '',
            selectedUsers: { key: '', name: '', idade: '', cargo: '', status: '' },
            nome: localStorage.nome,
            modalDeactivateOpen: false,
            modalReactivateOpen: false,
            people: [{
                key: 1,
                name: "Arley Souto Aguiar",
                idade: 25,
                cargo: 'Analista',
                status: "Ativo",
                rfid: '1234'
            }, {
                key: 2,
                name: "Silvio Júnior",
                idade: 26,
                cargo: 'Administrador',
                status: "Inativo",
                rfid: '4321'
            }],

            selectedPerson: {
                name: "",
                idade: '',
                cargo: '',
                status: "",
                rfid: ''
            }
        };

        this.logout = this.logout.bind(this);
    }

    async componentDidMount() {
        if (!firebase.getCurrent()) {
            this.props.history.replace('/login');
            return null;
        }

    }

    modalOpen = async (user) => {
        this.setState({
            selectedPerson: {
                name: user.name,
                idade: user.idade,
                status: user.status,
                cargo: user.cargo,
                rfid: user.rfid
            }
        })
        this.setState({ modalOpen: true });
    };

    modalClose = async () => {
        this.setState({ modalOpen: false });
    }

    logout = async () => {
        await firebase.logout()
            .catch((error) => {
                console.log(error);
            });
        localStorage.removeItem("nome");
        this.props.history.push('/');

    }


    name = async (event) => {
        let newName = this.state.selectedPerson;
        newName.name = event.target.value;
        this.setState({ selectedPerson: newName })
    }

    valor = async (event) => {
        let newSelectedPerson = this.state.selectedPerson;
        newSelectedPerson.status = event.target.value;
        this.setState({ selectedPerson: newSelectedPerson })
    }

    cargo = async (event) => {
        let newJob = this.state.selectedPerson;
        newJob.cargo = event.target.value;
        this.setState({ selectedPerson: newJob })
    }

    rfid = async (event) => {
        this.setState({ status: event.target.rfid })
    }

    editUser = async () => {
        alert(JSON.stringify(this.state.selectedPerson))
    }

    searchUser = () => {
        this.state.filterUsers = [];
        this.state.people.forEach((user) => {

            if (user.name.toUpperCase().includes(this.state.filter.toUpperCase()) || user.name.toUpperCase() == this.state.filter.toUpperCase()) {

                let list = {
                    name: user.name,
                    status: user.status
                }

                let array = this.state.filterUsers;
                array.push(list)
                this.setState({ filterUsers: array })
            }
        })
    }

    getUsers = () => {
        this.setState({ users: [] });
        this.state.selectedPerson.map((allUsers) => {
            allUsers.forEach((oneUser) => {
                let list = {
                    key: oneUser.key,
                    name: oneUser.val().name,
                    status: oneUser.val().status,
                    rfid: oneUser.val().rfid
                }
                this.setState({ users: [...this.state.users, list] });
            })
        })
    }

    reativeUser = () => {
        alert('usuario reativado');
        this.handleCloseReactivateUser();
        this.getUsers();
    }

    handleCloseReactivateUser = () => {
        this.setState({ modalReactivateOpen: false });
        this.setState({ selectedUser: { key: '', name: '', status: '', rfid: '' } })
    }

    handleClearFilter = () => {
        this.setState({ filterUsers: [] });
        this.setState({ filter: '' });
    }

    handleDeactiveUser = (user) => {
        this.setState({ selectedUser: { key: user.key, name: user.name, status: user.status, rfid: user.rfid } })
        this.setState({ modalDeactivateOpen: true })
    }

    handleCloseDeactiveUser = () => {
        this.setState({ modalOpen: false });
        this.setState({ selectedUser: { key: '', name: '', status: '', rfid: '' } })
    }

    handleReative = (user) => {
        this.setState({ selectedUser: { key: user.key, name: user.name, status: user.status, rfid: user.rfid } })
        this.setState({ modalReactivateOpen: true })
    }

    deactiveUser = async (key) => {
        alert('usuario desativado')
        this.handleCloseDeactiveUser();
        this.getUsers();
    }

    handleCloseDeactivate = () => {
        this.setState({ modalDeactivateOpen: false });
        this.setState({ selectedUser: { key: '', name: '', status: '', rfid: '' } })
    }


    render() {
        const { people } = this.state;
        return (
            <div id="area">
                <h1>Usuários RFID</h1>
                <div className="pesquisa">
                    <Paper style={{ marginTop: 50 }}>
                        <InputBase
                            value={this.state.filter}
                            style={{ paddingLeft: 20, width: 500 }}
                            onChange={(e) => this.setState({ filter: e.target.value })}
                            placeholder="Faça uma pesquisa..."
                        />
                        <IconButton type="button" onClick={this.searchUser}>
                            <SearchIcon />
                        </IconButton>

                        <IconButton type="button" onClick={this.handleClearFilter}>
                            <ClearIcon />
                        </IconButton>

                        <IconButton type="button" onClick={() => { this.props.history.push("/register") }}>
                            <AddIcon style={{ color: 'green' }} />
                        </IconButton>
                    </Paper>
                </div>
                <FlatList
                    list={this.state.filterUsers.length > 0 ? this.state.filterUsers : this.state.people}
                    renderItem={(item) => (

                        <div className="room-list">
                            <div className={item.status === "Ativo" ? "card" : "card-disabled"}>
                                <article>
                                    <p><b>Nome:</b> {item.name}</p>
                                    <p><b>Idade:</b> {item.idade}</p>
                                    <p><b>Cargo:</b> {item.cargo}</p>
                                    <p><b>Status:</b> {item.status}</p>
                                    <p><b>RFID:</b> {item.rfid}</p>
                                    <div className="btnArea">
                                        <Button endIcon={<EditIcon />} onClick={() => { this.modalOpen(item) }} style={{ backgroundColor: 'green', color: '#FFF', marginRight: 10 }}>Editar</Button>
                                        {item.status == 'Ativo' ? (
                                            <Button endIcon={<EditIcon />} onClick={() => { this.handleDeactiveUser(item) }} style={{ backgroundColor: 'red', color: '#FFF' }}>Desativar</Button>
                                        ) : (
                                                <Button endIcon={<EditIcon />} onClick={() => { this.handleReative(item) }} style={{ backgroundColor: 'blue', color: '#FFF' }}>Reativar</Button>
                                            )
                                        }
                                    </div>
                                </article>
                            </div>
                        </div>

                    )}
                    renderWhenEmpty={() => (
                        <div className="div-loader">
                            <Loader
                                type="Oval"
                                //color="#ffa200"
                                color="#FFF"
                                height={100}
                                width={100}
                            //timeout={3000} //3 secs

                            />
                        </div>)}
                />
                {/* Modal */}
                <Dialog
                    fullWidth={true}
                    className="detailsModal"
                    open={this.state.modalOpen}
                    onClose={this.modalClose}
                    aria-labelledby="alert-dialog-title"
                    aria-aria-describedby="alert-dialog-description"

                >
                    <DialogTitle id="alert-dialog-title">{"Detalhes do usuário"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <TextField
                                autoFocus
                                margin='dense'
                                id='name'
                                label='Nome'
                                type='text'
                                value={this.state.selectedPerson.name}
                                onChange={this.name}
                                fullWidth

                            />
                            <FormControl disabled>
                                <InputLabel>Idade</InputLabel>
                                <Input value={this.state.selectedPerson.idade} />
                            </FormControl>
                            <InputLabel className="selectLabel">Cargo</InputLabel>
                            <Select
                                value={this.state.selectedPerson.cargo}
                                onChange={this.cargo}
                            >
                                <MenuItem value="Analista">Analista</MenuItem>
                                <MenuItem value="Administrador">Administrador</MenuItem>
                                <MenuItem value="Operador">Operador</MenuItem>
                            </Select>
                            <InputLabel className="selectLabel">Status</InputLabel>
                            <Select
                                value={this.state.selectedPerson.status}
                                onChange={this.valor}
                            >
                                <MenuItem value="Ativo">Ativo</MenuItem>
                                <MenuItem value="Inativo">Inativo</MenuItem>
                            </Select>

                            <FormControl disabled>
                                <InputLabel>RFID</InputLabel>
                                <Input value={this.state.selectedPerson.rfid} />
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.editUser} autoFocus style={{ backgroundColor: 'green', color: '#FFF' }}>Salvar</Button>
                        <Button onClick={this.modalClose} style={{ backgroundColor: 'red', color: '#FFF' }} autoFocus>
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>


                {/* Desativar usuário */}
                <Dialog open={this.state.modalDeactivateOpen} onClose={this.handleDeactiveUser} arial-label-title="form-dialog-title">
                    <DialogTitle id='form-dialog-title'>Desetivar Usuário</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Tem certeza que deseja desativar o usuário <b>{this.state.selectedPerson.name} </b>?
                    </DialogContentText>
                    </DialogContent>


                    <DialogActions>
                        <Button onClick={() => { this.deactiveUser(this.state.selectedPerson.name) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                        <Button onClick={this.handleCloseDeactivate} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                    </DialogActions>
                </Dialog>

                {/* Reativar usuario */}
                <Dialog open={this.state.modalReactivateOpen} onClose={this.handleReative} arial-label-title='form-ialog-title'>
                    <DialogTitle>
                        Reativar Usuário
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>Deseja reativar usuário <b>{this.state.selectedPerson.name}</b>?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { this.reativeUser(this.state.selectedUsers.key) }} style={{ backgroundColor: 'green', color: '#FFF' }}>Sim</Button>
                        <Button onClick={this.handleCloseReactivateUser} style={{ backgroundColor: 'red', color: '#FFF' }}>Cancelar</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}



export default withRouter(UsersRFID);