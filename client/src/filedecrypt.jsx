import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigation } from "./navigation";
import { useLocation } from 'react-router-dom';
import ContractABI from "./abii.json"; // Import your contract ABI
import Web3 from 'web3'; // Import Web3 library

const FileDecrypt = () => {
  const [decryptedBlob, setDecryptedBlob] = useState(null);
  const [userKey, setUserKey] = useState('');
  const [chunkHashes, setChunkHashes] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fileIdParam = searchParams.get('fileId');
  const web3 = new Web3(window.ethereum); // Initialize Web3 with your Ethereum node address
  const contractAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'; // Replace with your contract address
  const contract = new web3.eth.Contract(ContractABI, contractAddress); // Create contract instance

  useEffect(() => {
    if (fileIdParam) {
      const cleanedFileId = fileIdParam.replace(/^0x/, ''); // Remove "0x" prefix if present
      const fileIdBytes32 = '0x' + cleanedFileId.padEnd(64, '0'); // Pad fileId to 64 characters
      fetchChunkHashes(fileIdBytes32);
    }
  }, [fileIdParam]); // Fetch chunk hashes when fileIdParam changes

  const fetchChunkHashes = async (fileIdBytes32) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];
      const chunkHashesResult = await contract.methods.getFileChunkHashes(fileIdBytes32).call({from:owner});
      // Remove "0x" prefix from each chunk hash
      const cleanedChunkHashes = chunkHashesResult.map(hash => hash.replace(/^0x/, ''));
      setChunkHashes(cleanedChunkHashes);
      //console.log(cleanedChunkHashes);
    } catch (error) {
      console.error('Error fetching chunk hashes:', error);
    }
  };

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
      <h1>Decryption Page</h1>
      <div>
        <center>
          <label>Enter Decryption Key:</label>
          <input type="text" onChange={(e) => setUserKey(e.target.value)} value={userKey} />
          <br /><br />
          <button onClick={handleDecryption} className="btn1">Decrypt</button>
        </center>
      </div>
      <center>
        {decryptedBlob && (
          <div>
            <h3>Decrypted File:</h3>
            <a href={URL.createObjectURL(decryptedBlob)} download="decrypted_file">
              Download Decrypted File
            </a>
          </div>
        )}
      </center>
    </div>
  );
};

export default FileDecrypt;
