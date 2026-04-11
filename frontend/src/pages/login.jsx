import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = async () => {
    const auth = getAuth();
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
    </div>
  );
};

// Add these basic styles so it's not ugly
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const loginBtnStyle = { padding: '10px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };

// CRITICAL FIX: You must export it!
export default Login;