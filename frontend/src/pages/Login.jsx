import React from 'react'
import "../components/Input.css"
import Container from '../components/Container'
import {useState, useRef, useContext} from 'react'
import Eye from "../assets/eye.svg"
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios"
import AuthContext from "../context/AuthContext"

function Login() {

  const inputRef = useRef(null)

  const [showPass, setShowPass] = useState(false)

  const {authStatus, setAuthStatus} = useContext(AuthContext)

  axios.defaults.withCredentials = true

  const toggleShow = () => {
     setShowPass(prev => !prev);
  }

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/auth/login",{
        username,
        password
      })
      if (response.data === "success") {
        setAuthStatus(true);
        navigate("/")
      }
    } catch(err) {
      console.log(err);
    }
  }

  return (
    <div className='page'>
      <Container>
        <h2>Login</h2>
        <div className='input-item'>
          <label htmlFor='username'>Username</label>
          <div className='inputContainer'>
            <input type='text' className='input' id="username" placeholder="Username" required value={username} 
            onChange={e => setUsername(e.target.value)}
            />
          </div>
        </div> 
        <div className='input-item'>
          <label htmlFor='password'>Password</label>
          <div className='inputContainer'>
            <input ref={inputRef} type={showPass ? 'text' : 'password'} className='input' id="password" placeholder="Password" required value={password}
            onChange={e => setPassword(e.target.value)}
            />
            <img className='eye-show' src={Eye} alt="show" onClick={toggleShow}/>
          </div>
        </div>
        <div className='button-container' onClick={handleLogin}>
          Login
        </div>
        <div className='register-link'>
          <Link to="/register">
          New User? Create Account
          </Link>
        </div>
    
      </Container>
    </div>
  )
}

export default Login