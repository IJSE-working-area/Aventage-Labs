import React, {useEffect, useState} from 'react';
import './Home.css';
import Navigation from "../../components/Navigation/Navigation";
import {Link} from "react-router-dom";
import axios from "axios";
import myImage from '../../assets/resturent.jpg';

export default function Home() {
    
    return (
        <div className='container-fluid'>
            <div className='row'>
                <header className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
                    <h1 className='text-white'>Colombo resturant</h1>
                </header>
                <Navigation/>
                <div className='col-md-10' id='conainercontain'>
                    <div className='container'>
                        <img src={myImage} alt="My Image" />
                        
                    </div>
                </div>
            </div>



        </div>
    );
}


