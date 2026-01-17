import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Demo from './pages/Demo'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import PublicMenu from './pages/PublicMenu'
import AdminDashboard from './pages/AdminDashboard'
import PlanDetails from './pages/PlanDetails'
import ScrollToTop from './components/ScrollToTop'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pricing/:planId" element={<PlanDetails />} />
              {/* Public Menu Route - Must be last to avoid conflicts */}
              <Route path="/:restaurantName" element={<PublicMenu />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
