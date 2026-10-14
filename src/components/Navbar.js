import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar(props) {
    const [open, setOpen] = useState(false);
    const navRef = useRef(null);
    const { pathname } = useLocation();

    useEffect(() => setOpen(false), [pathname]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        const onPointer = (e) => navRef.current && !navRef.current.contains(e.target) && setOpen(false);
        document.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', onPointer);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('pointerdown', onPointer);
        };
    }, [open]);

    // Sticky elements below the navbar (docs contents bar, tools panel) read its height from --tu-nav-h.
    // Measured from the brand row so the opening mobile menu doesn't change it.
    useEffect(() => {
        const measure = () => {
            const nav = navRef.current;
            const brand = nav && nav.querySelector('.navbar-brand');
            if (!brand) return;
            const style = window.getComputedStyle(nav);
            const height = brand.offsetHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + 1;
            if (height > 1) document.documentElement.style.setProperty('--tu-nav-h', `${height}px`);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    return (
        <>
            <nav ref={navRef} className={`navbar navbar-expand-lg navbar-${props.mode} sticky-top tu-navbar ${open ? 'is-open' : ''}`}>
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" title="Home" aria-label={props.title}>
                        <Logo size={30} title="" />
                        <span>{props.title}</span>
                    </Link>
                    <button className="navbar-toggler" type="button" onClick={() => setOpen(!open)} aria-controls="mainNav" aria-expanded={open} aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className={`navbar-collapse tu-nav-collapse ${open ? 'is-open' : ''}`} id="mainNav">
                        <div className="tu-nav-inner">
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

                            <div className={`form-check form-switch tu-mode-switch text-${props.mode === 'light'?'dark':'light'}`}>
                                <input className="form-check-input" checked={props.mode === 'dark'} onChange={props.toggleMode} type="checkbox" role="switch" id="flexSwitchCheckDefault" />
                                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Dark Mode</label>
                            </div>
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
