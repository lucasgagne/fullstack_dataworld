// import { useState } from 'react';

// const WorldData = ({ apiBase }) => {
//   const [data, setData] = useState("");
  
//   const fetchData = async () => {
//     const res = await fetch(`${apiBase}/world`);
//     const result = await res.json();
//     setData(result.message);
//   };

//   return (
//     <div style={{ padding: '40px' }}>
//       <h1>World Data Center</h1>
//       <button onClick={fetchData}>Load Global Metrics</button>
//       <p>{data}</p>
//     </div>
//   );
// };

// export default WorldData;

import { useState } from 'react';
import { auth } from "../firebase"; // Need this to get the token

const WorldData = ({ apiBase }) => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get the "ID Card" (Token) from Firebase
      const user = auth.currentUser;
      if (!user) {
        setData("Error: You must be logged in.");
        return;
      }
      const token = await user.getIdToken();

      // 2. Send the request with the "Authorization" header
      const res = await fetch(`${apiBase}/world`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // This matches your token_required decorator
        }
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const result = await res.json();
      setData(result.message);
    } catch (err) {
      console.error("Fetch error:", err);
      setData("Failed to connect to backend. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>World Data Center</h1>
      <button 
        onClick={fetchData} 
        disabled={loading}
        style={btnStyle}
      >
        {loading ? "Loading..." : "Load Global Metrics"}
      </button>
      
      <div style={resultBoxStyle}>
        <p>{data || "No data loaded yet. Click the button above."}</p>
      </div>
    </div>
  );
};

// Simple styles for visibility
const btnStyle = { padding: '10px 20px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const resultBoxStyle = { marginTop: '20px', padding: '15px', background: '#eee', borderRadius: '8px', minHeight: '50px' };

export default WorldData;