import { useMemo, useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { peerConnection, setPeerConnection } from '../pages/Chats'

function Chat({ws, callList, setCallList ,localStream, setLocalStream, onlineUsers, inCall, setInCall, selectedChat, chats, setChats, userChats}) {

  const [message, setMessage] = useState("")

  const [useAudio, setUseAudio] = useState(true)
  const [useVideo, setUseVideo] = useState(true)

  const msgBoxRef = useRef(null)

  const selectedChatMessages = useMemo(() => {
    if (selectedChat === null) return []
    const chat = chats.find(c => c._id === selectedChat)
    if (!chat) return []
    return [...chat.messages].sort((a,b) => a.time - b.time)
  }, [selectedChat, chats])

  useEffect(() => {
    if (msgBoxRef.current) {
      msgBoxRef.current.scrollIntoView({behavior: 'smooth'})
    }
  }, [chats, selectedChat])

  useEffect(() => {
    if (!inCall && localVidRef.current && remoteVidRef.current) {
      localVidRef.current.srcObject = null
      remoteVidRef.current.srcObject = null
    }

  }, [inCall])

  const remoteVidRef = useRef(null)
  const localVidRef = useRef(null)

  if (selectedChat === null) {
    return (
        <div></div>
    )
  }
  
  const chatUser = userChats.find(c => c.chatId === selectedChat).recvName

  const sendMessage = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/message", {
        message,
        selectedChat,
        timestamp: Date.now(),
        recvName: chatUser
      })
      setMessage("")
    }catch(e) {
      console.log("error in sending msg")
    }
  } 

  const call = async () => {
    if (!(onlineUsers.includes(chatUser))) {
      return
    }
    setInCall(true)

    if (peerConnection) {
      peerConnection.close()
      setPeerConnection(null)
    }
    initializePeerConnection()

    try {
        const locStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        localVidRef.current.srcObject = locStream
        locStream.getTracks().forEach(track => peerConnection.addTrack(track, locStream));
        setLocalStream(locStream)

        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)

        sendToServer({
          type: 'offer',
          offer: offer,
          target: chatUser
      });

    } catch(e) {
        console.log("error in calling")
    }
  }

  const cutCall = () => {
    if (peerConnection) {
      peerConnection.close()
      setPeerConnection(null)
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null)
    }

    localVidRef.current.srcObject = null
    remoteVidRef.current.srcObject = null
    setInCall(false)

    sendToServer({
      type: 'cutCall',
      target: chatUser
    })

    setCallList(prev => prev.filter(e => e.sender !== chatUser))
  }

  const answerCall = async() => {

    const callData = callList.find(obj => obj.sender === chatUser)
    if (!(callData)) return

    setInCall(true)

    if (!peerConnection) {
      initializePeerConnection()
    }

    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));
        const locStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVidRef.current.srcObject = locStream
        locStream.getTracks().forEach(track => peerConnection.addTrack(track, locStream));

        setLocalStream(locStream)

        console.log(locStream, 'reached here')

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        sendToServer({
            type: 'answer',
            answer: answer,
            target: chatUser
        });
    } catch(e) {
      console.log("error in answering call")
      console.log(e)
    }
  }

  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };
      setPeerConnection(new RTCPeerConnection(configuration))
      peerConnection.onicecandidate = e => {
        if (e.candidate) {
          sendToServer({
            type: 'candidate',
            candidate: e.candidate,
            target: chatUser
          })
        }
      }

      peerConnection.ontrack = e => {
        if (remoteVidRef.current.srcObject !== e.streams[0]) {
          remoteVidRef.current.srcObject = e.streams[0];
        }
      }
  }

  function sendToServer(message) {
    ws.send(JSON.stringify(message));
  }


  function toggleAudio() {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setUseAudio(prev => !prev)
    }
  }

  function toggleVideo() {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setUseVideo(prev => !prev)
  }
  }

  return (
    <div className='chat'>
        <div className='chat-details'>
          <div className="user-details-chat">
            <img src="https://img.icons8.com/?size=40&id=82751&format=png&color=000000"/>
            <span>{chatUser}</span>
            {callList.some(call => call.sender === chatUser) && <button onClick={answerCall}>Answer Call</button>}
          </div>
            <img src={inCall ? 'https://img.icons8.com/?size=30&id=6483&format=png&color=000000' : 'https://img.icons8.com/?size=30&id=fnQivuIylSo3&format=png&color=000000'} className='call-logo' onClick={!inCall ? call : cutCall}/>
        </div>
        
        { !inCall ?
        <div className='msg-box'>
            {selectedChatMessages && selectedChatMessages.map((msg, index) => {
                return (
                    <div key={index} className={`msg-${msg.senderName === chatUser ? 'other' : 'own'}`}>
                        {msg.text}
                    </div>
                )
            })}
            <div ref={msgBoxRef}></div>
        </div> :
        <div className='call-interface'>
          <div className='vid-container'>
            <video ref={remoteVidRef} id="remote-vid" autoPlay playsInline></video>
            <video ref={localVidRef} id="local-vid" autoPlay playsInline></video>
          </div>
          <div id="controls">
              <div id="mute" onClick={toggleAudio}>{useAudio ? 'Mute' : 'Unmute'}</div>
              <div id="toggle-cam" onClick={toggleVideo}>{useVideo ? 'Hide Video' : 'Show Video'}</div>
            </div>
        </div>
        }
        <div className='chat-input'>
            <input value={message} onChange={e => setMessage(e.target.value)}/>
            <button onClick={sendMessage}>Send</button>
        </div>
    </div>
  )
}

export default Chat