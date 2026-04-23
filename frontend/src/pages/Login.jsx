import { useState } from "react";
import { auth } from "../firebase"; // Adjust path based on folder depth
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from 'react-router-dom';


const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pw);
      const token = await userCredential.user.getIdToken();
      // If you are using the onAuthStateChanged logic in App.jsx, 
      // you don't strictly need setToken here, but it doesn't hurt.
      alert("Logged in!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Login to DataWorld</h2>
      <div style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '0 auto', gap: '10px' }}>
        <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        <input type="password" onChange={(e) => setPw(e.target.value)} placeholder="Password" style={inputStyle} />
        <button onClick={handleLogin} style={loginBtnStyle}>Login</button>
      
      </div>
      
      
      {/* This empty div creates the gap you need */}
<div style={{ height: '20px' }}></div>

<Link to="/Signup" style={loginBtnStyle}>
  No account? Create one BRO
</Link>
    
    </div>
    
    
  );
};

// Add these basic styles so it's not ugly
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const loginBtnStyle = { padding: '10px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };

// CRITICAL FIX: You must export it!
export default Login;