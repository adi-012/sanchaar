import "./components/Input.css"
import "./App.css"
import { useEffect, useState } from "react";
import axios from "axios";
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Chats from "./pages/Chats"
import UserSettings from "./pages/UserSettings"
import AuthContext from "./context/AuthContext";

function App() {

  const [authStatus, setAuthStatus] = useState(false);
  const [username, setUsername] = useState(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.post("http://localhost:3000/auth")
    .then(response => {
      if (response.data.user) {
        setAuthStatus(true);
        setUsername(response.data.user.username);
      } else {
        setUsername("")
      }
    })
    .catch(e => {
      setUsername("")
    })
  },[authStatus])

  return (
    <AuthContext.Provider value={{username, authStatus, setAuthStatus}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/settings" element={<UserSettings />} />
          </Routes>
      </BrowserRouter>
    </AuthContext.Provider>

  )
}

export default App