import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Back to working App import
import App from './App.tsx'

console.log('🚀 main.tsx: Starting React application...');

const rootElement = document.getElementById('root');
console.log('📦 main.tsx: Root element found:', rootElement);

if (!rootElement) {
  console.error('❌ main.tsx: Root element not found!');
  throw new Error('Root element not found');
}

console.log('🎯 main.tsx: Creating React root...');
const root = createRoot(rootElement);

console.log('🎨 main.tsx: Rendering App component...');
try {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ main.tsx: App rendered successfully!');
} catch (error) {
  console.error('❌ main.tsx: Error rendering App:', error);
}
