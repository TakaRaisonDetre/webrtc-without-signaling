
import './App.css';
import React, {Component} from 'react'
import styled from 'styled-components'

class App extends Component {
constructor (props){
  super(props)
  this.localViewRef = React.createRef()
  this.remoteViewRef = React.createRef()
}

componentDidMount(){
// this configuration will added with STUN and TURN
const pc_config = null



  this.pcon = new RTCPeerConnection(pc_config)
  
  this.pcon.onicecandidate =(event) =>{
    if(event.candidate) console.log(JSON.stringify(event.candidate))
  }
     // triggered when there is a change in connection state
  this.pcon.oniceconnectionstatechange =(event) =>{
    console.log(event)
  }

  this.pcon.ontrack =(event) =>{
    this.remoteViewRef.current.srcObject = event.streams[0]
  }

 
  


  const success = (stream)=>{
    window.localStream = stream  
    this.localViewRef.current.srcObject = stream 
    this.pcon.addStream(stream)  
    }
  
  const failure = (e)=>{
      console.log('GetuserMedial Error', e)
    } 


    const constraints = {video:true}
   // navigator.getUserMedia(constraints, success, failure )
   navigator.mediaDevices.getUserMedia(constraints)
   .then(success)
   .catch(failure)

}

createOffer = () =>{
  console.log('Offer')
  this.pcon.createOffer({offerToReceiveVideo:1})
  .then(sdp=>{
    console.log(JSON.stringify(sdp))
    this.pcon.setLocalDescription(sdp)
  },e=>{})
}

setRemoteDescription =() =>{
  const descritpion = JSON.parse(this.textref.value)
  this.pcon.setRemoteDescription(new RTCSessionDescription(descritpion));
}

createAnswer =()=>{
  console.log('Answer')
  this.pcon.createAnswer({offerToReceiveVideo:1})
  .then(sdp=>{
    console.log(JSON.stringify(sdp))
    this.pcon.setLocalDescription(sdp)
  })
}

addCandidate =()=>{
  const candidate = JSON.parse(this.textref.value)
  console.log('Adding candidate', candidate)
  this.pcon.addIceCandidate(new RTCIceCandidate(candidate))
}


  render(){

  

    return (
      <div style={{margin:0, padding:20, height:950, backgroundColor:'black'}}>
        <h3 style={{color:'white'}}>Peer-to-Peer WebRTC</h3>
        <br/><br/>
     <div style={{backgroundColor:'#222222'}}>
     <video 
       style={{width:240, height:180, margin:5, backgroundColor:'black'}}
       ref={this.localViewRef} 
       autoPlay></video>

      <video 
       style={{width:240, height:180, margin:5, backgroundColor:'black'}}
       ref={this.remoteViewRef} 
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