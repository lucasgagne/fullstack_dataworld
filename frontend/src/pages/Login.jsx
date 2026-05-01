import { useState } from "react";
import { auth } from "../firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Proof of concept: Get the token (App.jsx listener will handle the redirect)
      const token = await userCredential.user.getIdToken();
      console.log("Logged in! Token acquired.");
      
      // Navigate to home page after successful login
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#2c3e50' }}>Login to DataWorld</h2>
      
      <form onSubmit={handleLogin} style={formStyle}>
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          style={inputStyle} 
          required
        />
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          style={inputStyle} 
          required
        />
        
        <button type="submit" style={loginBtnStyle}>
          Login
        </button>
      </form>
      
      <div style={{ height: '20px' }}></div>

      <Link to="/signup" style={{ color: '#646cff', textDecoration: 'none' }}>
        No account? Create one BRO
      </Link>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { 
  padding: '100px 20px', 
  textAlign: 'center', 
  fontFamily: 'sans-serif' 
};

const formStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  width: '300px', 
  margin: '0 auto', 
  gap: '15px' 
};

const inputStyle = { 
  padding: '12px', 
  borderRadius: '8px', 
  border: '1px solid #ddd',
  fontSize: '16px'
};

const loginBtnStyle = { 
  padding: '12px', 
  backgroundColor: '#646cff', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold'
};

export default Login;