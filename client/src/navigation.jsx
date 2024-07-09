import React from "react";
import { useNavigate } from 'react-router-dom';


export const Navigation = (props) => {
  const navigate = useNavigate();
  function notification()
  {
    navigate("/notification")
  }
  function logout()
  {
    navigate("/")
  }

  return (
    <nav>
        <h1 class="title">FILE STORING & SHARING DAPP</h1>
  <div class="container">
    <ul class="menu">
      <li><a href="/home">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/uploadedfiles">Uploaded Files</a></li>
      {/*<li><a href="/uploadedfiles">Activity Log</a></li>*/}
      <li><a href="/viewsharedfile">View Shared File</a></li>
    </ul>
    <button class="btn1" onClick={notification}>Notification</button>
  </div>
  <button class="btn2" onClick={logout}>Logout</button>
</nav>

  );
};
