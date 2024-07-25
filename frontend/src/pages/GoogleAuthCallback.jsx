import { useContext, useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import AuthContext from "../context/AuthContext"
import axios from "axios"

export default function GoogleAuthCallback() {

    const {username, setUsername, authStatus, setAuthStatus} = useContext(AuthContext)
    axios.defaults.withCredentials = true

    const navigate = useNavigate()

    useEffect(() => {
    axios.post("http://localhost:3000/auth")
    .then(response => {
      if (response.data.user) {
        setAuthStatus(true);
        setUsername(response.data.user.username);
        navigate('/')
      } else {
        setUsername("")
        navigate("/")
      }
    })
    .catch(e => {
      setUsername("")
      navigate("/")
    })

    })

  return (
    <div>GoogleAuthCallback</div>
  )
}
