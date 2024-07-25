import React from 'react'
import "../pages/Chats.css"
import { useState, useContext, useMemo } from 'react'
import axios from 'axios'
import AuthContext from "../context/AuthContext"
import { useNavigate } from 'react-router-dom'

function SideBar({callList, inCall, onlineUsers, username, userChats, setUserChats, selectedChat, setSelectedChat}) {

  const [showAddMenu, setShowAddMenu] = useState(false);

  const [filterKey, setFilterKey] = useState("");

  const sortedUserChats = useMemo(() => {
    if (userChats.length === 0) {
        return []
    }
    if (filterKey !== "") {
        return userChats.filter(chat => chat.recvName.toLowerCase().includes(filterKey.toLowerCase())).sort((a,b) => Date.parse(b.lastUpdate) - Date.parse(a.lastUpdate))
    }
    return userChats.sort((a,b) => Date.parse(b.lastUpdate) - Date.parse(a.lastUpdate));
  }, [userChats, filterKey])

  const updateSeen = async (chatId) => {
    console.log(sortedUserChats)
        const chat = userChats.find(chat => chat.chatId === chatId);
        if (chat.seen) return;
        const updatedChats = userChats.map(chat => {
            return chat.chatId === chatId ? {...chat, 'seen': true} : chat
        })
        setUserChats(updatedChats)
        try {
            await axios.post("http://localhost:3000/api/updateSeen", {
            chatId
        })
        } catch(e) {
            console.log(e)
        }
  }

  axios.defaults.withCredentials = true


  const filterChats = e => {
    setFilterKey(e.target.value)
  }

  const navigate = useNavigate()

  const {setAuthStatus} = useContext(AuthContext)

  const [userSearch, setUserSearch] = useState("")

  const [userSearchKey, setUserSearchKey] = useState("")

  const handleSearch = async () => {
    if (userSearchKey === "") {
        return;
    }
    const response = await axios.post("http://localhost:3000/api/findUser", {
        searchKey: userSearchKey
    })
    if (response.data === "no user") {
        setUserSearch("no user")
    } else {
        setUserSearch(response.data)
    }
  }

  const handleAdd = async () => {
    try {
        const response = await axios.post("http://localhost:3000/api/addUser", {
            username: userSearch
        })
    } catch (e) {
        console.log(e)
    }
    setUserSearch("")
    setUserSearchKey("")
    setShowAddMenu(false)
  }

  const handleLogout = async () => {
    try {
        const response = await axios.post("http://localhost:3000/auth/logout")
        if (response.data === "logged out") {
            setAuthStatus(false)
            navigate("/")
        }
    } catch(err) {
        console.log(err)
    }
  }

  return (
    <div className='sidebar'>
        <div className='user-menu'>
            <div className='user-info'>
                <img src="https://img.icons8.com/?size=100&id=82751&format=png&color=000000"/>
                <div>{username}</div>
            </div>
            <div className='toggle-menu' onClick={() => {
                if (showAddMenu) {
                    setUserSearchKey("")
                    setUserSearch("")
                }
                setShowAddMenu(prev => !prev)}}>
                { showAddMenu ? <img src='https://img.icons8.com/?size=100&id=3062&format=png&color=000000' /> : <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 50 50">
<path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 24 13 L 24 24 L 13 24 L 13 26 L 24 26 L 24 37 L 26 37 L 26 26 L 37 26 L 37 24 L 26 24 L 26 13 L 24 13 z"></path>
</svg> 
}
            </div>
        </div>
        {showAddMenu &&
        <div className="add-menu">
            <div>
            <input className="user-search" type="text" placeholder="username" value={userSearchKey}
            onChange={e => setUserSearchKey(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            </div>
            {userSearch === "" ? null : userSearch === "no user" ?
            <div>
                No User
            </div> :
            <div className="user-result">
                <span>{userSearch}</span>
                <button onClick={handleAdd}>Add</button>
            </div>
        }
            
        </div>}
        <div className='search'>
            <input type='text' placeholder='Search' value={filterKey} onChange={filterChats} />
        </div>
        { !inCall &&
        <>
        <div className='user-chats'>
            {sortedUserChats && sortedUserChats.map(chat => {
                return (
                    <div key={chat.chatId} className={`user-chat-item ${chat.seen ? 'seen' : ''} ${selectedChat === chat.chatId ? 'selected' : ''}`}
                    onClick={() => {
                        setSelectedChat(chat.chatId);
                        updateSeen(chat.chatId);
                    }}>
                        <img src="https://img.icons8.com/?size=30&id=82751&format=png&color=000000" className={onlineUsers.includes(chat.recvName) ? 'border-green' : ''}/>
                        <span>{chat.recvName}</span>
                    </div>
                )
            })}
        </div>
        <div className="logout" onClick={handleLogout}>
            Log Out
        </div>
        </>
        }
    </div>
  )
}

export default SideBar