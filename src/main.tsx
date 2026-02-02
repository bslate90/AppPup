import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { PupProvider } from './contexts/PupContext'
import { AuthGuard } from './components/auth/AuthGuard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGuard>
        <PupProvider>
          <App />
        </PupProvider>
      </AuthGuard>
    </AuthProvider>
  </StrictMode>,
)
