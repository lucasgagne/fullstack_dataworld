// import React, { useState, useRef, useEffect } from 'react'; // Added useEffect import

// const FinancialPlan = ({ apiBase }) => {
//   const initialGrid = [['', ''], ['', ''], ['', ''], ['', ''], ['', '']];

//   const [earningsGrid, setEarningsGrid] = useState(initialGrid);
//   const [spendingsGrid, setSpendingsGrid] = useState(initialGrid);
//   const [analysisResult, setAnalysisResult] = useState(null);
//   const [clients, setClients] = useState([]);
//   const [selectedClientId, setSelectedClientId] = useState("");

//   const earningsRef = useRef(null);
//   const spendingsRef = useRef(null);
//   const API_BASE = apiBase;

//   // 1. Fetch clients on page load
// // Inside FinancialPlan.jsx
// useEffect(() => {
//   const fetchClients = async () => {
//     // You need the logged-in user's UID here!
//     const myUid = "PASTE_YOUR_UID_HERE_FOR_NOW"; 
    
//     try {
//       // Add the ?advisor_id= part to the URL
//       const res = await fetch(`${API_BASE}/api/clients?advisor_id=${myUid}`);
//       const data = await res.json();
//       setClients(data);
//     } catch (err) {
//       console.error("Failed to load clients", err);
//     }
//   };
//   if (API_BASE) fetchClients();
// }, [API_BASE]);

//   // 2. Handle Selection
//   const handleClientSelect = (e) => {
//     const clientId = e.target.value;
//     setSelectedClientId(clientId);

//     if (clientId === "") {
//       setEarningsGrid(initialGrid);
//       setSpendingsGrid(initialGrid);
//       return;
//     }

//     const client = clients.find(c => c.id === clientId);
//     if (client && client.data) {
//       // Magic: Populate grids with saved client data
//       // We ensure it falls back to initialGrid if the saved data is missing
//       setEarningsGrid(client.data.earnings || initialGrid);
//       setSpendingsGrid(client.data.spendings || initialGrid);
//     }
//   };

//   // -----------------------------
//   // HANDLERS (Unchanged logic, just keeping it clean)
//   // -----------------------------
//   const clearTable = () => {
//     if (window.confirm("Are you sure you want to clear all data?")) {
//       setEarningsGrid(initialGrid);
//       setSpendingsGrid(initialGrid);
//       setAnalysisResult(null);
//       setSelectedClientId("");
//     }
//   };

//   const handlePasteEarnings = (e) => {
//     e.preventDefault();
//     const pasteData = e.clipboardData.getData('text');
//     const newGrid = pasteData.split(/\r?\n/).filter(row => row.trim() !== "").map(row => row.split('\t'));
//     if (newGrid.length > 0) {
//       newGrid.push(new Array(newGrid[0].length).fill(""));
//       setEarningsGrid(newGrid);
//     }
//   };

//   const handlePasteSpendings = (e) => {
//     e.preventDefault();
//     const pasteData = e.clipboardData.getData('text');
//     const newGrid = pasteData.split(/\r?\n/).filter(row => row.trim() !== "").map(row => row.split('\t'));
//     if (newGrid.length > 0) {
//       newGrid.push(new Array(newGrid[0].length).fill(""));
//       setSpendingsGrid(newGrid);
//     }
//   };

//   const handleEarningsChange = (rowIndex, colIndex, value) => {
//     const updated = earningsGrid.map((row, rIdx) => {
//       if (rIdx !== rowIndex) return row;
//       return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
//     });
//     if (rowIndex === earningsGrid.length - 1 && value !== "") {
//       updated.push(new Array(earningsGrid[0].length).fill(""));
//     }
//     setEarningsGrid(updated);
//   };

//   const handleSpendingsChange = (rowIndex, colIndex, value) => {
//     const updated = spendingsGrid.map((row, rIdx) => {
//       if (rIdx !== rowIndex) return row;
//       return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
//     });
//     if (rowIndex === spendingsGrid.length - 1 && value !== "") {
//       updated.push(new Array(spendingsGrid[0].length).fill(""));
//     }
//     setSpendingsGrid(updated);
//   };

//   const calculateAnalysis = async () => {
//     const cleanedEarnings = earningsGrid.filter(row => row.some(cell => cell.trim() !== ""));
//     const cleanedSpendings = spendingsGrid.filter(row => row.some(cell => cell.trim() !== ""));

//     if (cleanedEarnings.length === 0 || cleanedSpendings.length === 0) {
//       return alert("Please enter or paste data into BOTH grids!");
//     }

//     try {
//       const response = await fetch(`${API_BASE}/calculate`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           earnings: cleanedEarnings,
//           spendings: cleanedSpendings
//         })
//       });
//       const data = await response.json();
//       setAnalysisResult(data);
//     } catch (err) {
//       console.error(err);
//       alert("Backend error");
//     }
//   };

