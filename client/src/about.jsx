import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from "./navigation";
import "./App.css";

const About = () => (
  <div >
    <Navigation />
    <h1>About</h1>
    <h2>It is file sharing and storing website.The files are stored in AWS Cloud.
        It uses the blockchain technology to storing the meta data of the file.</h2>
    
    <center>
    <h3>Created By</h3>
    
        <li>Giri Prasath V</li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>

    
    </center>
  </div>
);

export default About;
