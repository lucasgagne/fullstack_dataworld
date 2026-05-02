// import React, { useState, useEffect, useCallback } from 'react';
// import { db, auth } from "../firebase"; 
// import { doc, getDoc, setDoc } from "firebase/firestore";

// const FinancialPlan = ({ apiBase }) => {
//   // 1. DEFAULT TEMPLATE
//   const defaultTemplate = {
//     id: 'root',
//     label: 'Master Overview',
//     children: [
//       { id: 'inc_01', label: 'Income', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [
//           { id: 'inc_a', label: 'Wages', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
//       ]},
//       { id: 'sav_01', label: 'Savings', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [] },
//       { id: 'spe_01', label: 'Spending', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [
//           { id: 'spe_a', label: 'Rent/Mortgage', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
//       ]},
//     ]
//   };

//   const [budgetTree, setBudgetTree] = useState(defaultTemplate);
//   const [viewPath, setViewPath] = useState(['root']);
//   const [backendTotals, setBackendTotals] = useState({});
//   const [displayTimeframe, setDisplayTimeframe] = useState('monthly');
//   const [isCalculating, setIsCalculating] = useState(false);

//   // 2. BACKEND CALCULATION
//   const executeCalculation = useCallback(async (treeToCalc = budgetTree) => {
//     setIsCalculating(true);
//     try {
//       const user = auth.currentUser;
//       if (!user) return;
//       const token = await user.getIdToken();
//       const res = await fetch(`${apiBase}/calculate-tree`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
//         body: JSON.stringify({ tree: treeToCalc })
//       });
//       const data = await res.json();
//       setBackendTotals(data.totals || {});
//     } catch (e) { 
//       console.error("Calculation failed:", e);
//     } finally { 
//       setIsCalculating(false); 
//     }
//   }, [apiBase, budgetTree]);

//   // 3. FIREBASE LOGIC
//   const loadUserData = async (showFeedback = false) => {
//     const user = auth.currentUser;
//     if (!user) return;
//     try {
//       const docRef = doc(db, "userBudgets", user.uid);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         const savedData = docSnap.data().tree;
//         setBudgetTree(savedData);
//         executeCalculation(savedData); 
//         if(showFeedback) alert("Data Loaded.");
//       }
//     } catch (e) { console.error("Load Error", e); }
//   };

//   const saveToFirebase = async () => {
//     const user = auth.currentUser;
//     if (!user) return alert("Please log in.");
//     try {
//       await setDoc(doc(db, "userBudgets", user.uid), { tree: budgetTree });
//       alert("Saved Successfully!");
//     } catch (e) { alert("Save failed."); }
//   };

//   const resetToDefault = () => {
//     if (window.confirm("Wipe everything and start over?")) {
//       setBudgetTree(defaultTemplate);
//       setBackendTotals({});
//       executeCalculation(defaultTemplate);
//     }
//   };

//   useEffect(() => { loadUserData(); }, []);

//   // 4. HELPERS
//   const findNode = (path, node) => {
//     if (path.length === 1 && node.id === path[0]) return node;
//     const nextNode = node.children?.find(c => c.id === path[1]);
//     return nextNode ? findNode(path.slice(1), nextNode) : node;
//   };

//   const updateTreeRecursive = (node, targetId, updates, isDelete = false) => {
//     if (node.id === targetId) return { ...node, ...updates };
//     if (node.children) {
//       const newChildren = isDelete 
//         ? node.children.filter(c => c.id !== targetId)
//         : node.children.map(c => updateTreeRecursive(c, targetId, updates));
//       return { ...node, children: newChildren };
//     }
//     return node;
//   };

//   const handleUpdate = (nodeId, updates) => setBudgetTree(prev => updateTreeRecursive(prev, nodeId, updates));

//   const addRow = () => {
//     const activeNode = findNode(viewPath, budgetTree);
//     const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
//     handleUpdate(activeNode.id, { 
//         children: [...(activeNode.children || []), { id: newId, label: 'New Row', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] }] 
//     });
//   };

//   // 5. CALCULATIONS FOR SUMMARY
//   const currentNode = findNode(viewPath, budgetTree);
//   const isRoot = viewPath.length === 1;
//   const factor = displayTimeframe === 'yearly' ? 12 : 1;

//   // Pulling specific top-level IDs for the summary
//   const totalIncome = (backendTotals['inc_01'] || 0) * factor;
//   const totalSpending = (backendTotals['spe_01'] || 0) * factor;
//   const netSavings = totalIncome - totalSpending;

//   return (
//     <div style={pageStyle}>
//       <div style={navHeader}>
//         {!isRoot && <button onClick={() => setViewPath(viewPath.slice(0, -1))} style={btnStyle}>← Back</button>}
//         <h2 style={{margin: 0}}>{currentNode.label}</h2>
        
