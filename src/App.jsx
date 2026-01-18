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
import TestMenu from './pages/TestMenu'
import GeneratedMenu from './pages/GeneratedMenu'
import ManageMenu from './pages/ManageMenu'
import ScrollToTop from './components/ScrollToTop'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
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
                <Route path="/testme" element={<TestMenu />} />
                {/* AI Generated Menu Routes */}
                <Route path="/menu/:slug" element={<GeneratedMenu />} />
                <Route path="/manage/:slug" element={<ManageMenu />} />
                {/* Public Menu Route - Must be last to avoid conflicts */}
                <Route path="/:restaurantName" element={<PublicMenu />} />
              </Routes>
            </Router>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
