import { useState } from 'react';

const FinancialPlan = ({ apiBase }) => {
  const [msg, setMsg] = useState("Ready for calculation...");

  const handleFetch = async () => {
    try {
      const res = await fetch(`${apiBase}/finance`);
      const data = await res.json();
      setMsg(data.message);
    } catch (err) {
      setMsg("Connection error.");
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>💰 Financial Planning</h1>
      <p>Manage your construction cost analysis and zoning permit fees.</p>
      <button onClick={handleFetch} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Calculate Pro-Forma
      </button>
      <p><strong>Result:</strong> {msg}</p>
    </div>
  );
};

export default FinancialPlan;