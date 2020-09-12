import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
const ENDPOINT = "http://192.168.2.196:7000"

class RFID extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teste: ""
        };
    }

    async componentDidMount() {
        const socket = socketIOClient(ENDPOINT);
        socket.on("teste", data => {
            alert(JSON.stringify(data));
            this.setState({ teste: data })
            
        })
    }

    testarReq = async () =>{
        alert(JSON.stringify(this.state.teste))
    }
    render() {
        return (
            <div>
                
            <Button onClick={this.testarReq}>Testar</Button>

            </div>
        );
    }
}

export default withRouter(RFID);
