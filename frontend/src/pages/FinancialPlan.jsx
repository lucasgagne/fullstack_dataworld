import React, { useState, useRef } from 'react';

const FinancialPlan = () => {
  const initialGrid = [
    ['', ''], ['', ''], ['', ''], ['', ''], ['', '']
  ];

  const [grid, setGrid] = useState(initialGrid);
  const scrollRef = useRef(null);

  const clearTable = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setGrid(initialGrid);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const newGrid = pasteData
      .split(/\r?\n/)
      .filter(row => row.trim() !== '')
      .map(row => row.split('\t'));

    if (newGrid.length > 0) {
      newGrid.push(new Array(newGrid[0].length).fill(''));
      setGrid(newGrid);
    }
  };

 
const calculateAnalysis = async () => {
        // Use the environment variable if it exists; otherwise, default to your Render URL
        // const API_BASE = import.meta.env.VITE_API_URL || "https://your-backend-name.onrender.com";
         // Inside FinancialPlan component...
        const API_BASE = import.meta.env.DEV 
        ? 'http://127.0.0.1:5000'                      // Local Python
        : 'https://dataworld-mfya.onrender.com';       // Render Python
      
        try {
          const response = await fetch(`${API_BASE}/calculate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              grid: grid.filter(row => row.some(cell => cell.trim() !== "")) 
            }),
          });
          // ... rest of your code
  
      const result = await response.json();
      console.log("Analysis Result:", result);
      alert(`Total Calculated: $${result.total_sum}`);
      
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Failed to connect to backend.");
    }
  };
  

  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedGrid = grid.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
    });

    if (rowIndex === grid.length - 1 && value !== '') {
      updatedGrid.push(new Array(grid[0].length).fill(''));
    }
    setGrid(updatedGrid);
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER SECTION */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0 }}>Financial Data Entry</h2>
        <button onClick={clearTable} style={clearBtnStyle}>
          Clear Sheet
        </button>
      </div>
      
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        Paste cells from Excel or Sheets. The table will grow automatically.
      </p>

      {/* INDEPENDENT VIEWPORT */}
      <div onPaste={handlePaste} ref={scrollRef} style={viewportStyle}>
        <div style={headerRowStyle}>
          {grid[0].map((_, colIdx) => (
            <div key={colIdx} style={{ ...headerCellStyle, borderLeft: colIdx === 0 ? 'none' : '1px solid #ddd' }}>
              {colIdx === 0 ? 'NAME' : colIdx === 1 ? 'VALUE' : `COL ${colIdx + 1}`}
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
                style={{
                  ...cellStyle,
                  borderLeft: cIdx === 0 ? 'none' : '1px solid #eee',
                  backgroundColor: rIdx === grid.length - 1 ? '#fafafa' : 'transparent'
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
      <button onClick={calculateAnalysis} style={calculateBtnStyle}>
        Calculate Analysis
      </button>
      </div>
    </div>
  );
};

// --- STYLES ---

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
  zIndex: 10,
  minWidth: 'fit-content'
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
  border: 'none',
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