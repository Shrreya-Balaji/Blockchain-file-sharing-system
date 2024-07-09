import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from "./navigation";
import "./App.css";
import Web3 from 'web3'; // Import Web3 library
import ContractABI from "./abii.json"; // Import your contract ABI
import axios from 'axios'; // Import axios for making HTTP requests

const Publicfiles = () => {
  const [publicFiles, setPublicFiles] = useState([]);
  const [decryptedBlob, setDecryptedBlob] = useState(null);
  const [userKey, setUserKey] = useState('');
  const [chunkHashes, setChunkHashes] = useState([]);
  const web3 = new Web3(window.ethereum);
  const contractAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4';
  const contract = new web3.eth.Contract(ContractABI, contractAddress);

  useEffect(() => {
    getPublicFiles();
  }, []);

  const getPublicFiles = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];
      const publicFilesResult = await contract.methods.getPublicFiles().call({from:owner});
      setPublicFiles(publicFilesResult);
    } catch (error) {
      console.error('Error fetching public files:', error);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];
      const fileDetails = await contract.methods.getFileDetails(owner, fileName).call({ from: owner });

      if (fileDetails) {
        setUserKey(fileDetails.encryptionKey);
        const cleanedChunkHashes = fileDetails.chunkHashes.map(hash => hash.replace(/^0x/, ''));
        setChunkHashes(cleanedChunkHashes);
        alert(`Downloading file: ${fileName}`);
      } else {
        console.error('Error handling download: File details not found');
      }
    } catch (error) {
      console.error('Error handling download:', error);
    }
  };

  useEffect(() => {
    if (userKey && chunkHashes.length > 0) {
      handleDecryption();
    }
  }, [userKey, chunkHashes]);

  const handleDecryption = async () => {
    try {
      const response = await axios.post('http://localhost:5000/decrypt', {
        chunkHashes: chunkHashes,
        userKey: userKey,
      });

      if (response && response.data && typeof response.data === 'string') {
        setDecryptedBlob(new Blob([response.data], { type: 'text/plain' }));
      } else {
        alert("No data for Decryption.");
        console.error('No decrypted data found in response:', response);
      }
    } catch (error) {
      alert("Please give Correct Decryption Key or File not found");
      console.error('Error decrypting file:', error);
    }
  };

  return (
    <div>
      <Navigation />
      <h1>Public Files</h1>
      
        {publicFiles.length > 0 ? (
          publicFiles.map((file, index) => (
            <div key={index} className="files">
              <p>File ID: {file.fileId}</p>
              <p>File Name: {file.fileName}</p>
              <Link onClick={() => handleDownload(file.fileName)}>Decrypt</Link>
              <br></br><br></br>
              <center>
              {decryptedBlob && (
                <div>
                  <a href={URL.createObjectURL(decryptedBlob)} download="decrypted_file">
                    Download
                  </a>
                </div>
              )}
              </center>
            </div>
          ))
        ) : (
          <p>No public files available</p>
        )}
    
    </div>
  );
};

export default Publicfiles;
