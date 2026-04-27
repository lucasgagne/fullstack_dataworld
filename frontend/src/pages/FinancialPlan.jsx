import React, { useState, useRef } from 'react';

const FinancialPlan = ({ apiBase }) => {
  const initialGrid = [['',''], ['',''], ['',''], ['',''], ['','']];

  const [earningsGrid, setEarningsGrid] = useState(initialGrid);
  const [spendingsGrid, setSpendingsGrid] = useState(initialGrid);
  const [analysisResult, setAnalysisResult] = useState(null);

  const earningsRef = useRef(null);
  const spendingsRef = useRef(null);

  // const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const API_BASE = apiBase;
  // -----------------------------
  // CLEAR BOTH TABLES
  // -----------------------------
  const clearTable = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setEarningsGrid(initialGrid);
      setSpendingsGrid(initialGrid);
      setAnalysisResult(null);
    }
  };

  // -----------------------------
  // PASTE HANDLERS
  // -----------------------------
  const handlePasteEarnings = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');

    const newGrid = pasteData
      .split(/\r?\n/)
      .filter(row => row.trim() !== "")
      .map(row => row.split('\t'));

    if (newGrid.length > 0) {
      newGrid.push(new Array(newGrid[0].length).fill(""));
      setEarningsGrid(newGrid);
    }
  };

  const handlePasteSpendings = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');

    const newGrid = pasteData
      .split(/\r?\n/)
      .filter(row => row.trim() !== "")
      .map(row => row.split('\t'));

    if (newGrid.length > 0) {
      newGrid.push(new Array(newGrid[0].length).fill(""));
      setSpendingsGrid(newGrid);
    }
  };

  // -----------------------------
  // CELL CHANGE HANDLERS
  // -----------------------------
  const handleEarningsChange = (rowIndex, colIndex, value) => {
    const updated = earningsGrid.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
    });

    if (rowIndex === earningsGrid.length - 1 && value !== "") {
      updated.push(new Array(earningsGrid[0].length).fill(""));
    }

    setEarningsGrid(updated);
  };

  const handleSpendingsChange = (rowIndex, colIndex, value) => {
    const updated = spendingsGrid.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
    });

    if (rowIndex === spendingsGrid.length - 1 && value !== "") {
      updated.push(new Array(spendingsGrid[0].length).fill(""));
    }

    setSpendingsGrid(updated);
  };

  // -----------------------------
  // BACKEND CALL
  // -----------------------------
  const calculateAnalysis = async () => {
    const cleanedEarnings = earningsGrid.filter(row => row.some(cell => cell.trim() !== ""));
    const cleanedSpendings = spendingsGrid.filter(row => row.some(cell => cell.trim() !== ""));

    if (cleanedEarnings.length === 0 || cleanedSpendings.length === 0) {
      return alert("Please enter or paste data into BOTH grids!");
    }

    try {
      const response = await fetch(`${API_BASE}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          earnings: cleanedEarnings,
          spendings: cleanedSpendings
        })
      });

      const data = await response.json();
      setAnalysisResult(data);

    } catch (err) {
      console.error(err);
      alert("Backend error");
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Financial Data Entry</h2>
        <button onClick={clearTable} style={clearBtnStyle}>Clear Sheet</button>
      </div>

      <p style={{ fontSize: '14px', color: '#666' }}>
        Paste cells from Excel or Sheets. The tables will grow automatically.
      </p>

      {/* TWO GRIDS SIDE BY SIDE */}
      <div style={{ display: 'flex', gap: '30px' }}>

        {/* EARNINGS GRID */}
        <div style={{ flex: 1 }}>
          <h3>Earnings</h3>
          <div onPaste={handlePasteEarnings} ref={earningsRef} style={viewportStyle}>
            <div style={headerRowStyle}>
              {earningsGrid[0].map((_, colIdx) => (
                <div key={colIdx} style={headerCellStyle}>
                  {colIdx === 0 ? "SOURCE" : "AMOUNT"}
                </div>
              ))}
            </div>

            {earningsGrid.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex' }}>
                {row.map((cell, cIdx) => (
                  <input
                    key={`${rIdx}-${cIdx}`}
                    value={cell}
                    onChange={(e) => handleEarningsChange(rIdx, cIdx, e.target.value)}
                    placeholder="-"
                    style={cellStyle}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* SPENDINGS GRID */}
        <div style={{ flex: 1 }}>
          <h3>Spendings</h3>
          <div onPaste={handlePasteSpendings} ref={spendingsRef} style={viewportStyle}>
            <div style={headerRowStyle}>
              {spendingsGrid[0].map((_, colIdx) => (
                <div key={colIdx} style={headerCellStyle}>
                  {colIdx === 0 ? "CATEGORY" : "AMOUNT"}
                </div>
              ))}
            </div>

            {spendingsGrid.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex' }}>
                {row.map((cell, cIdx) => (
                  <input
                    key={`${rIdx}-${cIdx}`}
                    value={cell}
                    onChange={(e) => handleSpendingsChange(rIdx, cIdx, e.target.value)}
                    placeholder="-"
                    style={cellStyle}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BUTTON */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={calculateAnalysis} style={calculateBtnStyle}>
          Calculate Analysis
        </button>
      </div>

      {/* BACKEND RESULT DISPLAY */}
      {/* {analysisResult && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f8f8', borderRadius: '6px' }}>
          <h4>📊 Analysis Result</h4>
          <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
        </div>
      )} */}
      {analysisResult && (
  <div style={{ marginTop: '20px' }}>
    <h3>📊 Summary</h3>

    <p>Monthly Earnings: ${analysisResult.monthly_earnings}</p>
    <p>Monthly Spendings: ${analysisResult.monthly_spendings}</p>
    <p>Monthly Savings: ${analysisResult.monthly_savings}</p>

    <p>Yearly Earnings: ${analysisResult.yearly_earnings}</p>
    <p>Yearly Spendings: ${analysisResult.yearly_spendings}</p>
    <p>Yearly Savings: ${analysisResult.yearly_savings}</p>

    <h3>🧁 Spending Breakdown</h3>
    <img 
      src={`data:image/png;base64,${analysisResult.pie_chart}`} 
      alt="Spending Breakdown Pie Chart"
      style={{ width: "300px", marginTop: "10px" }}
    />
  </div>
)}


    </div>
  );
};

// --- STYLES ---
const viewportStyle = {
  height: '400px',
  overflow: 'auto',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff'
};

const headerRowStyle = {
  display: 'flex',
  position: 'sticky',
  top: 0,
  backgroundColor: '#f0f0f0',
  borderBottom: '2px solid #ddd',
  zIndex: 10
};

const headerCellStyle = {
  flex: 1,
  minWidth: '150px',
  padding: '12px',
  fontSize: '11px',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  color: '#444'
};

const cellStyle = {
  flex: 1,
  minWidth: '150px',
  padding: '12px',
  borderBottom: '1px solid #eee',
  outline: 'none',
  fontSize: '14px'
};

const calculateBtnStyle = {
  padding: '12px 30px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const clearBtnStyle = {
  padding: '12px 30px',
  backgroundColor: 'rgb(233,233,233)',
  color: 'black',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default FinancialPlan;
