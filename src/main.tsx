import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Disable React.StrictMode to prevent double rendering issues
createRoot(document.getElementById('root')!).render(
  <App />
)