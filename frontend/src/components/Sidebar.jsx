import { Link } from 'react-router-dom';
import { getAuth } from "firebase/auth";

const Sidebar = () => {
  const auth = getAuth();

  return (
    <nav style={sidebarStyle}>
      <h2 style={{ color: 'white', marginBottom: '30px' }}>DataWorld</h2>
      <Link to="/" style={linkStyle}>🏠 Home</Link>
      <Link to="/world" style={linkStyle}>🌍 World Data</Link>
      <Link to="/finance" style={linkStyle}>💰 Financial Plan</Link>
      <button 
        onClick={() => auth.signOut()} 
        style={{marginTop: 'auto', padding: '10px', cursor: 'pointer'}}
      >
        Logout
      </button>
    </nav>
  );
};

// Paste your styles here or move them to a styles.js file
const sidebarStyle = { width: '250px', backgroundColor: '#2c3e50', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100vh' };
const linkStyle = { color: '#ecf0f1', textDecoration: 'none', padding: '10px' };

export default Sidebar;