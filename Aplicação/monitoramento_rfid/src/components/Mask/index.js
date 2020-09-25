import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from '../../firebase';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CheckBox from '@material-ui/core/Checkbox';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputMask from 'react-input-mask';



import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import baseURL from "../../service";
import io from 'socket.io-client';
import FlatList from 'flatlist-react';

class Mask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hora: '',
            value:''
        }
    }

componentDidMount(){
    if (!firebase.getCurrent()) {
        this.props.history.replace('/');
        return null;
      }
}
    
onChange = (event, newState, oldState, userInput, hora, selection) =>{
    this.setState({hora: event.target.value})
    var hora  = newState;
    var selection = newState.selection;
    var cursorPosition = selection ? selection.start : null;
 
    // keep minus if entered by user
    if (hora.endsWith(':') && userInput !== ':' && !this.state.hora.endsWith(':')) {
      if (cursorPosition === hora.length) {
        cursorPosition--;
        selection = { start: cursorPosition, end: cursorPosition };
      }
      hora = hora.slice(0, -1);
    }
 
    return {
      hora,
      selection
    };
}
/* beforeMaskedValueChange = (newState, oldState, userInput) => {
    var { value } = newState;
    var selection = newState.selection;
    var cursorPosition = selection ? selection.start : null;
 
    // keep minus if entered by user
    if (value.endsWith(':') && userInput !== ':' && !this.state.value.endsWith(':')) {
      if (cursorPosition === value.length) {
        cursorPosition--;
        selection = { start: cursorPosition, end: cursorPosition };
      }
      value = value.slice(0, -1);
    }
 
    return {
      value,
      selection
    };
  } */
    render() {
        const Input = (props) =>(
            <InputMask mask="99:99:99" value={this.state.hora} onChange={this.onChange}>
                {(inputProps) => <TextField {...inputProps} variant='outlined' label='Hora' style={{background:'#FFF', margin:'20%', borderRadius:'10px'}}/>}
            </InputMask>
        )
        return (
            <div>
                
                <Input/>
                <Button onClick={() => {alert(this.state.hora)}} variant='contained'>Teste</Button>
                
            </div>
        )
    }
}

export default withRouter(Mask);