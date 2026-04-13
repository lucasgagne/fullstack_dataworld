import React, { useState, useRef } from 'react';

const FinancialPlan = () => {
  const initialGrid = [['',''], ['',''], ['',''], ['',''], ['','']];

  const [grid, setGrid] = useState(initialGrid);
  const [analysisResult, setAnalysisResult] = useState(null);
  const scrollRef = useRef(null);

  // Match Home.jsx pattern
  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";


  const clearTable = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setGrid(initialGrid);
      setAnalysisResult(null);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');

    const newGrid = pasteData
      .split(/\r?\n/)
      .filter(row => row.trim() !== "")
      .map(row => row.split('\t'));

    if (newGrid.length > 0) {
      newGrid.push(new Array(newGrid[0].length).fill(""));
      setGrid(newGrid);
    }
  };

  // 🔥 Backend call — now structured like Home.jsx
  const calculateAnalysis = async () => {
    const cleanedGrid = grid.filter(row => row.some(cell => cell.trim() !== ""));

    if (cleanedGrid.length === 0) {
      return alert("Please paste or enter some data first!");
    }

    const encoded = encodeURIComponent(JSON.stringify(cleanedGrid));

    try {
      const response = await fetch(`${API_BASE}/calculate/${encoded}`);
      const data = await response.json();
      setAnalysisResult(data);

    } catch (err) {
      console.error(err);
      alert("Backend error");
    }
};


  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedGrid = grid.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
    });

    if (rowIndex === grid.length - 1 && value !== "") {
      updatedGrid.push(new Array(grid[0].length).fill(""));
    }

    setGrid(updatedGrid);
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Financial Data Entry</h2>
        <button onClick={clearTable} style={clearBtnStyle}>Clear Sheet</button>
      </div>

      <p style={{ fontSize: '14px', color: '#666' }}>
        Paste cells from Excel or Sheets. The table will grow automatically.
      </p>

      {/* TABLE VIEWPORT */}
      <div onPaste={handlePaste} ref={scrollRef} style={viewportStyle}>
        <div style={headerRowStyle}>
          {grid[0].map((_, colIdx) => (
            <div key={colIdx} style={headerCellStyle}>
              {colIdx === 0 ? "NAME" : colIdx === 1 ? "VALUE" : `COL ${colIdx + 1}`}
            </div>
          ))}
        </div>

        {grid.map((row, rIdx) => (
          <div key={rIdx} style={{ display: 'flex' }}>
            {row.map((cell, cIdx) => (
              <input
                key={`${rIdx}-${cIdx}`}
                value={cell}
                onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                placeholder="-"
                style={cellStyle}
              />
            ))}
          </div>
        ))}
      </div>

      {/* BUTTON */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={calculateAnalysis} style={calculateBtnStyle}>
          Calculate Analysis
        </button>
      </div>

      {/* BACKEND RESULT DISPLAY */}
      {analysisResult && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f8f8', borderRadius: '6px' }}>
          <h4>📊 Analysis Result</h4>
          <p><strong>Total Sum:</strong> ${analysisResult.total_sum}</p>
          {/* <p><strong>Total Sum:</strong> ${analysisResult}</p> */}

        </div>
      )}

    </div>
  );
};

// --- STYLES (unchanged) ---
const viewportStyle = {
  height: '500px',
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
