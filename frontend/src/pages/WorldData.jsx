import { useState } from 'react';

const WorldData = ({ apiBase }) => {
  const [data, setData] = useState("");
  
  const fetchData = async () => {
    const res = await fetch(`${apiBase}/world`);
    const result = await res.json();
    setData(result.message);
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>World Data Center</h1>
      <button onClick={fetchData}>Load Global Metrics</button>
      <p>{data}</p>
    </div>
  );
};

export default WorldData;