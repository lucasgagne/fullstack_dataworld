import { useEffect, useState } from 'react'

function App() {
  const [msg, setMsg] = useState("Loading...")

  useEffect(() => {
    // This tells React to go grab data from the Python server
    fetch('https://dataworld-mfya.onrender.com/')
      .then(res => res.json())
      .then(data => {
        setMsg(data.message); // This replaces "Loading..." with the real message
      })
      .catch(err => {
        setMsg("Backend not found! Check your Python terminal.");
        console.error(err);
      });
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>Fullstack Connection Test</h1>
      <div style={{ padding: '20px', border: '2px solid #646cff', display: 'inline-block', borderRadius: '10px' }}>
        <h2 style={{ color: '#646cff' }}>{msg}</h2>
      </div>
    </div>
  )
}

export default App