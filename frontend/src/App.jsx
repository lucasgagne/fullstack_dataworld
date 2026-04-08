import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// 1. CONFIGURATION: Define the URL switch outside the component
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://127.0.0.1:5000'                      
  : 'https://dataworld-mfya.onrender.com';       

// 2. MODULAR COMPONENT: The reusable Page view
const PageShell = ({ title, apiEndpoint }) => {
  const [data, setData] = useState("Click the button to load data...");

  const handleCallPython = async () => {
    try {
      // Combines the Base URL (Local/Prod) with the specific endpoint (/world, /finance, etc.)
      const res = await fetch(`${API_BASE_URL}${apiEndpoint}`);
      const result = await res.json();
      setData(result.message);
    } catch (err) {
      setData("Error calling Python! Make sure your backend is running.");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>{title}</h1>
      <p>Status: Connected to {API_BASE_URL}</p>
      <button onClick={handleCallPython} style={btnStyle}>
        Run {title} Function
      </button>
      <div style={msgBoxStyle}>
        <h3 style={{ color: '#646cff', margin: 0 }}>{data}</h3>
      </div>
    </div>
  );
};

// 3. MAIN APP COMPONENT
function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        
        {/* SIDEBAR NAVIGATION */}
        <nav style={sidebarStyle}>
          <h2 style={{ color: 'white', marginBottom: '30px' }}>DataWorld</h2>
          <Link to="/" style={linkStyle}>🏠 Home</Link>
          <Link to="/world" style={linkStyle}>🌍 World Data</Link>
          <Link to="/finance" style={linkStyle}>💰 Financial Plan</Link>
        </nav>

        {/* DYNAMIC CONTENT AREA */}
        <main style={{ flex: 1, backgroundColor: '#f4f7f6' }}>
          <Routes>
            {/* Each route passes a different endpoint to the same modular PageShell */}
            <Route path="/" element={<PageShell title="Home" apiEndpoint="/" />} />
            <Route path="/world" element={<PageShell title="World Data" apiEndpoint="/world" />} />
            <Route path="/finance" element={<PageShell title="Financial Plan" apiEndpoint="/finance" />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

// --- STYLES ---
const sidebarStyle = { 
  width: '250px', 
  backgroundColor: '#2c3e50', 
  padding: '20px', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '10px' 
};

const linkStyle = { 
  color: '#ecf0f1', 
  textDecoration: 'none', 
  fontSize: '18px', 
  padding: '12px', 
  borderRadius: '5px',
  transition: 'background 0.3s'
};

const btnStyle = { 
  padding: '12px 24px', 
  fontSize: '16px', 
  cursor: 'pointer', 
  backgroundColor: '#646cff', 
  color: 'white', 
  border: 'none', 
  borderRadius: '5px',
  fontWeight: 'bold'
};

const msgBoxStyle = { 
  marginTop: '20px', 
  padding: '20px', 
  border: '2px solid #646cff', 
  display: 'inline-block', 
  borderRadius: '10px',
  backgroundColor: 'white',
  minWidth: '300px'
};

export default App;