//   return (
//     <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
//         <h2>Financial Data Entry</h2>
//         <button onClick={clearTable} style={clearBtnStyle}>Clear Sheet</button>
//       </div>

//       <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
//         <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Load Client Profile:</label>
//         <select value={selectedClientId} onChange={handleClientSelect} style={selectStyle}>
//           <option value="">-- Create New / Manual Entry --</option>
//           {clients.map(c => (
//             <option key={c.id} value={c.id}>{c.name}</option>
//           ))}
//         </select>
//       </div>

//       <div style={{ display: 'flex', gap: '30px' }}>
//         {/* EARNINGS */}
//         <div style={{ flex: 1 }}>
//           <h3>Earnings</h3>
//           <div onPaste={handlePasteEarnings} ref={earningsRef} style={viewportStyle}>
//             <div style={headerRowStyle}>
//               <div style={headerCellStyle}>SOURCE</div>
//               <div style={headerCellStyle}>AMOUNT</div>
//             </div>
//             {earningsGrid.map((row, rIdx) => (
//               <div key={rIdx} style={{ display: 'flex' }}>
//                 {row.map((cell, cIdx) => (
//                   <input
//                     key={`${rIdx}-${cIdx}`}
//                     value={cell}
//                     onChange={(e) => handleEarningsChange(rIdx, cIdx, e.target.value)}
//                     placeholder="-"
//                     style={cellStyle}
//                   />
//                 ))}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* SPENDINGS */}
//         <div style={{ flex: 1 }}>
//           <h3>Spendings</h3>
//           <div onPaste={handlePasteSpendings} ref={spendingsRef} style={viewportStyle}>
//             <div style={headerRowStyle}>
//               <div style={headerCellStyle}>CATEGORY</div>
//               <div style={headerCellStyle}>AMOUNT</div>
//             </div>
//             {spendingsGrid.map((row, rIdx) => (
//               <div key={rIdx} style={{ display: 'flex' }}>
//                 {row.map((cell, cIdx) => (
//                   <input
//                     key={`${rIdx}-${cIdx}`}
//                     value={cell}
//                     onChange={(e) => handleSpendingsChange(rIdx, cIdx, e.target.value)}
//                     placeholder="-"
//                     style={cellStyle}
//                   />
//                 ))}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div style={{ marginTop: '20px' }}>
//         <button onClick={calculateAnalysis} style={calculateBtnStyle}>
//           Calculate Analysis
//         </button>
//       </div>

//       {analysisResult && (
//         <div style={{ marginTop: '20px' }}>
//           <h3>📊 Summary</h3>
//           <p>Monthly Savings: ${analysisResult.monthly_savings}</p>
//           <p>Yearly Savings: ${analysisResult.yearly_savings}</p>
//           <h3>🧁 Spending Breakdown</h3>
//           <img 
//             src={`data:image/png;base64,${analysisResult.pie_chart}`} 
//             alt="Pie Chart"
//             style={{ width: "300px", marginTop: "10px", borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// // --- STYLES (Added missing selectStyle) ---
// const selectStyle = {
//   padding: '8px 12px',
//   borderRadius: '5px',
//   border: '1px solid #ccc',
//   fontSize: '14px',
//   minWidth: '200px',
//   cursor: 'pointer'
// };

// const viewportStyle = { height: '400px', overflow: 'auto', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' };
// const headerRowStyle = { display: 'flex', position: 'sticky', top: 0, backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd', zIndex: 10 };
// const headerCellStyle = { flex: 1, minWidth: '150px', padding: '12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: '#444' };
// const cellStyle = { flex: 1, minWidth: '150px', padding: '12px', borderBottom: '1px solid #eee', outline: 'none', fontSize: '14px' };
// const calculateBtnStyle = { padding: '12px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
// const clearBtnStyle = { padding: '12px 30px', backgroundColor: 'rgb(233,233,233)', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

// export default FinancialPlan;


import React, { useState, useRef, useEffect } from 'react';
import { auth } from "../firebase";

