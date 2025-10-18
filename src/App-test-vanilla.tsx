// Ultra-minimal vanilla JS test - no React imports
console.log('🚀 App-test-vanilla.tsx: Loading...');

const AppTestVanilla = () => {
  console.log('🎬 App-test-vanilla.tsx: Function called');

  // Pure DOM manipulation - no React
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #f0f0f0; min-height: 100vh; font-family: Arial;">
        <h1 style="color: #000;">🎯 Vanilla JS Test - ${new Date().toLocaleString()}</h1>
        <p>✅ JavaScript is working!</p>
        <p>✅ Module loading is working!</p>
        <p>✅ DOM manipulation is working!</p>
        <button onclick="alert('Button clicked!')">Test Button</button>
      </div>
    `;
  } else {
    console.error('❌ Root element not found!');
  }
};

console.log('🎯 App-test-vanilla.tsx: Calling function...');
AppTestVanilla();

export default AppTestVanilla;