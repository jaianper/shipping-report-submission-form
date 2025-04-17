import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RSFApp from './RSFApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RSFApp />
  </StrictMode>,
)
