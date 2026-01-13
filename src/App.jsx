import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Demo from './pages/Demo'
import Login from './pages/Login'
import ScrollToTop from './components/ScrollToTop'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
