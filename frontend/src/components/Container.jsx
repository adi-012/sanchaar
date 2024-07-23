import React from 'react'
import {Link} from 'react-router-dom'
import "./Container.css"

function Container({children}) {
  return (
    <div className='container'>
        <div className='box'>
            {children}
        </div>
    </div>
  )
}

export default Container