//         <div style={{marginLeft: 'auto', display: 'flex', gap: '8px'}}>
//             <button onClick={() => loadUserData(true)} style={loadBtnStyle}>📂 Load</button>
//             <button onClick={saveToFirebase} style={saveBtnStyle}>💾 Save</button>
//             <button onClick={resetToDefault} style={resetBtnStyle}>⚠️ Reset</button>
//             <select value={displayTimeframe} onChange={(e) => setDisplayTimeframe(e.target.value)} style={selectStyle}>
//                 <option value="monthly">Monthly</option>
//                 <option value="yearly">Yearly</option>
//             </select>
//             <button onClick={addRow} style={addBtnStyle}>+ Row</button>
//             <button onClick={() => executeCalculation()} style={calcBtnStyle} disabled={isCalculating}>
//                 {isCalculating ? "..." : "🚀 Calculate"}
//             </button>
//         </div>
//       </div>

//       <div style={tableStyle}>
//         <div style={tableHeader}>
//           <div style={{ flex: 2 }}>CATEGORY</div>
//           <div style={{ flex: 1 }}>LOGIC</div>
//           <div style={{ flex: 1 }}>VALUE</div>
//           <div style={{ flex: 1 }}>FREQ</div>
//           <div style={{ flex: 1 }}>TOTAL ({displayTimeframe})</div>
//           <div style={{ width: '40px' }}></div>
//         </div>

//         {currentNode.children?.map(child => (
//           <div key={child.id} style={rowStyle}>
//             <div style={{ flex: 2, display: 'flex', gap: '8px' }}>
//                <input value={child.label} onChange={(e) => handleUpdate(child.id, { label: e.target.value })} style={nameInputStyle} />
//                <button onClick={() => setViewPath([...viewPath, child.id])} style={drillBtn}>🔍</button>
//             </div>
//             <div style={{ flex: 1 }}>
//               <select value={child.logic} onChange={(e) => handleUpdate(child.id, { logic: e.target.value })} style={selectStyle}>
//                 <option value="manual">Manual</option>
//                 <option value="summed">Summed</option>
//               </select>
//             </div>
//             <div style={{ flex: 1 }}>
//                 <input type="number" value={child.manualValue} onChange={(e) => handleUpdate(child.id, { manualValue: e.target.value })} disabled={child.logic === 'summed'} style={inputStyle} />
//             </div>
//             <div style={{ flex: 1 }}>
//               <select value={child.timeframe} onChange={(e) => handleUpdate(child.id, { timeframe: e.target.value })} style={selectStyle}>
//                 <option value="daily">Daily</option>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//                 <option value="yearly">Yearly</option>
//               </select>
//             </div>
//             <div style={{ flex: 1 }}>${((backendTotals[child.id] || 0) * factor).toFixed(2)}</div>
//             <div style={{ width: '40px' }}>
//                 {!child.isProtected && <button onClick={() => handleUpdate(currentNode.id, { children: currentNode.children.filter(c => c.id !== child.id)})} style={deleteBtn}>🗑️</button>}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ANALYSIS SUMMARY BOX */}
//       {isRoot && (
//         <div style={summaryCard}>
//             <h3 style={{marginTop: 0}}>Financial Analysis ({displayTimeframe})</h3>
//             <div style={summaryRow}>
//                 <span>Total Income:</span>
//                 <span style={{color: '#27ae60', fontWeight: 'bold'}}>${totalIncome.toLocaleString()}</span>
//             </div>
//             <div style={summaryRow}>
//                 <span>Total Spending:</span>
//                 <span style={{color: '#c0392b', fontWeight: 'bold'}}>${totalSpending.toLocaleString()}</span>
//             </div>
//             <div style={{...summaryRow, borderTop: '2px solid #eee', marginTop: '10px', paddingTop: '10px'}}>
//                 <span>Net Savings/Surplus:</span>
//                 <span style={{fontWeight: 'bold', fontSize: '1.2rem', color: netSavings >= 0 ? '#27ae60' : '#c0392b'}}>
//                     ${netSavings.toLocaleString()}
//                 </span>
//             </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // STYLES (Kept consistent with your UI)
// const pageStyle = { padding: '30px', background: '#f4f7f9', minHeight: '100vh', fontFamily: 'system-ui' };
// const navHeader = { display: 'flex', alignItems: 'center', marginBottom: '20px' };
// const tableStyle = { background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' };
// const tableHeader = { display: 'flex', padding: '12px 20px', background: '#34495e', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' };
// const rowStyle = { display: 'flex', padding: '10px 20px', borderBottom: '1px solid #eee', alignItems: 'center' };
// const summaryCard = { marginTop: '30px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: '400px' };
// const summaryRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' };
// const nameInputStyle = { border: 'none', borderBottom: '1px solid #ccc', background: 'transparent', width: '80%' };
// const inputStyle = { width: '90%', padding: '4px' };
// const selectStyle = { padding: '4px' };
// const drillBtn = { background: 'none', border: 'none', cursor: 'pointer' };
// const deleteBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' };
// const btnStyle = { padding: '6px 12px', cursor: 'pointer', marginRight: '10px' };
// const addBtnStyle = { padding: '8px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
// const saveBtnStyle = { padding: '8px 15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
// const loadBtnStyle = { padding: '8px 15px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
// const resetBtnStyle = { padding: '8px 15px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
// const calcBtnStyle = { padding: '8px 15px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

