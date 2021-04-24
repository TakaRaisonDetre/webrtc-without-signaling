
import './App.css';
import React, {Component} from 'react'
import styled from 'styled-components'
import io from 'socket.io-client'

class App extends Component {
 
  constructor(props) {
    super(props)

    // https://reactjs.org/docs/refs-and-the-dom.html
    this.localVideoref = React.createRef()
    this.remoteVideoref = React.createRef()

    this.socket = null
    this.candidates = []
  }

  componentDidMount = () => {

    this.socket = io(
      '/webrtcPeer',
      {
        path: '/webrtc',
        query: {}
      }
    )

    this.socket.on('connection-success', success => {
      console.log(success)
    })

    this.socket.on('offerOrAnswer', (sdp) => {
      this.textref.value = JSON.stringify(sdp)

      // set sdp as remote description
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
    })

    this.socket.on('candidate', (candidate) => {
      // console.log('From Peer... ', JSON.stringify(candidate))
      this.candidates = [...this.candidates, candidate]
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    })

    // const pc_config = null

    const pc_config = {
      "iceServers": [
        // {
        //   urls: 'stun:[STUN_IP]:[PORT]',
        //   'credentials': '[YOR CREDENTIALS]',
        //   'username': '[USERNAME]'
        // },
        {
          urls : 'stun:stun.l.google.com:19302'
        }
      ]
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
    // create an instance of RTCPeerConnection
    this.pc = new RTCPeerConnection(pc_config)

    // triggered when a new candidate is returned
    this.pc.onicecandidate = (e) => {
      // send the candidates to the remote peer
      // see addCandidate below to be triggered on the remote peer
      if (e.candidate) {
       console.log(JSON.stringify(e.candidate))
        this.sendToPeer('candidate', e.candidate)
      }
    }

    // triggered when there is a change in connection state
    this.pc.oniceconnectionstatechange = (e) => {
      console.log(e)
    }

    // triggered when a stream is added to pc, see below - this.pc.addStream(stream)
    //  this.pc.onaddstream = (e)=>{
    //   this.remoteVideoref.current.srcObject = e.streams[0]
    //  }
  
     this.pc.ontrack = (e) => {
       this.remoteVideoref.current.srcObject = e.streams[0]
     }

 // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // see the above link for more constraint options
    const constraints = {
      audio: false,
      video: true,
      // video: {
      //   width: 1280,
      //   height: 720
      // },
      // video: {
      //   width: { min: 1280 },
      // }
    }
      // called when getUserMedia() successfully returns - see below
    // getUserMedia() returns a MediaStream object (https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
    const success = (stream) => {
      window.localStream = stream
      this.localVideoref.current.srcObject = stream
      this.pc.addStream(stream)
    }

    // called when getUserMedia() fails - see below
    const failure = (e) => {
      console.log('getUserMedia Error: ', e)
    }


     // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
     navigator.mediaDevices.getUserMedia(constraints)
     .then(success)
     .catch(failure)
  


   
  }

  sendToPeer = (messageType, payload) => {
    this.socket.emit(messageType, {
      socketID: this.socket.id,
      payload
    })
  }

  /* ACTION METHODS FROM THE BUTTONS ON SCREEN */

  createOffer = () => {
    console.log('Offer')

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
    // initiates the creation of SDP
    this.pc.createOffer({ offerToReceiveVideo: 1 })
      .then(sdp => {
         console.log(JSON.stringify(sdp))

        // set offer sdp as local description
        this.pc.setLocalDescription(sdp)

        this.sendToPeer('offerOrAnswer', sdp)
    })
  }


  setRemoteDescription = () => {
    // retrieve and parse the SDP copied from the remote peer
    const desc = JSON.parse(this.textref.value)

    // set sdp as remote description
    this.pc.setRemoteDescription(new RTCSessionDescription(desc))
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
  // creates an SDP answer to an offer received from remote peer
  createAnswer = () => {
    console.log('Answer')
    this.pc.createAnswer({ offerToReceiveVideo: 1 })
      .then(sdp => {
         console.log(JSON.stringify(sdp))

        // set answer sdp as local description
        this.pc.setLocalDescription(sdp)

        this.sendToPeer('offerOrAnswer', sdp)
    }, e=>{})
  }

  addCandidate = () => {
    this.candidates.forEach(candidate => {
      console.log(JSON.stringify(candidate))
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    });
  }


  render(){

  

    return (
      <div style={{margin:0, padding:20, height:950, backgroundColor:'black'}}>
        <h3 style={{color:'white'}}>Peer-to-Peer WebRTC</h3>
        <br/><br/>
     <div style={{backgroundColor:'#222222'}}>
     <video 
       style={{width:240, height:180, margin:5, backgroundColor:'black'}}
       ref={this.localVideoref} 
       autoPlay></video>

      <video 
       style={{width:240, height:180, margin:5, backgroundColor:'black'}}
       ref={this.remoteVideoref} 
       autoPlay></video>
     </div>
     
     <br/>
     <div style={{display:'flex', }}>
     <Button onClick={this.createOffer}>Offer</Button>
      <Button onClick={this.createAnswer}>Answer</Button>
     </div>
    
      <br/>
      <h4  style={{ margin:20, fontSize:10, color:'white'}}>SDP Info</h4>
      <textarea 
      style={{height:300, width:'100%', backgroundColor:'black', fontSize:10, color:'green'}}
      ref={ref=>{this.textref=ref}}/>
      <br/><br/>
      <div style={{display:'flex', }}>
      <Button onClick={this.setRemoteDescription}>Set Remote Description</Button>
      <Button onClick={this.addCandidate}>Add Candidate</Button>
      </div>
      
      </div>
    );
  }
  }

 

export default App


const Button = styled.button` 
  display: inline-block;
  color: palevioletred;
  font-size: 0.8em;
  weight:700;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
  display: block;

`