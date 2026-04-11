import React, { useState, useRef } from 'react';

const FinancialPlan = () => {
  // 1. Initial State: Start with a standard 2-column view
  const [grid, setGrid] = useState([
    ['', ''], ['', ''], ['', ''], ['', ''], ['', '']
  ]);

  const scrollRef = useRef(null);

  // 2. THE UNIVERSAL PASTE HANDLER
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    
    // Parse the table from the clipboard
    const newGrid = pasteData
      .split(/\r?\n/)
      .filter(row => row.trim() !== '')
      .map(row => row.split('\t'));

    if (newGrid.length > 0) {
      // Add one empty "ghost row" at the bottom that matches the pasted width
      newGrid.push(new Array(newGrid[0].length).fill(''));
      setGrid(newGrid);
    }
  };

  // 3. UPDATING A SPECIFIC CELL
  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedGrid = grid.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
    });

    // INFINITE ROW: If typing in the last row, add a new one with the same # of columns
    if (rowIndex === grid.length - 1 && value !== '') {
      updatedGrid.push(new Array(grid[0].length).fill(''));
    }

    setGrid(updatedGrid);
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h2>Financial Data Entry</h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        Paste any size table (2 columns, 5 columns, etc.). The sheet will adapt.
      </p>

      <div onPaste={handlePaste} ref={scrollRef} style={viewportStyle}>
        
        {/* DYNAMIC STICKY HEADER */}
        {/* We map over the FIRST row of the grid to determine how many headers to show */}
        <div style={headerRowStyle}>
          {grid[0].map((_, colIdx) => (
            <div key={colIdx} style={{ ...headerCellStyle, borderLeft: colIdx === 0 ? 'none' : '1px solid #ddd' }}>
              {colIdx === 0 ? 'NAME' : colIdx === 1 ? 'VALUE' : `COL ${colIdx + 1}`}
            </div>
          ))}
        </div>

        {/* DATA ROWS */}
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
        <button 
          onClick={() => console.log("Current Grid Data:", grid)} 
          style={calculateBtnStyle}
        >
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
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
  backgroundColor: '#fff'
};

const headerRowStyle = {
  display: 'flex',
  position: 'sticky',
  top: 0,
  backgroundColor: '#f0f0f0',
  borderBottom: '2px solid #ddd',
  zIndex: 10,
  minWidth: 'fit-content' // Ensures header doesn't shrink if table is wide
};

const headerCellStyle = {
  flex: 1,
  minWidth: '150px', // Ensures cells don't get too squished
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

export default FinancialPlan;