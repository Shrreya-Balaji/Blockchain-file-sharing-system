import React, { useState, useEffect } from 'react';
import { Navigation } from "./navigation";
import ContractABI from "./abii.json"; // Import your contract ABI
import Web3 from 'web3'; // Import Web3 library
import axios from 'axios'; // Import axios for HTTP requests

const Viewsharedfile = () => {
  const [fileId, setFileId] = useState('');
  const [owner, setOwner] = useState('');
  const [userKey, setUserKey] = useState('');
  const [decryptedBlob, setDecryptedBlob] = useState(null);
  const [chunkHashes, setChunkHashes] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);

  const web3 = new Web3(window.ethereum); // Initialize Web3 with your Ethereum node address
  const contractAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'; // Replace with your contract address
  const contract = new web3.eth.Contract(ContractABI, contractAddress); // Create contract instance

  const checkAccess = async () => {
    try {
      if (!fileId || !owner) {
        alert('Please enter File ID and Owner Address.');
        return;
      }

      // Get available accounts
      const accounts = await web3.eth.getAccounts();
      const user = accounts[0]; // Assuming the first account is the user

      // Call the contract function to check if the user has access to the file
      const access = await contract.methods.hasAccess(fileId, user).call({ from: user });

      console.log(access);
      setHasAccess(access);

      // Navigate after setting hasAccess
      if (access) {
        const cleanedFileId = fileId.replace(/^0x/, ''); // Remove "0x" prefix if present
        const fileIdBytes32 = '0x' + cleanedFileId.padEnd(64, '0'); // Pad fileId to 64 characters
        await fetchChunkHashes(fileIdBytes32);
      } else {
        alert('You do not have access to view this file.');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  const fetchChunkHashes = async (fileIdBytes32) => {
    try {
      const chunkHashesResult = await contract.methods.getFileChunkHashes(fileIdBytes32).call({from:owner});
      // Remove "0x" prefix from each chunk hash
      const cleanedChunkHashes = chunkHashesResult.map(hash => hash.replace(/^0x/, ''));
      setChunkHashes(cleanedChunkHashes);
      console.log('Chunk Hashes:', cleanedChunkHashes); // Log the chunk hashes
      //console.log(cleanedChunkHashes);
      
    } catch (error) {
      console.error('Error fetching chunk hashes:', error);
    }
  };

  useEffect(() => {
    if (userKey && chunkHashes.length > 0) {
      handleDecryption();
    }
  }, [userKey, chunkHashes]);

  const handleDecryption = async () => {
    try {
      if (userKey && chunkHashes.length > 0) {
        const response = await axios.post('http://localhost:5000/decrypt', {
          chunkHashes: chunkHashes,
          userKey: userKey,
        });

        if (response.data && typeof response.data === 'string') {
          // Set the decrypted data blob
          setDecryptedBlob(new Blob([response.data], { type: 'text/plain' }));
        } else {
          alert("No data for Decryption.")
          console.error('No decrypted data found in response:', response);
        }
      } else {
        alert("Key or chunk hashes missing for decryption.")
        console.error('Key or chunk hashes missing for decryption.');
      }
    } catch (error) {
      alert("Please give Correct Decryption Key or File not found")
      console.error('Error decrypting file:', error);
    }
  };

  return (
    <div>
      <Navigation />
      <h1>View Shared File</h1>
      <center>
        <label>Enter Your File ID :</label>
        <input type="text" onChange={(e) => setFileId(e.target.value)} value={fileId} />
        <br /><br />
        <label>Enter Owner Address :</label>
        <input type="text" onChange={(e) => setOwner(e.target.value)} value={owner} />
        <br /><br />
        <label>Enter Decryption Key :</label>
        <input type="text" onChange={(e) => setUserKey(e.target.value)} value={userKey} />
        <br /><br />
        <button onClick={checkAccess} className="btn1">View File</button>
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
      </center>
    </div>
  );
};

export default Viewsharedfile;
