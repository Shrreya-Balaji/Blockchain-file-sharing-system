import React from 'react';
//import { BrowserRouter as Router,Routes,Route, Link } from 'react-router-dom';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import FileUpload from './fileupload'; 
import FileDecrypt from './filedecrypt'; 
import Home from './home';
import About from './about';
import Uploadedfiles from './uploadedfiles';
import Notification from './notification';
import Sharefile from './sharefile';
import Activitylog from './activitylog';
import Allfiles from './allfiles';
import Viewsharedfile from './viewsharedfile';
import Publicfiles from './publicfiles';
import Premiumfiles from './premiumfiles';
import './App.css';
import Login from './authentication';

function App() {
  return (
    <Router>
        <Routes>
          
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/uploadedfiles" element={<Uploadedfiles />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/upload" element={<FileUpload />} />
        <Route path="/decrypt" element={<FileDecrypt />} />
        <Route path="/share" element={<Sharefile />} />
        <Route path="/activitylog" element={<Activitylog />} />
        <Route path="/allfiles" element={<Allfiles />} />
        <Route path="/allfiles/publicfiles" element={<Publicfiles />} />
        <Route path="/allfiles/premiumfiles" element={<Premiumfiles />} />
        <Route path="/viewsharedfile" element={<Viewsharedfile />} />
        </Routes>
    </Router>
  );
}

export default App;