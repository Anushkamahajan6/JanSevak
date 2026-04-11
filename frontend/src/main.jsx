import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from "./context/userContext.jsx"; 
import "mapbox-gl/dist/mapbox-gl.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <UserProvider>
        <App />
      </UserProvider>
  </StrictMode>,
)
