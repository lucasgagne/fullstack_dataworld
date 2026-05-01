import { useEffect, useState } from 'react';
import { auth } from "../firebase";

const Home = ({ apiBase }) => {
  const [backendUid, setBackendUid] = useState("Verifying with Backend...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyWithBackend = async () => {
      try {
        // 1. Get the current user's ID token from Firebase
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const token = await currentUser.getIdToken();

        // 2. Send the token to Flask for verification
        const res = await fetch(`${apiBase}/api/user-status`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!res.ok) throw new Error("Failed to verify token with backend");

        const data = await res.json();
        
        // 3. Set the UID returned by the backend to prove it worked
        setBackendUid(data.uid);
      } catch (err) {
        console.error("Auth Verification Error:", err);
        setError("Could not verify identity with backend.");
        setBackendUid("Verification Failed");
      }
    };

    verifyWithBackend();
  }, [apiBase]);

  return (
    <div style={containerStyle}>
      <h1 style={{ color: '#2c3e50' }}>Welcome to DataWorld 🏠</h1>
      
      <div style={statusCardStyle}>
        <h3>Backend Connection Test</h3>
        <p style={{ fontSize: '18px' }}>
          Verified Firebase UID: <br />
          <strong style={{ color: '#646cff', wordBreak: 'break-all' }}>
            {backendUid}
          </strong>
        </p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div style={{ marginTop: '30px', color: '#666' }}>
        <p>You are now securely logged in. Your frontend is talking to Firebase,</p>
        <p>and your Flask backend is verifying your "ID Card" token.</p>
      </div>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { 
  padding: '50px', 
  fontFamily: 'sans-serif', 
  textAlign: 'center' 
};

const statusCardStyle = { 
  backgroundColor: '#fff', 
  padding: '30px', 
  borderRadius: '15px', 
  border: '2px solid #646cff',
  display: 'inline-block',
  marginTop: '20px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  maxWidth: '500px'
};

export default Home;

// import React, { useState } from 'react';
// // Update the top of your Home component
// const Home = ({ apiBase }) => {  // <--- Add apiBase here inside the curly braces
//   const [backendMessage, setBackendMessage] = useState("");
//   const [welcomeMessage, setWelcomeMessage] = useState("");
//   const [nameInput, setNameInput] = useState("");

//   // DELETE THIS LINE: const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  
//   // Use the prop instead
//   const API_BASE = apiBase; 

//   // ... the rest of your functions stay the same

//   const testConnection = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/`);
//       const data = await response.json();
//       setBackendMessage(data.message);
//       // setBackendMessage("wassaaaapppp");
//     } catch (err) {
//       console.error(err);
//       setBackendMessage("Failed to connect to Python backend ❌");
//     }
//   };

//   // 2. Input-based Connection Test
//   const testWelcome = async () => {
//     if (!nameInput) return alert("Please enter a name first!");
    
//     try {
//       // Sending the name as a URL parameter
//       const response = await fetch(`${API_BASE}/welcome/${nameInput}`);
//       const data = await response.json();
//       setWelcomeMessage(data.message);
//     } catch (err) {
//       setWelcomeMessage("Backend couldn't find you ❌");
//     }
//   };

//   return (
//     <div style={{ padding: '40px' }}>
//       <h1>🏠 Welcome to DataWorld</h1>
//       <p>This is your central command center. Use the sidebar to navigate through your global metrics and financial plans.</p>
      
//       <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
//         <h3>System Status</h3>
//         <p style={{ color: 'green' }}>● All systems operational</p>
        
//         {/* Connection Button */}
//         <button 
//           onClick={testConnection}
//           style={{
//             marginTop: '10px',
//             padding: '10px 15px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '5px',
//             cursor: 'pointer',
//             fontWeight: 'bold'
//           }}
//         >
//           Test Backend Connection
//         </button>
        
//         {/* Button 2: Name Input Test */}
//         <input 
//             type="text" 
//             placeholder="Enter your name" 
//             value={nameInput}
//             onChange={(e) => setNameInput(e.target.value)}
//             style={inputStyle}
//           />
//         <button onClick={testWelcome} style={{ backgroundColor: '#28a745' }}>
//             Get Personalized Welcome
//           </button>

//         {/* Display message from Python if it exists */}
//         {backendMessage && (
//           <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#555' }}>
//             Backend says: {backendMessage}
//           </p>
//         )}
//         {welcomeMessage && (
//           <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#555' }}>
//             Backend says: {welcomeMessage}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// // Simple Styles
// const buttonStyle = {
//     padding: '10px 15px',
//     backgroundColor: '#007bff',
//     color: 'white',
//     border: 'none',
//     borderRadius: '5px',
//     cursor: 'pointer',
//     fontWeight: 'bold'
//   };
  
//   const inputStyle = {
//     padding: '10px',
//     borderRadius: '5px',
//     border: '1px solid #ccc',
//     fontSize: '14px'
//   };
  
//   const msgStyle = { 
//     fontSize: '14px', 
//     fontWeight: 'bold', 
//     color: '#555', 
//     margin: '5px 0' 
//   };

// export default Home;
