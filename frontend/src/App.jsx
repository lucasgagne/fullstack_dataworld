import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Remove: import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // Import the initialized auth from your new file

// 1. Component Imports
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import FinancialPlan from './pages/FinancialPlan';
import WorldData from './pages/WorldData';
import Login from './pages/Login';
import Signup from './pages/Signup';

// 2. CONFIGURATION: This was missing!
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://127.0.0.1:5000'                      
  : 'https://dataworld-mfya.onrender.com';

function App() {
  // 3. AUTH LOGIC: Replacing the "useAuthStatus" placeholder
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const auth = getAuth(); Removing this since auth is now imported at the top

    // This listens to Firebase to see if a user is logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: '50px' }}>Loading DataWorld...</div>;

  return (
    <Router>
      <div style={{ display: 'flex', margin: 0, padding: 0, minHeight: '100vh' }}>
        
        {/* Sidebar only shows if user exists */}
        {user && <Sidebar />}

        <main style={{ flex: 1, backgroundColor: '#f4f7f6' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/signup" />} />

            {/* Private Routes - Passing the apiBase prop */}
            <Route path="/" element={user ? <Home apiBase={API_BASE_URL} /> : <Navigate to="/login" />} />
            <Route path="/world" element={user ? <WorldData apiBase={API_BASE_URL} /> : <Navigate to="/login" />} />
            <Route path="/finance" element={user ? <FinancialPlan apiBase={API_BASE_URL} /> : <Navigate to="/login" />} />
            
            # Catch-all: Redirect unknown URLs to Home
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;