import React from 'react'
import Container from "../components/Container"
import SideBar from "../components/SideBar"
import Chat from "../components/Chat"
import "./Chats.css"
import { useState, useContext, useEffect, useMemo } from 'react'
import axios from 'axios'
import AuthContext from "../context/AuthContext"
import { useNavigate } from 'react-router-dom'

let peerConnection

const setPeerConnection = value => {
  peerConnection = value;
}

function Chats() {

  const {username, authStatus, setAuthStatus} = useContext(AuthContext)
  const navigate = useNavigate()

  const [selectedChat, setSelectedChat] = useState(null);

  const [userChats, setUserChats] = useState([])

  const [chats, setChats] = useState([])
  
  const [onlineUsers, setOnlineUsers] = useState([])

  const [inCall, setInCall] = useState(false)

  const [ws, setWs] = useState(null)

  const [localStream, setLocalStream] = useState(null)
  const [incomingCallData, setIncomingCallData] = useState(null)
  const [callList, setCallList] = useState([])

  const chatUser = useMemo(() => {
    if (selectedChat){
      return userChats.find(c => c.chatId === selectedChat).recvName
    }
    return null
  }, [selectedChat])

  useEffect(() => {
     const socket = new WebSocket("ws://localhost:3000")
     setWs(socket)

     socket.addEventListener('message', handleReceiveMessage);

     return () => {
       if (socket.readyState == WebSocket.OPEN) {
         socket.close()
       }
     }
  }, [])

  const handleReceiveMessage = async (e) => {
    const data = JSON.parse(e.data)
    if ( data.type === "chat") {
      setUserChats(prev => [...prev, data.chat])
    }
    if (data.type === "msg") {
      setChats(prev => prev.map(chat => {
        if (chat._id === data.chatId) {
          return {
            ...chat,
            messages: [...chat.messages, data.message]
          }
        }
        return chat;
      }))

      //const updatedUserChats = userChats.map(chat => {
      //  return chat.chatId === data.chatId ? {...chat, seen: false, lastUpdate: data.message.timestamp } : chat
      //})

      console.log(data.chatId === selectedChat)
      setUserChats(prev => prev.map(chat => {
        return chat.chatId === data.chatId ? {...chat, 'seen': data.chatId === selectedChat, lastUpdate: new Date(data.message.timestamp).toISOString()} : chat
      }))
    }
    if (data.type === "onlineUsers") {
      setOnlineUsers(data.userList)
    }
    if (data.type === 'offer') {
        handleIncomingCall(data);
        console.log("got offer")
    }
    if (data.type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
    }
    if (data.type === 'candidate') {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
    }
    if (data.type === 'cutCall') {
        handleCutCall()
    }
  }

  const handleIncomingCall = (data) => {
      setCallList(prev => [...prev, data])
  }

  const handleCutCall = () => {
    if (peerConnection) {
      peerConnection.close()
      setPeerConnection(null)
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null)
    }

    setInCall(false)

    setCallList(prev => prev.filter(e => e.sender !== chatUser))

    console.log("got here")
    // should go in Chat.jsx, need to pass peerConn and localStream
  }

  useEffect(() => {

    if (authStatus === false && username === "") {
      return navigate("/")
    }

    axios.post("http://localhost:3000/api/fetchChats")
    .then(response => {
      setUserChats(response.data.chatList)
      setChats(response.data.chats)
    })
    .catch(e => {
      console.log(e)
    })
  },[username, authStatus])

  if (username === null || username === "") {
    return <div>Hi</div>
  }

  return (
    <div className='page'>
      <Container>
        <div className='chat-container'>
          <SideBar callList={callList} inCall={inCall} onlineUsers={onlineUsers} username={username} userChats={userChats} setUserChats={setUserChats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
          <Chat ws={ws} callList={callList} setCallList={setCallList} localStream={localStream} setLocalStream={setLocalStream} inCall={inCall} setInCall={setInCall} onlineUsers={onlineUsers} userChats={userChats} selectedChat={selectedChat} chats={chats} setChats={setChats} />
        </div>
      </Container>
    </div>
  )
}

export default Chats
export {peerConnection, setPeerConnection}