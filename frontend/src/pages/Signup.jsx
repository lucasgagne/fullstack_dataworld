import { useState } from "react";
import { auth } from "../firebase"; // Adjust path based on folder depth
import { createUserWithEmailAndPassword } from "firebase/auth";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, pw);
      alert("Account created and logged in!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h2>Create DataWorld Account</h2>
      <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" onChange={(e) => setPw(e.target.value)} placeholder="Password" />
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
};

export default Signup;