function App() {
  console.log('Simple App component rendering...');

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>Project Planner - Simple Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' }}>
        <h2>Test Content</h2>
        <p>This is a simple test to verify React rendering works.</p>
        <button onClick={() => alert('Button clicked!')}>Test Button</button>
      </div>
    </div>
  );
}

export default App;