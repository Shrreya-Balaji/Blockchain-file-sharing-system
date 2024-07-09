import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from "./navigation";
import ContractABI from "./abii.json"; // Import your contract ABI
import Web3 from 'web3'; // Import Web3 library

const UploadedFiles = () => {
  const [files, setFiles] = useState([]);
  
  const web3 = new Web3(window.ethereum); // Initialize Web3 with your Ethereum node address
  const contractAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'; // Replace with your contract address
  const contract = new web3.eth.Contract(ContractABI, contractAddress); // Create contract instance

  useEffect(() => {
    fetchFiles();
  }, []); // Fetch files when component mounts

  const fetchFiles = async () => {
    try {
      // Get available accounts
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0]; // Assuming the first account is the owner

      // Call the contract function to get all files uploaded by the user
      const filesData = await contract.methods.getAllFiles(owner).call({ from: owner });

      // Set the files state with the fetched data
      setFiles(filesData);
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  return (
    <div>
      <Navigation />
      <h1>Uploaded Files</h1>
      {files.length>0 ? (
      <div >
        {files.map((file, index) => (
          <div key={index} class="files">
            <p>File ID: {file.fileId}</p>
            <p>File Name: {file.fileName}</p>
            <Link to={`/decrypt?fileId=${file.fileId}`}>Decrypt</Link>
            <Link to={`/share?fileName=${file.fileName}` }class="share">Share</Link>
            <Link to={`/activitylog?fileId=${file.fileId}` }class="share">Activity Log</Link>
          </div>
        ))}
      </div>)
      :(<p>Loading....</p>)
}


    </div>
  );
};

export default UploadedFiles;
