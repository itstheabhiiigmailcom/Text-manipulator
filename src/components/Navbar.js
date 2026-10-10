import React from 'react'
import PropTypes from 'prop-types'
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar(props) {
    return (
        <>
            <nav className={`navbar navbar-expand-lg navbar-${props.mode} sticky-top tu-navbar`}>
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" title="Home" aria-label={props.title}>
                        <Logo size={30} title="" />
                        <span>{props.title}</span>
                    </Link>
                    <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/tools">All Tools</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/docs">Docs</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/about">About</NavLink>
                            </li>
                        </ul>
                        
                        {/* <div className="d-flex">
                            <div className="bg-primary rounded mx-2" onClick={() =>{props.toggleMode('primary')}} style={{height:'30px', width:'30px', cursor:'pointer'}}></div>
                            <div className="bg-success rounded mx-2" onClick={() =>{props.toggleMode('success')}} style={{height:'30px', width:'30px', cursor:'pointer'}}></div>
                            <div className="bg-danger rounded mx-2" onClick={() =>{props.toggleMode('danger')}} style={{height:'30px', width:'30px', cursor:'pointer'}}></div>
                            <div className="bg-warning rounded mx-2" onClick={() =>{props.toggleMode('warning')}} style={{height:'30px', width:'30px', cursor:'pointer'}}></div>
                        </div> */}

                        <div className={`form-check form-switch text-${props.mode === 'light'?'dark':'light'}`}>
                            <input className="form-check-input" checked={props.mode === 'dark'} onChange={props.toggleMode} type="checkbox" role="switch" id="flexSwitchCheckDefault" />
                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Dark Mode</label>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

Navbar.propTypes = { title: PropTypes.string.isRequired }         // nhi hoga to error produce krega

Navbar.defaultProps = {                         // agar kuchh pass hi krte hai App.js se to ye default value hogi
    title: 'Set title here'
}
