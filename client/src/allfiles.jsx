import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from "./navigation";
import "./App.css";

const Allfiles = () => (
  <div >
    <Navigation />
    <h1>All Files</h1>
    <header className="main">
    <center>
    <Link to="/allfiles/publicfiles"><button class="btn1">Public Files</button></Link>
    <Link to="/allfiles/premiumfiles"><button class="btn2">Premium File</button></Link>
    </center>
    </header>
  </div>
);

export default Allfiles;
