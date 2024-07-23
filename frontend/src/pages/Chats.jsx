import React from 'react'
import Container from "../components/Container"
import SideBar from "../components/SideBar"
import Chat from "../components/Chat"
import "./Chats.css"
import { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import AuthContext from "../context/AuthContext"
import { useNavigate } from 'react-router-dom'

function Chats() {

  const {username, authStatus, setAuthStatus} = useContext(AuthContext)
  const navigate = useNavigate()

  const [selectedChat, setSelectedChat] = useState(null);

  const [userChats, setUserChats] = useState([])

  const [chats, setChats] = useState([])
  
  const [onlineUsers, setOnlineUsers] = useState([])

  const [inCall, setInCall] = useState(false)

  const [ws, setWs] = useState(null)

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

  const handleReceiveMessage = (e) => {
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
          <SideBar inCall={inCall} onlineUsers={onlineUsers} username={username} userChats={userChats} setUserChats={setUserChats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
          <Chat inCall={inCall} setInCall={setInCall} onlineUsers={onlineUsers} userChats={userChats} selectedChat={selectedChat} chats={chats} setChats={setChats} />
        </div>
      </Container>
    </div>
  )
}

export default Chats