import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { Navbar } from './components/layout/Navbar'
import { AppRoutes } from './routes/AppRoutes'
function App() { return <BrowserRouter><AuthProvider><ToastProvider><div className="min-h-screen bg-pixel-bg text-pixel-cream"><Navbar/><AppRoutes/></div></ToastProvider></AuthProvider></BrowserRouter> }
export default App
