

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

  // --- LOAD DATA FUNCTION ---
  const loadFromProfile = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`${apiBase}/api/get-profile`, {
        method: "GET",
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 404) {
        alert("No saved data found for this account.");
        return;
      }

      const profile = await res.json();

      // Convert format: [{label: "Job", value: "100"}] -> ["Job", "100"]
      if (profile.earnings) {
        const unpackedEarnings = profile.earnings.map(item => [item.label, item.value]);
        // Add an empty row at the end so the user can keep typing
        unpackedEarnings.push(['', '']);
        setEarningsGrid(unpackedEarnings);
      }

      if (profile.spendings) {
        const unpackedSpendings = profile.spendings.map(item => [item.label, item.value]);
        unpackedSpendings.push(['', '']);
        setSpendingsGrid(unpackedSpendings);
      }

      alert("Data synced from cloud! ☁️");
    } catch (err) {
      console.error("Load error:", err);
      alert("Failed to load data.");
    } finally {
      setLoading(false);
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

      </div>
{/* LOAD DATA BUTTON */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={loadFromProfile} style={loadBtnStyle}> Load Data</button>
        <button onClick={saveToProfile} style={saveBtnStyle}>Save Data</button>
        <button onClick={clearTable} style={clearBtnStyle}>Clear Sheet</button>
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
const loadBtnStyle = { 
  padding: '10px 20px', 
  backgroundColor: '#4CAF50', 
  color: 'white', 
  border: 'none', 
  borderRadius: '5px', 
  cursor: 'pointer' 
};

export default FinancialPlan;