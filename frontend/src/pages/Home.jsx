import NavBar from "../components/NavBar"
import Container from "../components/Container"
import { Link } from "react-router-dom"
import { useContext } from "react"
import AuthContext from "../context/AuthContext"

export default function() {

  const {authStatus} = useContext(AuthContext)

return (
    <div className='page'>
      <NavBar />
      <Container>
            <Link to={authStatus ? '/chats' : '/login'} className='link-button-content'>{authStatus ? 'Open' : 'Login'}</Link>
      </Container>
    </div>
)
}