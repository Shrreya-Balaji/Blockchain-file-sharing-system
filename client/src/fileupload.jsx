import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Web3 from 'web3'; 
import ContractABI from "./abii.json";
import { Navigation } from "./navigation";

const FileUploader = () => {
  const [filename, setfilename] = useState('');
  const [filetype, setfiletype] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [s3ObjectHashes, setS3ObjectHashes] = useState([]);
  const [transactionhash, settransactionhash] = useState('');
  const navigate = useNavigate();

  const handleFileInputChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      alert('Please select a file.');
      return;
    }

    if (!filename) {
      alert('Please give the file name.');
      return;
    }

    if (!filetype) {
      alert('Please select a file type.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    const confirmUpload = window.confirm("Are you sure to upload file " + filename + " as " + filetype + "?");

    if (confirmUpload) {
      try {
        const response = await axios.post('http://localhost:5000/upload', formData);
        const { key, s3ObjectHashes } = response.data;
        setEncryptionKey(key);
        setS3ObjectHashes(s3ObjectHashes);

        // Contract interaction
        const web3 = new Web3(window.ethereum); // Initialize Web3 with your Ethereum node address
        const contractAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'; // Replace with your contract address
        const contract = new web3.eth.Contract(ContractABI, contractAddress); // Create contract instance

        const accounts = await web3.eth.getAccounts(); // Get available accounts
        const owner = accounts[0]; // Assuming the first account is the owner

        // Call the contract function to upload file chunks
        // Call the contract function to upload file chunks
        // Convert each string in s3ObjectHashes array to hexadecimal format
        const hexS3ObjectHashes = s3ObjectHashes.map(hash => '0x' + hash);

        // Call the contract function with the converted values
        const transaction = await contract.methods.uploadFileChunks(key, hexS3ObjectHashes, filename, filetype, owner).send({ from: owner });
        const transactionHash = transaction.transactionHash;
        settransactionhash(transactionHash);
        console.log('Transaction Hash:', transactionHash);
      } catch (error) {
        console.error('Error occurred:', error);
      }
    }
  };

  

  return (
    <div>
      <Navigation />
      <h1>Upload your File</h1>
      <center>
        <div class="upload">
          <label class="label">File Name:
            <input type="text" className="input-box" value={filename} onChange={(e) => setfilename(e.target.value)} /> </label>
          <label className="label">File Type:
            <select className="input-box" onChange={(e) => setfiletype(e.target.value)}>
              <option value="Public File">Public File</option>
              <option value="Private File">Private File</option>
              <option value="Premium File">Premium File</option>
            </select>
          </label>
          <input class="" type="file" onChange={handleFileInputChange} />
          <button class="btn1" onClick={uploadFile}>Upload File</button>
          {encryptionKey && <div><p class="success">Your File is Uploaded Successfully !!!!</p><br></br>Encryption Key: {encryptionKey}<br></br><br></br>Transaction Hash: {transactionhash}</div>}
          
        </div>
      </center>
    </div>
  );
};

export default FileUploader;
