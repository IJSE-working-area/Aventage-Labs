import React from 'react';
import './Navigation.css';
import {Link} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function Navigation() {
    return (
        <div id='navigationset' className='bg-dark col-auto col-md-2 min-vh-100'>
            <br/>
            <ul className='nav nav-pills flex-column'>
                <li className='nav-item text-white fs-6'>
                    <Link className='nav-link text-white text-decoration-none' to="/">Home</Link>
                </li>
                <li className='nav-item text-white fs-6'>
                    <Link className='nav-link text-white text-decoration-none' to="">Contact</Link>
                </li>

            </ul>
        </div>


    );
}

