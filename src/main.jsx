import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import xcossLogo from './assets/xcoss-logo.jpg'
import xcossLogo2 from './assets/xcoss-logo2.jpeg'

// body全体にロゴ背景を設定
document.body.style.setProperty('--logo-url', `url(${xcossLogo})`)
document.body.style.setProperty('--logo2-url', `url(${xcossLogo2})`)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
