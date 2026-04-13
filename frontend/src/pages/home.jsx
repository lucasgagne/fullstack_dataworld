



// const Home = () => {
//     return (
//       <div style={{ padding: '40px' }}>
//         <h1>🏠 Welcome to DataWorld</h1>
//         <p>This is your central command center. Use the sidebar to navigate through your global metrics and financial plans.</p>
//         <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
//           <h3>System Status</h3>
//           <p style={{ color: 'green' }}>● All systems operational</p>
//         </div>
//       </div>
//     );
//   };
  
//   export default Home;

import React, { useState } from 'react';

const Home = () => {
  const [backendMessage, setBackendMessage] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [nameInput, setNameInput] = useState("");

  // Get the URL from environment variables or default to local for dev
  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/`);
      const data = await response.json();
      setBackendMessage(data.message);
      // setBackendMessage("wassaaaapppp");
    } catch (err) {
      console.error(err);
      setBackendMessage("Failed to connect to Python backend ❌");
    }
  };

  // 2. Input-based Connection Test
  const testWelcome = async () => {
    if (!nameInput) return alert("Please enter a name first!");
    
    try {
      // Sending the name as a URL parameter
      const response = await fetch(`${API_BASE}/welcome/${nameInput}`);
      const data = await response.json();
      setWelcomeMessage(data.message);
    } catch (err) {
      setWelcomeMessage("Backend couldn't find you ❌");
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>🏠 Welcome to DataWorld</h1>
      <p>This is your central command center. Use the sidebar to navigate through your global metrics and financial plans.</p>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>System Status</h3>
        <p style={{ color: 'green' }}>● All systems operational</p>
        
        {/* Connection Button */}
        <button 
          onClick={testConnection}
          style={{
            marginTop: '10px',
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Test Backend Connection
        </button>
        
        {/* Button 2: Name Input Test */}
        <input 
            type="text" 
            placeholder="Enter your name" 
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            style={inputStyle}
          />
        <button onClick={testWelcome} style={{ backgroundColor: '#28a745' }}>
            Get Personalized Welcome
          </button>

        {/* Display message from Python if it exists */}
        {backendMessage && (
          <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#555' }}>
            Backend says: {backendMessage}
          </p>
        )}
        {welcomeMessage && (
          <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#555' }}>
            Backend says: {welcomeMessage}
          </p>
        )}
      </div>
    </div>
  );
};

// Simple Styles
const buttonStyle = {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };
  
  const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };
  
  const msgStyle = { 
    fontSize: '14px', 
    fontWeight: 'bold', 
    color: '#555', 
    margin: '5px 0' 
  };

export default Home;
