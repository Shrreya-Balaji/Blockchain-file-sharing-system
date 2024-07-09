import React, { useState, useEffect } from 'react';
import { Navigation } from "./navigation";
import { useLocation } from 'react-router-dom';
import ContractABI from "./abii.json"; // Import your contract ABI
import Web3 from 'web3'; // Import Web3 library
import axios from 'axios'; // Import Axios library

const Sharefile = () => {
  const [fileDetails, setFileDetails] = useState(null);
  const [Repaddr, setRepaddr] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fileName = searchParams.get('fileName'); // Retrieve fileName from URL query string
  const web3 = new Web3(window.ethereum); // Initialize Web3 with your Ethereum node address
  const contractAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'; // Replace with your contract address
  const contract = new web3.eth.Contract(ContractABI, contractAddress); // Create contract instance

  useEffect(() => {
    if (fileName) { // Check if fileName exists
      fetchFileDetails(fileName); // Pass fileName to fetchFileDetails
    }
  }, [fileName]); // Fetch file details when fileName changes

  const fetchFileDetails = async (fileName) => {
    try {
      // Get available accounts
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0]; // Assuming the first account is the owner

      // Call the contract function to get file details
      const fileDetailsResult = await contract.methods.getFileDetails(owner, fileName).call({ from: owner });

      console.log(fileDetailsResult)

      // Convert the numerical keys to an array of values
      const fileDetailsArray = Object.values(fileDetailsResult);

      // Create an object with meaningful keys
      const fileDetailsObject = {
        fileId: fileDetailsArray[0],
        encryptionKey: fileDetailsArray[1],
        chunkHashes: fileDetailsArray[2],
        fileType: fileDetailsArray[3],
        fileOwner: fileDetailsArray[4]
      };

      // Set the file details state with the fetched data
      setFileDetails(fileDetailsObject);
    } catch (error) {
      alert('File details are not available.');
      console.error('Error fetching file details:', error);
    }
  };

  const handleshare = async () => {
    try {
      if (!fileDetails) {
        alert('File details are not available.');
        console.error('File details are not available.');
        return;
      }

      if (!Repaddr) {
        alert('Please give Recipient address.');
        return;
      }
  
      // Get available accounts
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0]; // Assuming the first account is the owner
  
      // Get the recipient's Ethereum address
      const recipientAddress = Repaddr;
  
      // Call the contract function to update access and add file to recipient's contract
      await contract.methods.grantAccess(fileDetails.fileId, recipientAddress).send({ from: owner });
      await contract.methods.shareFile(fileDetails.fileId, recipientAddress).send({ from: owner });
  
      // Send recipient address to the server to send a notification
      const message="\nFile Id : "+fileDetails.fileId+"\nOwner : "+owner+"\nDecryption Key : "+fileDetails.encryptionKey
      const response = await axios.post('http://localhost:5000/send-notification', { recipientAddress,message });

      //new contract import 
      //call the method sendMessage(recipientAddress,fileDetails.fileId,owner,fileDetails.encryptionKey)

      // If successful, you may want to display a success message or update the UI accordingly
      setUploadStatus('File shared successfully with recipient: ' + recipientAddress);
      console.log('File shared successfully with recipient:', recipientAddress);
    } catch (error) {
      alert('Please give correct recipient address.');

      console.error('Error sharing file with recipient:', error);
      // Handle errors here, display an error message, etc.
    }
  };
  
  

  return (
    <div>
      <Navigation />
      <h1>File Details</h1>
      {fileDetails ? (
        <div>
          <p>File ID: {fileDetails.fileId}</p>
          <p>File Name: {fileName}</p>
          <p>Chunk Hashes:</p>
          <ul>
            {fileDetails.chunkHashes.map((hash, index) => (
              <li key={index}>{hash}</li>
            ))}
          </ul>
          <p>Encryption Key: {fileDetails.encryptionKey}</p>
          <p>File Type: {fileDetails.fileType}</p>
          <p>File Owner: {fileDetails.fileOwner}</p>
          <center>
          <label>Enter Address of Recipient : </label>
          <input type="text" onChange={(e) => setRepaddr(e.target.value)} value={Repaddr} />
          <br /><br />
          <button onClick={handleshare} className="btn1">Share</button>
          {uploadStatus && <p>{uploadStatus}</p>}
        </center>
        </div>
      ) : (
        <p>Loading file details...</p>
      )}
    </div>
  );
};

export default Sharefile;
