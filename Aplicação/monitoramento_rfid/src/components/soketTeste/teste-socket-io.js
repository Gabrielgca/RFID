import React from "react";
import io from 'socket.io-client';

class TesteSocket extends React.Component {
    state = {
        data: "",
        socketStatus:"On",
        room: ''
    }
    componentWillUnmount() {
        this.socket.close()
        console.log("component unmounted")
    }
    componentDidMount() {
      
        var sensorEndpoint = "http://192.168.2.196:7000"
            this.socket = io.connect(sensorEndpoint, {
            reconnection: true,
            //transports: ['websocket']
        });

        
        console.log("component mounted")
            this.socket.on("responseMessage", message => {
                this.setState({data: message.data})
                
                console.log("responseMessage", message)
            })

            this.socket.on('rooms_update', rooms => {
                this.setState({room: rooms})

                console.log('rooms_update', rooms)
            })
            
    }

    render() {
        return (
            <React.Fragment>
            <div>Data: {this.state.data}</div>
            <div>Status: {JSON.stringify(this.state.room)}</div>
            <div onClick={this.handleEmit}> Start/Stop</div>
            </React.Fragment>
        )
    }
}
export default TesteSocket;