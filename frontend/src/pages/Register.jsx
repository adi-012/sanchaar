import React from 'react'
import Container from '../components/Container'
import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import Eye from "../assets/eye.svg"
import axios from "axios";
import { useNavigate } from 'react-router-dom'

function Register() {

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rePassword, setRePassword] = useState("")
  const [isUsernameValid, setIsUsernameValid] = useState(true)
  const [isPasswordValid, setIsPasswordValid] = useState(true)
  const [isPasswordMatching, setIsPasswordMatching] = useState(true)

  const [showPass, setShowPass] = useState(false)

  axios.defaults.withCredentials = true;

  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:3000/auth/register", {
        username,
        password,
        email
      })

      if (response.data.msg === "created") {
        navigate("/login")
      }
    } catch (e) {

    }
  }

  const toggleShow = () => {
     setShowPass(prev => !prev);
  }

  return (
    <div className='page'>
      <Container>
        <h2>Register</h2>
        <div className='input-item'>
          <label htmlFor='email'>Email</label>
          <div className='inputContainer'>
            <input type='email' className={`input pass`} id="email" value={email} placeholder="Email" required 
            onChange={
              (e) => {
                setEmail(e.target.value)
                }
            } />
          </div>
        </div>
        <div className='input-item'>
          <label htmlFor='username'>Username</label>
          <div className='inputContainer'>
            <input type='text' className={`input pass ${isUsernameValid ? '' : 'border-red'}`} id="username" value={username} placeholder="Username" required 
            onChange={
              (e) => {
                setUsername(e.target.value)
                if (e.target.value.length <= 3 && e.target.value.length != 0) {
                  setIsUsernameValid(false)
                } else {
                  setIsUsernameValid(true)
                }
              }
            } />
          </div>
        </div>
        <div className='input-item'>
          <label htmlFor='password'>Password</label>
          <div className='inputContainer'>
            <input type={showPass ? 'text' : 'password'} value={password} className={`input ${isPasswordValid ? '' : 'border-red'}`} id="password" placeholder="Password" required
            onChange={e => {
              setPassword(e.target.value)
              const passwordRegex = /^[a-zA-Z]{5,}$/
              if (!passwordRegex.test(e.target.value) && e.target.value.length != 0) {
                setIsPasswordValid(false)
              } else {
                setIsPasswordValid(true)
              }
            }}
            />
            <img className='eye-show' src={Eye} alt="show" onClick={toggleShow}/>
          </div>
        </div>  
        <div className='input-item'>
          <label htmlFor='re-password'>Confirm Password</label>
          <div className='inputContainer'>
            <input type={showPass ? 'text' : 'password'} value={rePassword} className={`input ${isPasswordMatching ? '' : 'border-red'}`} id="re-password" placeholder="Confirm Password" required 
            onChange={e => {
              setRePassword(e.target.value)
              if (password !== e.target.value && e.target.value != "") {
                setIsPasswordMatching(false)
              } else {
                setIsPasswordMatching(true)
              }
            }}
            />
            <img className='eye-show' src={Eye} alt="show" onClick={toggleShow}/>
          </div>
        </div>
        <div className='button-container' onClick={handleRegister}>
          Register
        </div>
        <div className='register-link'>
          <Link to="/login">
            Have an account? Login
          </Link>
        </div>
        <div className='register-link'>
          <a href="http://localhost:3000/auth/google/login">
            Login with Google
          </a>
        </div>
      </Container>
    </div>
  )
}

export default Register