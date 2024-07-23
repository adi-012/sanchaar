import React from 'react'
import "./NavBar.css"
import { Link } from 'react-router-dom'

function NavBar() {
  return (
    <nav className='nav-bar'>
        <div className='logo'>
            Chat-App
        </div>
        <ul className='nav-links'>
            <li><Link to="#">About</Link></li>
            <li><Link to="#">Contact</Link></li>
        </ul>
    </nav>
  )
}

export default NavBar