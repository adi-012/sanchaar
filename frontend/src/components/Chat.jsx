import { useMemo, useRef, useState, useEffect } from 'react'
import axios from 'axios'

function Chat({inCall, setInCall, selectedChat, chats, setChats, userChats}) {

  const [message, setMessage] = useState("")

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

  const call = () => {
    setInCall(prev => !prev)
  }

  return (
    <div className='chat'>
        <div className='chat-details'>
          <div className="user-details-chat">
            <img src="https://img.icons8.com/?size=40&id=82751&format=png&color=000000"/>
            <span>{chatUser}</span>
          </div>
            <img src='https://img.icons8.com/?size=30&id=fnQivuIylSo3&format=png&color=000000' className='call-logo' onClick={call}/>
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
            <video id="remote-vid" autoPlay playsInline></video>
            <video id="local-vid" autoPlay playsInline></video>
          </div>
          <div id="controls">
              <div id="mute">Mute</div>
              <div id="toggle-cam">Toggle Camera</div>
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