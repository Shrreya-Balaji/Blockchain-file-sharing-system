import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from './navigation';
import ContractABI from './abii.json'; 
import Web3 from 'web3';
import './App.css';

const Activitylog = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fileid = searchParams.get('fileId');
  const web3 = new Web3(window.ethereum); 
  const contractAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'; 
  const contract = new web3.eth.Contract(ContractABI, contractAddress);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const accounts = await web3.eth.getAccounts();
        const owner = accounts[0]; 

        // Subscribe to file-related events
        contract.events.allEvents({ filter: { fileId: fileid } })
          .on('data', event => {
            // Update transaction history with the new transaction
            setTransactionHistory(prevHistory => [...prevHistory, event]);
          })
          .on('error', console.error);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      }
    };

    if (fileid) {
      fetchTransactionHistory();
    }
  }, [fileid]);

  return (
    <div>
      <Navigation />
      <h1>Activity Log</h1>
      <center className="files">
        <h2>File ID: {fileid}</h2>
        <h3>Transaction History:</h3>
        {transactionHistory.length > 0 ? (
          <ul>
            {transactionHistory.map((event, index) => (
              <li key={index}>{JSON.stringify(event)}</li>
            ))}
          </ul>
        ) : (
          <p>No transaction history found.</p>
        )}
      </center>
    </div>
  );
};

export default Activitylog;