// export default FinancialPlan;

import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from "../firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";

const FinancialPlan = ({ apiBase }) => {
  const defaultTemplate = {
    id: 'root',
    label: 'Master Overview',
    children: [
      { id: 'inc_01', label: 'Income', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [
          { id: 'inc_a', label: 'Wages', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
      ]},
      { id: 'sav_01', label: 'Savings', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [] },
      { id: 'spe_01', label: 'Spending', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [
          { id: 'spe_a', label: 'Rent/Mortgage', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
      ]},
    ]
  };

  const [budgetTree, setBudgetTree] = useState(defaultTemplate);
  const [viewPath, setViewPath] = useState(['root']);
  const [backendTotals, setBackendTotals] = useState({});
  const [displayTimeframe, setDisplayTimeframe] = useState('monthly');
  const [isCalculating, setIsCalculating] = useState(false);

  const executeCalculation = useCallback(async (treeToCalc = budgetTree) => {
    setIsCalculating(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`${apiBase}/calculate-tree`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ tree: treeToCalc })
      });
      const data = await res.json();
      setBackendTotals(data.totals || {});
    } catch (e) { console.error(e); } finally { setIsCalculating(false); }
  }, [apiBase, budgetTree]);

  const loadUserData = async (showFeedback = false) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docRef = doc(db, "userBudgets", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const savedData = docSnap.data().tree;
        setBudgetTree(savedData);
        executeCalculation(savedData); 
        if(showFeedback) alert("Loaded.");
      }
    } catch (e) { console.error(e); }
  };

  const saveToFirebase = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Login required");
    try {
      await setDoc(doc(db, "userBudgets", user.uid), { tree: budgetTree });
      alert("Saved!");
    } catch (e) { alert("Error saving"); }
  };

  useEffect(() => { loadUserData(); }, []);

  const findNode = (path, node) => {
    if (path.length === 1 && node.id === path[0]) return node;
    const nextNode = node.children?.find(c => c.id === path[1]);
    return nextNode ? findNode(path.slice(1), nextNode) : node;
  };

  const updateTreeRecursive = (node, targetId, updates, isDelete = false) => {
    if (node.id === targetId) return { ...node, ...updates };
    if (node.children) {
      let newChildren = node.children.map(c => updateTreeRecursive(c, targetId, updates, isDelete));
      if (isDelete) newChildren = newChildren.filter(c => c.id !== targetId);
      return { ...node, children: newChildren };
    }
    return node;
  };

  const handleUpdate = (nodeId, updates) => setBudgetTree(prev => updateTreeRecursive(prev, nodeId, updates));

  const addRow = () => {
    const activeNode = findNode(viewPath, budgetTree);
    const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
    handleUpdate(activeNode.id, { 
        children: [...(activeNode.children || []), { id: newId, label: 'New Row', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] }] 
    });
  };

  const currentNode = findNode(viewPath, budgetTree);
  const isRoot = viewPath.length === 1;
  const factor = displayTimeframe === 'yearly' ? 12 : 1;

  // Global Summary Math
  const totalIncome = (backendTotals['inc_01'] || 0) * factor;
  const totalSpending = (backendTotals['spe_01'] || 0) * factor;
  const netSavings = totalIncome - totalSpending;

  return (
    <div style={pageStyle}>
      <div style={navHeader}>
        {!isRoot && <button onClick={() => setViewPath(viewPath.slice(0, -1))} style={btnStyle}>← Back to Overview</button>}
        <h2 style={{margin: 0}}>{currentNode.label} Breakdown</h2>
        
        <div style={{marginLeft: 'auto', display: 'flex', gap: '8px'}}>
            <button onClick={() => loadUserData(true)} style={loadBtnStyle}>📂 Load</button>
            <button onClick={saveToFirebase} style={saveBtnStyle}>💾 Save</button>
            <select value={displayTimeframe} onChange={(e) => setDisplayTimeframe(e.target.value)} style={selectStyle}>
                <option value="monthly">Monthly View</option>
                <option value="yearly">Yearly View</option>
            </select>
            <button onClick={addRow} style={addBtnStyle}>+ Add Line Item</button>
            <button onClick={() => executeCalculation()} style={calcBtnStyle}>
                {isCalculating ? "..." : "🚀 Calculate"}
            </button>
        </div>
      </div>

      {/* NEW: THE "MASTER ROW" FOR THE CURRENT VIEW */}
      {!isRoot && (
        <div style={masterRowBanner}>
            <span>TOTAL {currentNode.label.toUpperCase()} ({displayTimeframe}):</span>
            <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>
                ${((backendTotals[currentNode.id] || 0) * factor).toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
        </div>
      )}

      <div style={tableStyle}>
        <div style={tableHeader}>
          <div style={{ flex: 2 }}>CATEGORY</div>
          <div style={{ flex: 1 }}>LOGIC</div>
          <div style={{ flex: 1 }}>MANUAL AMT</div>
          <div style={{ flex: 1 }}>FREQ</div>
          <div style={{ flex: 1 }}>TOTAL ({displayTimeframe})</div>
          <div style={{ width: '40px' }}></div>
        </div>

        {currentNode.children?.map(child => (
          <div key={child.id} style={rowStyle}>
            <div style={{ flex: 2, display: 'flex', gap: '8px' }}>
               <input value={child.label} onChange={(e) => handleUpdate(child.id, { label: e.target.value })} style={nameInputStyle} />
               <button onClick={() => setViewPath([...viewPath, child.id])} style={drillBtn} title="Drill Down">🔍</button>
            </div>
            <div style={{ flex: 1 }}>
              <select value={child.logic} onChange={(e) => handleUpdate(child.id, { logic: e.target.value })} style={selectStyle}>
                <option value="manual">Manual</option>
                <option value="summed">Summed</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
                <input type="number" value={child.manualValue} onChange={(e) => handleUpdate(child.id, { manualValue: e.target.value })} disabled={child.logic === 'summed'} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <select value={child.timeframe} onChange={(e) => handleUpdate(child.id, { timeframe: e.target.value })} style={selectStyle}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>${((backendTotals[child.id] || 0) * factor).toFixed(2)}</div>
            <div style={{ width: '40px' }}>
                {!child.isProtected && <button onClick={() => setBudgetTree(prev => updateTreeRecursive(prev, child.id, {}, true))} style={deleteBtn}>🗑️</button>}
            </div>
          </div>
        ))}
      </div>

      {isRoot && (
        <div style={summaryCard}>
            <h3 style={{marginTop: 0}}>Financial Analysis ({displayTimeframe})</h3>
            <div style={summaryRow}><span>Total Income:</span><span style={{color: '#27ae60'}}>${totalIncome.toLocaleString()}</span></div>
            <div style={summaryRow}><span>Total Spending:</span><span style={{color: '#c0392b'}}>${totalSpending.toLocaleString()}</span></div>
            <div style={{...summaryRow, borderTop: '2px solid #eee', marginTop: '10px', paddingTop: '10px'}}>
                <span>Net Surplus:</span>
                <span style={{fontWeight: 'bold', color: netSavings >= 0 ? '#27ae60' : '#c0392b'}}>${netSavings.toLocaleString()}</span>
            </div>
        </div>
      )}
    </div>
  );
};

