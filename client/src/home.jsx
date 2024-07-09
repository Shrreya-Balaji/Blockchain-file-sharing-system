import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from "./navigation";
import "./App.css";



const Home = () => (
  <div >
    <Navigation />
    <header className="main">
    <Link to="/upload"><button class="btn1">Click to Upload File</button></Link>
    <Link to="/uploadedfiles"><button class="btn2">Click to Share File</button></Link>
    <Link to="/allfiles"><button class="btn1">Click to See All Files</button></Link>
    </header>
  </div>
);

export default Home;