const FinancialPlan = ({ apiBase }) => {
  const initialGrid = [['', ''], ['', ''], ['', ''], ['', ''], ['', '']];

  const [earningsGrid, setEarningsGrid] = useState(initialGrid);
  const [spendingsGrid, setSpendingsGrid] = useState(initialGrid);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const earningsRef = useRef(null);
  const spendingsRef = useRef(null);

  // 1. Fetch the user's specific data on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const res = await fetch(`${apiBase}/api/clients`, { // Reusing this route for the user's own data
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        // If the backend returned a profile, populate the grids
        if (data && data.length > 0 && data[0].data) {
          setEarningsGrid(data[0].data.earnings || initialGrid);
          setSpendingsGrid(data[0].data.spendings || initialGrid);
        }
      } catch (err) {
        console.error("Failed to load user data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiBase]);

  // 2. Save current data to the Backend
  const saveToProfile = async () => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      
      const response = await fetch(`${apiBase}/api/save-profile`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          earnings: earningsGrid.filter(row => row.some(cell => cell.trim() !== "")),
          spendings: spendingsGrid.filter(row => row.some(cell => cell.trim() !== ""))
        })
      });

      if (response.ok) alert("Data saved to your profile!");
    } catch (err) {
      alert("Error saving data");
    }
  };

  // --- HANDLERS (Cleaned up) ---
  const clearTable = () => {
    if (window.confirm("Clear all unsaved entries?")) {
      setEarningsGrid(initialGrid);
      setSpendingsGrid(initialGrid);
      setAnalysisResult(null);
    }
  };

  const handlePaste = (e, setGrid) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const newGrid = pasteData.split(/\r?\n/).filter(row => row.trim() !== "").map(row => row.split('\t'));
    if (newGrid.length > 0) {
      newGrid.push(new Array(newGrid[0].length).fill(""));
      setGrid(newGrid);
    }
  };

  const handleGridChange = (grid, setGrid, rowIndex, colIndex, value) => {
    const updated = grid.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
    });
    if (rowIndex === grid.length - 1 && value !== "") {
      updated.push(new Array(grid[0].length).fill(""));
    }
    setGrid(updated);
  };

  const calculateAnalysis = async () => {
    const cleanedEarnings = earningsGrid.filter(row => row.some(cell => cell.trim() !== ""));
    const cleanedSpendings = spendingsGrid.filter(row => row.some(cell => cell.trim() !== ""));

    if (cleanedEarnings.length === 0 || cleanedSpendings.length === 0) {
      return alert("Please enter or paste data into BOTH grids!");
    }

    try {
      // 1. Get the token from Firebase
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await fetch(`${apiBase}/calculate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // <--- ADD THIS LINE
        },
        body: JSON.stringify({ 
          earnings: cleanedEarnings, 
          spendings: cleanedSpendings 
        })
      });

      if (!response.ok) throw new Error("Calculation failed");

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      alert("Calculation error: check console");
    }
  };

  if (loading) return <div style={{padding: '50px'}}>Loading your data...</div>;

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>My Financial Plan</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={saveToProfile} style={saveBtnStyle}>💾 Save Profile</button>
          <button onClick={clearTable} style={clearBtnStyle}>Clear Sheet</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* EARNINGS */}
        <div style={{ flex: 1 }}>
          <h3>Earnings</h3>
          <div onPaste={(e) => handlePaste(e, setEarningsGrid)} style={viewportStyle}>
            <div style={headerRowStyle}>
              <div style={headerCellStyle}>SOURCE</div>
              <div style={headerCellStyle}>AMOUNT</div>
            </div>
            {earningsGrid.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex' }}>
                {row.map((cell, cIdx) => (
                  <input
                    key={`${rIdx}-${cIdx}`}
                    value={cell}
                    onChange={(e) => handleGridChange(earningsGrid, setEarningsGrid, rIdx, cIdx, e.target.value)}
                    placeholder="-"
                    style={cellStyle}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* SPENDINGS */}
        <div style={{ flex: 1 }}>
          <h3>Spendings</h3>
          <div onPaste={(e) => handlePaste(e, setSpendingsGrid)} style={viewportStyle}>
            <div style={headerRowStyle}>
              <div style={headerCellStyle}>CATEGORY</div>
              <div style={headerCellStyle}>AMOUNT</div>
            </div>
            {spendingsGrid.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex' }}>
                {row.map((cell, cIdx) => (
                  <input
                    key={`${rIdx}-${cIdx}`}
                    value={cell}
                    onChange={(e) => handleGridChange(spendingsGrid, setSpendingsGrid, rIdx, cIdx, e.target.value)}
                    placeholder="-"
                    style={cellStyle}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={calculateAnalysis} style={calculateBtnStyle}>Calculate Analysis</button>

      {analysisResult && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#fff', borderRadius: '8px' }}>
          <h3>📊 Summary</h3>
          <p>Monthly Savings: <strong>${analysisResult.monthly_savings}</strong></p>
          <p>Yearly Savings: <strong>${analysisResult.yearly_savings}</strong></p>
          {analysisResult.pie_chart && (
            <img 
              src={`data:image/png;base64,${analysisResult.pie_chart}`} 
              alt="Pie Chart"
              style={{ width: "300px", marginTop: "10px", borderRadius: '8px' }}
            />
          )}
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const viewportStyle = { height: '350px', overflow: 'auto', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' };
const headerRowStyle = { display: 'flex', position: 'sticky', top: 0, backgroundColor: '#f0f0f0', zIndex: 10 };
const headerCellStyle = { flex: 1, padding: '12px', fontSize: '11px', fontWeight: 'bold' };
const cellStyle = { flex: 1, padding: '12px', borderBottom: '1px solid #eee', outline: 'none' };
const saveBtnStyle = { padding: '10px 20px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const clearBtnStyle = { padding: '10px 20px', backgroundColor: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const calculateBtnStyle = { marginTop: '20px', padding: '12px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default FinancialPlan;