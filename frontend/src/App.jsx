import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Login from './pages/login'; // Make sure the path matches your folder

// --- 1. FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyB5Fks8PSo_4k3q0jany0BI6ereRNl6-U0",
  authDomain: "dataworld-a4afa.firebaseapp.com",
  projectId: "dataworld-a4afa",
  storageBucket: "dataworld-a4afa.firebasestorage.app",
  messagingSenderId: "858436173058",
  appId: "1:858436173058:web:ea37ea24eaf680398cd61b"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://127.0.0.1:5000'                      
  : 'https://dataworld-mfya.onrender.com';       

// --- 2. MODULAR COMPONENT ---
const PageShell = ({ title, apiEndpoint }) => {
  const [data, setData] = useState("Click the button to load data...");

  const handleCallPython = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${apiEndpoint}`);
      const result = await res.json();
      setData(result.message);
    } catch (err) {
      setData("Error calling Python!");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>{title}</h1>
      <button onClick={handleCallPython} style={btnStyle}>Run {title} Function</button>
      <div style={msgBoxStyle}><h3>{data}</h3></div>
    </div>
  );
};

// --- 3. MAIN APP ---
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        
        {/* Only show sidebar if user is logged in */}
        {user && (
          <nav style={sidebarStyle}>
            <h2 style={{ color: 'white' }}>DataWorld</h2>
            <Link to="/" style={linkStyle}>🏠 Home</Link>
            <Link to="/world" style={linkStyle}>🌍 World Data</Link>
            <Link to="/finance" style={linkStyle}>💰 Financial Plan</Link>
            <button onClick={() => auth.signOut()} style={{marginTop: '20px'}}>Logout</button>
          </nav>
        )}

        <main style={{ flex: 1, backgroundColor: '#f4f7f6' }}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            
            {/* Protected Routes */}
            <Route path="/" element={user ? <PageShell title="Home" apiEndpoint="/" /> : <Navigate to="/login" />} />
            <Route path="/world" element={user ? <PageShell title="World Data" apiEndpoint="/world" /> : <Navigate to="/login" />} />
            <Route path="/finance" element={user ? <PageShell title="Financial Plan" apiEndpoint="/finance" /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Keep your styles (sidebarStyle, linkStyle, etc.) here...


const sidebarStyle = { 
  width: '250px', 
  backgroundColor: '#2c3e50', 
  padding: '20px', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '10px',
  height: '100vh',        // Takes full height of the screen
  position: 'sticky',     // Stays put even if you scroll the content
  top: 0,                 // Sticks to the very top
  left: 0,                // Sticks to the very left
  boxSizing: 'border-box' // Ensures padding doesn't push the width past 250px
};
const linkStyle = { 
  color: '#ecf0f1', 
  textDecoration: 'none', 
  fontSize: '18px', 
  padding: '12px', 
  borderRadius: '5px'
};

const btnStyle = { 
  padding: '12px 24px', 
  backgroundColor: '#646cff', 
  color: 'white', 
  border: 'none', 
  borderRadius: '5px',
  cursor: 'pointer'
};

const msgBoxStyle = { 
  marginTop: '20px', 
  padding: '20px', 
  border: '2px solid #646cff', 
  borderRadius: (10),
  backgroundColor: 'white'
};
export default App;