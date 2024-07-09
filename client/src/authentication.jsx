import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Web3 from 'web3';
import Home from './home'; 
import contractABI from "./abi.json";



const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);


  const [navigate, setNavigate] = useState(null);

  const [connectedAccount, setConnectedAccount] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          const newWeb3 = new Web3(window.ethereum);
          const newContract = new newWeb3.eth.Contract(contractABI, "0xe270F382e3AA0B07f6a962014700AC2Cb64c91e9");
          setWeb3(newWeb3);
          setContract(newContract);
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      } else {
        console.error("No web3 provider detected");
        document.getElementById("connectMessage").innerText =
          "No web3 provider detected. Please install MetaMask.";
      }
    };

    initializeWeb3();
  }, []);

  const connectWallet = async () => {
    if (web3) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setConnectedAccount(accounts[0]);
        console.log("Connected account:", accounts[0]);
      } catch (err) {
        if (err.code === 4001) {
          console.log("Please connect to MetaMask.");
        } else {
          console.error(err);
        }
      }
    }
  };


  useEffect(() => {
    // Initialize web3
    const initWeb3 = async () => {
      if (window.ethereum) {
        const newWeb3 = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.enable();
          setWeb3(newWeb3);
          const accounts = await newWeb3.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.error('User denied account access');
        }
      } else if (window.web3) {
        // Legacy dapp browsers
        const newWeb3 = new Web3(window.web3.currentProvider);
        setWeb3(newWeb3);
        const accounts = await newWeb3.eth.getAccounts();
        setAccount(accounts[0]);
      } else {
        console.error('No Ethereum browser extension detected, install MetaMask');
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    // Initialize contract
    const initContract = () => {
      if (web3) {
        const contractAddress = '0x7566EA0d3603520775194b3088D9108e36e9BB04'; 
        const newContract = new web3.eth.Contract(contractABI, contractAddress);
        setContract(newContract);
      }
    };

    initContract();
  }, [web3]);

  const handleRegister = async () => {
    if (contract && account) {
      try {
        await contract.methods.register(username, password).send({ from: account });
        setRegistrationSuccess(true);
      } catch (error) {
        console.error('Error registering user:', error.message);
      }
    }
  };

  const handleLogin = async () => {
    if (contract && account) {
      try {
        await contract.methods.login(username, password).send({ from: account });
        setLoginSuccess(true);
        setNavigate('/home');
      } catch (error) {
        console.error('Error logging in:', error.message);
      }
    }
  };

  return (
    <div>
        <h1>FILE STORING AND SHARING DAPP</h1>
        <div className="connect">
          <button id="connectWalletBtn" onClick={connectWallet}>Connect Wallet</button>
          <div id="userAddress">Connected: {connectedAccount}</div>
        </div>
        <br></br>
      <center>

       <div class="section">
      <div>
        <label class="label">Username:</label>
        <input type="text" className="input-box" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label class="label">Password:</label>
        <input type="password" className="input-box" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn1" onClick={handleRegister}>Register</button>
      <button className="btn1" onClick={handleLogin}>Login</button>
      <br></br>
      {registrationSuccess && <p>User registered successfully!</p>}
      </div>
      </center>
      
      <Routes>
        <Route path="/home" element={<Home />} />
      </Routes>
{navigate && <Navigate to={navigate} />}
    </div>
  );
};

export default App;