// ADDED STYLE FOR THE MASTER BANNER
const masterRowBanner = {
    background: '#ecf0f1',
    padding: '15px 20px',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #bdc3c7',
    marginBottom: '-1px', // connects to table
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
};

const pageStyle = { padding: '30px', background: '#f4f7f9', minHeight: '100vh', fontFamily: 'system-ui' };
const navHeader = { display: 'flex', alignItems: 'center', marginBottom: '20px' };
const tableStyle = { background: 'white', borderRadius: '0 0 8px 8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' };
const tableHeader = { display: 'flex', padding: '12px 20px', background: '#34495e', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' };
const rowStyle = { display: 'flex', padding: '10px 20px', borderBottom: '1px solid #eee', alignItems: 'center' };
const summaryCard = { marginTop: '30px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: '400px' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' };
const nameInputStyle = { border: 'none', borderBottom: '1px solid #ccc', background: 'transparent', width: '80%' };
const inputStyle = { width: '90%', padding: '4px' };
const selectStyle = { padding: '4px' };
const drillBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' };
const deleteBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' };
const btnStyle = { padding: '6px 12px', cursor: 'pointer', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' };
const addBtnStyle = { padding: '8px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const saveBtnStyle = { padding: '8px 15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const loadBtnStyle = { padding: '8px 15px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const calcBtnStyle = { padding: '8px 15px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default FinancialPlan;