import React, { useState, useEffect } from 'react';
import { db, auth } from "../firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";

const FinancialPlan = ({ apiBase }) => {
  // 1. STATE INITIALIZATION
  const [budgetTree, setBudgetTree] = useState({
    id: 'root',
    label: 'Master Overview',
    children: [
      { id: 'inc_01', label: 'Income', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [
          { id: 'inc_a', label: 'a', manualValue: 1, timeframe: 'monthly', logic: 'manual', children: [] },
          { id: 'inc_b', label: 'b', manualValue: 2, timeframe: 'monthly', logic: 'manual', children: [] },
          { id: 'inc_c', label: 'c', manualValue: 3, timeframe: 'monthly', logic: 'manual', children: [] },
      ]},
      { id: 'sav_01', label: 'Savings-Cash', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [] },
      { id: 'spe_01', label: 'Spending', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [] },
    ]
  });

  const [viewPath, setViewPath] = useState(['root']);
  const [backendTotals, setBackendTotals] = useState({});
  const [displayTimeframe, setDisplayTimeframe] = useState('monthly');
  const [isCalculating, setIsCalculating] = useState(false);

  // 2. BACKEND INTEGRATION (PYTHON)
  const executeCalculation = async (treeToCalc = budgetTree) => {
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
    } catch (e) { 
      console.error("Calculation failed:", e);
    } finally { 
      setIsCalculating(false); 
    }
  };

  // 3. FIREBASE LOGIC (SAVE / LOAD)
  const loadUserData = async () => {
    const user = auth.currentUser;
    if (!user) return; // Silent return for auto-load, button logic can handle alerts

    try {
      const docRef = doc(db, "userBudgets", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const savedTree = docSnap.data().tree;
        setBudgetTree(savedTree);
        executeCalculation(savedTree); 
        console.log("Data loaded from Firebase.");
      }
    } catch (e) {
      console.error("Error loading data:", e);
    }
  };

  const saveToFirebase = async () => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to save.");
    try {
      await setDoc(doc(db, "userBudgets", user.uid), {
        tree: budgetTree,
        lastSaved: new Date().toISOString()
      });
      alert("Data saved successfully!");
    } catch (e) {
      console.error("Save error", e);
      alert("Failed to save data.");
    }
  };

  // Auto-load once on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // 4. TREE NAVIGATION & MANIPULATION
  const findNode = (path, node) => {
    if (path.length === 1 && node.id === path[0]) return node;
    const nextId = path[1];
    const nextNode = node.children.find(c => c.id === nextId);
    return findNode(path.slice(1), nextNode);
  };

  const updateTreeRecursive = (node, targetId, updates, isDelete = false) => {
    if (node.id === targetId) return { ...node, ...updates };
    if (node.children) {
      if (isDelete) {
        return { ...node, children: node.children.filter(c => c.id !== targetId).map(c => updateTreeRecursive(c, targetId, updates, isDelete)) };
      }
      return { ...node, children: node.children.map(c => updateTreeRecursive(c, targetId, updates)) };
    }
    return node;
  };

  const handleUpdate = (nodeId, updates) => setBudgetTree(prev => updateTreeRecursive(prev, nodeId, updates));
  
  const handleDelete = (nodeId) => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      setBudgetTree(prev => updateTreeRecursive(prev, nodeId, {}, true));
    }
  };

  const addRow = () => {
    const activeNode = findNode(viewPath, budgetTree);
    const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
    const newRow = {
      id: newId, label: 'New Category', manualValue: 0, timeframe: 'monthly', logic: 'manual',
      children: [
        { id: `${newId}_a`, label: 'a', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
        { id: `${newId}_b`, label: 'b', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
        { id: `${newId}_c`, label: 'c', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
      ]
    };
    handleUpdate(activeNode.id, { children: [...activeNode.children, newRow] });
  };

  // 5. RENDER PREP
  const currentNode = findNode(viewPath, budgetTree);
  const isRoot = viewPath.length === 1;

  const factor = displayTimeframe === 'yearly' ? 12 : 1;
  const inc = (backendTotals['inc_01'] || 0) * factor;
  const spe = (backendTotals['spe_01'] || 0) * factor;
  const savingsRate = inc - spe;

  return (
    <div style={pageStyle}>
      <div style={navHeader}>
        {!isRoot && <button onClick={() => setViewPath(viewPath.slice(0, -1))} style={btnStyle}>← Back</button>}
        <h2>{currentNode.label}</h2>
        
        <div style={{marginLeft: 'auto', display: 'flex', gap: '10px'}}>
            <button onClick={() => { loadUserData(); alert("Attempting to load last save..."); }} style={loadBtnStyle}>📂 Load Last Save</button>
            <button onClick={saveToFirebase} style={saveBtnStyle}>💾 Save Progress</button>
            
            <select value={displayTimeframe} onChange={(e) => setDisplayTimeframe(e.target.value)} style={selectStyle}>
                <option value="monthly">Show Monthly</option>
                <option value="yearly">Show Yearly</option>
            </select>
            
            <button onClick={addRow} style={addBtnStyle}>+ Add Row</button>
            <button onClick={() => executeCalculation()} style={calcBtnStyle} disabled={isCalculating}>
                {isCalculating ? "..." : "🚀 Calculate"}
            </button>
        </div>
      </div>

      <div style={tableStyle}>
        <div style={tableHeader}>
          <div style={{ flex: 2 }}>CATEGORY</div>
          <div style={{ flex: 1.5 }}>LOGIC</div>
          <div style={{ flex: 1 }}>MANUAL AMT</div>
          <div style={{ flex: 1 }}>TIMEFRAME</div>
          <div style={{ flex: 1 }}>TOTAL</div>
          <div style={{ width: '40px' }}></div>
        </div>

        {/* MASTER OVERWRITE ROW */}
        {!isRoot && (
            <div style={{...rowStyle, background: '#eef2f7', borderBottom: '2px solid #cbd5e0'}}>
                <div style={{ flex: 2, fontWeight: 'bold' }}>MASTER OVERWRITE</div>
                <div style={{ flex: 1.5 }}>
                    <select value={currentNode.logic} onChange={(e) => handleUpdate(currentNode.id, { logic: e.target.value })} style={selectStyle}>
                        <option value="manual">Manual Entry</option>
                        <option value="summed">Summed Table</option>
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <input type="number" value={currentNode.manualValue} onChange={(e) => handleUpdate(currentNode.id, { manualValue: e.target.value })} disabled={currentNode.logic === 'summed'} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                    <select value={currentNode.timeframe} onChange={(e) => handleUpdate(currentNode.id, { timeframe: e.target.value })} style={selectStyle}>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                <div style={{ flex: 1, fontWeight: 'bold' }}>${(backendTotals[currentNode.id] || 0).toFixed(2)}</div>
                <div style={{ width: '40px' }}></div>
            </div>
        )}

        {/* DATA ROWS */}
        {currentNode.children.map(child => (
          <div key={child.id} style={rowStyle}>
            <div style={{ flex: 2, display: 'flex', gap: '8px' }}>
               <input value={child.label} onChange={(e) => handleUpdate(child.id, { label: e.target.value })} style={nameInputStyle} />
               <button onClick={() => setViewPath([...viewPath, child.id])} style={drillBtn}>🔍</button>
            </div>
            <div style={{ flex: 1.5 }}>
              <select value={child.logic} onChange={(e) => handleUpdate(child.id, { logic: e.target.value })} style={selectStyle}>
                <option value="manual">Manual Entry</option>
                <option value="summed">Summed Table</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
                <input type="number" value={child.manualValue} onChange={(e) => handleUpdate(child.id, { manualValue: e.target.value })} disabled={child.logic === 'summed'} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <select value={child.timeframe} onChange={(e) => handleUpdate(child.id, { timeframe: e.target.value })} style={selectStyle}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>${(backendTotals[child.id] || 0).toFixed(2)}</div>
            <div style={{ width: '40px' }}>{!child.isProtected && <button onClick={() => handleDelete(child.id)} style={deleteBtn}>🗑️</button>}</div>
          </div>
        ))}

        {/* FOOTER TOTALS */}
        <div style={{...rowStyle, background: '#f8f9fa', fontWeight: 'bold'}}>
            <div style={{flex: 5.5}}>TABLE SUM TOTAL</div>
            <div style={{flex: 1}}>${currentNode.children.reduce((acc, c) => acc + (backendTotals[c.id] || 0), 0).toFixed(2)}</div>
            <div style={{width: '40px'}}></div>
        </div>
      </div>

      {/* ANALYSIS SUMMARY */}
      {isRoot && (
        <div style={summaryCard}>
            <h3>Financial Analysis Summary ({displayTimeframe})</h3>
            <div style={summaryRow}><span>Total Income:</span> <strong>${inc.toFixed(2)}</strong></div>
            <div style={summaryRow}><span>Total Spending:</span> <strong>${spe.toFixed(2)}</strong></div>
            <div style={{...summaryRow, borderTop: '2px solid #eee', marginTop: '10px'}}>
                <span>Additional Saving Rate:</span> 
                <strong style={{color: savingsRate >= 0 ? 'green' : 'red'}}>${savingsRate.toFixed(2)}</strong>
            </div>
        </div>
      )}
    </div>
  );
};

// STYLES
const pageStyle = { padding: '40px', background: '#f8f9fa', minHeight: '100vh', fontFamily: 'sans-serif' };
const navHeader = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' };
const tableStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' };
const tableHeader = { display: 'flex', padding: '15px 20px', background: '#2c3e50', color: 'white' };
const rowStyle = { display: 'flex', padding: '12px 20px', borderBottom: '1px solid #eee', alignItems: 'center' };
const summaryCard = { marginTop: '30px', padding: '25px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '500px' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', padding: '10px 0' };
const nameInputStyle = { border: 'none', borderBottom: '1px solid #ddd', padding: '4px', width: '70%' };
const inputStyle = { width: '80%', padding: '5px' };
const selectStyle = { padding: '5px' };
const drillBtn = { background: 'none', border: 'none', cursor: 'pointer' };
const deleteBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'red' };
const btnStyle = { padding: '8px 15px', cursor: 'pointer' };
const addBtnStyle = { padding: '8px 18px', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };
const saveBtnStyle = { padding: '8px 18px', background: '#9b59b6', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };
const loadBtnStyle = { padding: '8px 18px', background: '#f39c12', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };
const calcBtnStyle = { padding: '8px 22px', background: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };

export default FinancialPlan;








// import React, { useState, useEffect } from 'react'; // Added useEffect here
// import { db, auth } from "../firebase"; 
// import { doc, getDoc, setDoc } from "firebase/firestore";

// const FinancialPlan = ({ apiBase }) => {
//   const [budgetTree, setBudgetTree] = useState({
//     id: 'root',
//     label: 'Master Overview',
//     children: [
//       { id: 'inc_01', label: 'Income', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [
//           { id: 'inc_a', label: 'a', manualValue: 1, timeframe: 'monthly', logic: 'manual', children: [] },
//           { id: 'inc_b', label: 'b', manualValue: 2, timeframe: 'monthly', logic: 'manual', children: [] },
//           { id: 'inc_c', label: 'c', manualValue: 3, timeframe: 'monthly', logic: 'manual', children: [] },
//       ]},
//       { id: 'sav_01', label: 'Savings-Cash', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [] },
//       { id: 'spe_01', label: 'Spending', manualValue: 0, timeframe: 'monthly', logic: 'summed', isProtected: true, children: [] },
//     ]
//   });

//   const [viewPath, setViewPath] = useState(['root']);
//   const [backendTotals, setBackendTotals] = useState({});
//   const [displayTimeframe, setDisplayTimeframe] = useState('monthly');
//   const [isCalculating, setIsCalculating] = useState(false);

//   // --- RECURSIVE HELPERS ---
//   const findNode = (path, node) => {
//     if (path.length === 1 && node.id === path[0]) return node;
//     const nextId = path[1];
//     const nextNode = node.children.find(c => c.id === nextId);
//     return findNode(path.slice(1), nextNode);
//   };

//   const updateTreeRecursive = (node, targetId, updates, isDelete = false) => {
//     if (node.id === targetId) return { ...node, ...updates };
//     if (node.children) {
//       if (isDelete) {
//         return { ...node, children: node.children.filter(c => c.id !== targetId).map(c => updateTreeRecursive(c, targetId, updates, isDelete)) };
//       }
//       return { ...node, children: node.children.map(c => updateTreeRecursive(c, targetId, updates)) };
//     }
//     return node;
//   };

//   // --- ACTIONS ---
//   const handleUpdate = (nodeId, updates) => setBudgetTree(prev => updateTreeRecursive(prev, nodeId, updates));
//   const handleDelete = (nodeId) => window.confirm("Delete row?") && setBudgetTree(prev => updateTreeRecursive(prev, nodeId, {}, true));

//   const executeCalculation = async (treeToCalc = budgetTree) => {
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
//       setBackendTotals(data.totals);
//     } catch (e) { 
//       console.error("Calc error:", e);
//     } finally { 
//       setIsCalculating(false); 
//     }
//   };

//   // --- FIREBASE DATA SYNC ---
//   useEffect(() => {
//     const loadUserData = async () => {
//       const user = auth.currentUser;
//       if (user) {
//         const docRef = doc(db, "userBudgets", user.uid);
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           const savedTree = docSnap.data().tree;
//           setBudgetTree(savedTree);
//           executeCalculation(savedTree); 
//         }
//       }
//     };
//     loadUserData();
//   }, []);

//   const saveToFirebase = async () => {
//     const user = auth.currentUser;
//     if (!user) return alert("You must be logged in to save.");
//     try {
//       await setDoc(doc(db, "userBudgets", user.uid), {
//         tree: budgetTree,
//         lastSaved: new Date().toISOString()
//       });
//       alert("Data saved successfully!");
//     } catch (e) {
//       console.error("Save error", e);
//     }
//   };

//   const addRow = () => {
//     const activeNode = findNode(viewPath, budgetTree);
//     const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
//     const newRow = {
//       id: newId, label: 'New Category', manualValue: 0, timeframe: 'monthly', logic: 'manual',
//       children: [
//         { id: `${newId}_a`, label: 'a', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
//         { id: `${newId}_b`, label: 'b', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
//         { id: `${newId}_c`, label: 'c', manualValue: 0, timeframe: 'monthly', logic: 'manual', children: [] },
//       ]
//     };
//     handleUpdate(activeNode.id, { children: [...activeNode.children, newRow] });
//   };

//   const currentNode = findNode(viewPath, budgetTree);
//   const isRoot = viewPath.length === 1;

//   // Calculation Logic for UI Summary
//   const factor = displayTimeframe === 'yearly' ? 12 : 1;
//   const inc = (backendTotals['inc_01'] || 0) * factor;
//   const spe = (backendTotals['spe_01'] || 0) * factor;
//   const savingsRate = inc - spe;

//   return (
//     <div style={pageStyle}>
//       <div style={navHeader}>
//         {!isRoot && <button onClick={() => setViewPath(viewPath.slice(0, -1))} style={btnStyle}>← Back</button>}
//         <h2>{currentNode.label}</h2>
//         <div style={{marginLeft: 'auto', display: 'flex', gap: '10px'}}>
//             <button onClick={saveToFirebase} style={saveBtnStyle}>💾 Save Progress</button>
//             {/* <button onClick={loadUserData} style={saveBtnStyle}>💾 Load Progress</button> */}
//             <select value={displayTimeframe} onChange={(e) => setDisplayTimeframe(e.target.value)} style={selectStyle}>
//                 <option value="monthly">Show Monthly</option>
//                 <option value="yearly">Show Yearly</option>
//             </select>
//             <button onClick={addRow} style={addBtnStyle}>+ Add Row</button>
//             <button onClick={() => executeCalculation()} style={calcBtnStyle} disabled={isCalculating}>
//                 {isCalculating ? "..." : "🚀 Calculate"}
//             </button>
//         </div>
//       </div>

//       <div style={tableStyle}>
//         <div style={tableHeader}>
//           <div style={{ flex: 2 }}>CATEGORY</div>
//           <div style={{ flex: 1.5 }}>LOGIC</div>
//           <div style={{ flex: 1 }}>MANUAL AMT</div>
//           <div style={{ flex: 1 }}>TIMEFRAME</div>
//           <div style={{ flex: 1 }}>TOTAL</div>
//           <div style={{ width: '40px' }}></div>
//         </div>

//         {!isRoot && (
//             <div style={{...rowStyle, background: '#eef2f7', borderBottom: '2px solid #cbd5e0'}}>
//                 <div style={{ flex: 2, fontWeight: 'bold' }}>MASTER OVERWRITE</div>
//                 <div style={{ flex: 1.5 }}>
//                     <select value={currentNode.logic} onChange={(e) => handleUpdate(currentNode.id, { logic: e.target.value })} style={selectStyle}>
//                         <option value="manual">Manual Entry</option>
//                         <option value="summed">Summed Table</option>
//                     </select>
//                 </div>
//                 <div style={{ flex: 1 }}>
//                     <input type="number" value={currentNode.manualValue} onChange={(e) => handleUpdate(currentNode.id, { manualValue: e.target.value })} disabled={currentNode.logic === 'summed'} style={inputStyle} />
//                 </div>
//                 <div style={{ flex: 1 }}>
//                     <select value={currentNode.timeframe} onChange={(e) => handleUpdate(currentNode.id, { timeframe: e.target.value })} style={selectStyle}>
//                         <option value="monthly">Monthly</option>
//                         <option value="yearly">Yearly</option>
//                     </select>
//                 </div>
//                 <div style={{ flex: 1, fontWeight: 'bold' }}>${(backendTotals[currentNode.id] || 0).toFixed(2)}</div>
//                 <div style={{ width: '40px' }}></div>
//             </div>
//         )}

//         {currentNode.children.map(child => (
//           <div key={child.id} style={rowStyle}>
//             <div style={{ flex: 2, display: 'flex', gap: '8px' }}>
//                <input value={child.label} onChange={(e) => handleUpdate(child.id, { label: e.target.value })} style={nameInputStyle} />
//                <button onClick={() => setViewPath([...viewPath, child.id])} style={drillBtn}>🔍</button>
//             </div>
//             <div style={{ flex: 1.5 }}>
//               <select value={child.logic} onChange={(e) => handleUpdate(child.id, { logic: e.target.value })} style={selectStyle}>
//                 <option value="manual">Manual Entry</option>
//                 <option value="summed">Summed Table</option>
//               </select>
//             </div>
//             <div style={{ flex: 1 }}>
//               <input type="number" value={child.manualValue} onChange={(e) => handleUpdate(child.id, { manualValue: e.target.value })} disabled={child.logic === 'summed'} style={inputStyle} />
//             </div>
//             <div style={{ flex: 1 }}>
//               <select value={child.timeframe} onChange={(e) => handleUpdate(child.id, { timeframe: e.target.value })} style={selectStyle}>
//                 <option value="monthly">Monthly</option>
//                 <option value="yearly">Yearly</option>
//               </select>
//             </div>
//             <div style={{ flex: 1 }}>${(backendTotals[child.id] || 0).toFixed(2)}</div>
//             <div style={{ width: '40px' }}>{!child.isProtected && <button onClick={() => handleDelete(child.id)} style={deleteBtn}>🗑️</button>}</div>
//           </div>
//         ))}

//         <div style={{...rowStyle, background: '#f8f9fa', fontWeight: 'bold'}}>
//             <div style={{flex: 5.5}}>TABLE SUM TOTAL</div>
//             <div style={{flex: 1}}>${currentNode.children.reduce((acc, c) => acc + (backendTotals[c.id] || 0), 0).toFixed(2)}</div>
//             <div style={{width: '40px'}}></div>
//         </div>
//       </div>

//       {isRoot && (
//         <div style={summaryCard}>
//             <h3>Financial Analysis Summary ({displayTimeframe})</h3>
//             <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0'}}>
//                 <span>Total Income:</span> <strong>${inc.toFixed(2)}</strong>
//             </div>
//             <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0'}}>
//                 <span>Total Spending:</span> <strong>${spe.toFixed(2)}</strong>
//             </div>
//             <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #eee', marginTop: '10px'}}>
//                 <span>Additional Saving Rate:</span> <strong style={{color: savingsRate >= 0 ? 'green' : 'red'}}>${savingsRate.toFixed(2)}</strong>
//             </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Styles
// const saveBtnStyle = { padding: '8px 18px', background: '#9b59b6', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };
// const summaryCard = { marginTop: '30px', padding: '25px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '500px' };
// const pageStyle = { padding: '40px', background: '#f8f9fa', minHeight: '100vh' };
// const navHeader = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' };
// const tableStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' };
// const tableHeader = { display: 'flex', padding: '15px 20px', background: '#2c3e50', color: 'white' };
// const rowStyle = { display: 'flex', padding: '12px 20px', borderBottom: '1px solid #eee', alignItems: 'center' };
// const nameInputStyle = { border: 'none', borderBottom: '1px solid #ddd', padding: '4px', width: '70%' };
// const drillBtn = { background: 'none', border: 'none', cursor: 'pointer' };
// const deleteBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'red' };
// const inputStyle = { width: '80%', padding: '5px' };
// const selectStyle = { padding: '5px' };
// const btnStyle = { padding: '8px 15px', cursor: 'pointer' };
// const addBtnStyle = { padding: '8px 18px', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };
// const calcBtnStyle = { padding: '8px 22px', background: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };

// export default FinancialPlan;