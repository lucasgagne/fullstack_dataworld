import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; 

// Component Imports
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import FinancialPlan from './pages/FinancialPlan';
import WorldData from './pages/WorldData';
import Login from './pages/Login';
import Signup from './pages/Signup';

// 1. API Configuration - Points to local Flask or Render production
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://127.0.0.1:5001'                      
  : 'https://dataworld-mfya.onrender.com';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. The Auth Listener: Keeps track of if someone is logged into Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Loading DataWorld...</h2>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex', margin: 0, padding: 0, minHeight: '100vh' }}>
        
        {/* 3. Sidebar: Only shows if a user is logged in */}
        {user && <Sidebar />}

        <main style={{ flex: 1, backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
          <Routes>
            {/* PUBLIC ROUTES: Redirect to Home if already logged in */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/signup" />} />

            {/* PRIVATE ROUTES: All passing the apiBase prop for backend calls */}
            <Route 
              path="/" 
              element={user ? <Home apiBase={API_BASE_URL} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/world" 
              element={user ? <WorldData apiBase={API_BASE_URL} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/finance" 
              element={user ? <FinancialPlan apiBase={API_BASE_URL} /> : <Navigate to="/login" />} 
            />
            
            {/* CATCH-ALL: Back to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;