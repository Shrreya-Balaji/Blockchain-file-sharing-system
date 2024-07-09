import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from "./navigation";
import "./App.css";
import Web3 from 'web3'; // Import Web3 library
import ContractABI from "./abii.json"; // Import your contract ABI
import axios from 'axios'; 


const Premiumfiles = () => {
  const [premiumFiles, setPremiumFiles] = useState([]);
  const web3 = new Web3(window.ethereum);
  const contractAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4';
  const contract = new web3.eth.Contract(ContractABI, contractAddress);

  useEffect(() => {
    getPremiumFiles();
  }, []);


  const getPremiumFiles = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];
      const premiumFilesResult = await contract.methods.getPremiumFiles().call({from:owner});
      setPremiumFiles(premiumFilesResult);
    } catch (error) {
      console.error('Error fetching public files:', error);
    }
  };

return(
  
  <div >
    <Navigation />
    <h1>Premium Files</h1>

    {premiumFiles.length > 0 ? (
          premiumFiles.map((file, index) => (
            <div key={index} className="files">
              <p>File ID: {file.fileId}</p>
              <p>File Name: {file.fileName}</p>
              <p>Amount : 0.1 ETH</p>
              <Link>Request</Link>
              <br></br><br></br>
              
            </div>
          ))
        ) : (
          <p>No premium files available</p>
        )}

    <center>
    
    </center>
  </div>
);
};

export default Premiumfiles;
