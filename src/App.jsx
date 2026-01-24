import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Demo from './pages/Demo'
import Login from './pages/Login'
// import Profile from './pages/Profile' // Deprecated
import Dashboard from './pages/Dashboard'
import Overview from './pages/dashboard/Overview'
import MenuManagement from './pages/dashboard/MenuManagement'
import Analytics from './pages/dashboard/Analytics'
import Team from './pages/dashboard/Team'
import Promotions from './pages/dashboard/Promotions'
import Activity from './pages/dashboard/Activity'
import Settings from './pages/dashboard/Settings'
import BillingSettings from './pages/dashboard/BillingSettings'

import OrderConfirmation from './pages/OrderConfirmation'
import Checkout from './pages/Checkout'
import PublicMenu from './pages/PublicMenu'
import AdminDashboard from './pages/AdminDashboard'
import PlanDetails from './pages/PlanDetails'
import TestMenu from './pages/TestMenu'
import Simulator from './pages/Simulator'
import IntegrationSettings from './components/dashboard/IntegrationSettings'
import ScrollToTop from './components/ScrollToTop'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import PersistentOrderTracker from './components/PersistentOrderTracker'
import PWAInstallPrompt from './components/PWAInstallPrompt'

function App() {
  const [activeOrderId, setActiveOrderId] = React.useState(() => {
    return localStorage.getItem('activeOrderId') || null
  })

  // Listen for new orders
  React.useEffect(() => {
    const handleNewOrder = (event) => {
      const orderId = event.detail?.orderId
      if (orderId) {
        setActiveOrderId(orderId)
        localStorage.setItem('activeOrderId', orderId)
      }
    }

    window.addEventListener('orderPlaced', handleNewOrder)
    return () => window.removeEventListener('orderPlaced', handleNewOrder)
  }, [])

  const handleCloseTracker = () => {
    setActiveOrderId(null)
    localStorage.removeItem('activeOrderId')
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <Router>
              {activeOrderId && (
                <PersistentOrderTracker
                  orderId={activeOrderId}
                  onClose={handleCloseTracker}
                />
              )}
              <PWAInstallPrompt />
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<Dashboard />}>
                  <Route index element={<Overview />} />
                  <Route path="menu" element={<MenuManagement />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="team" element={<Team />} />
                  <Route path="promos" element={<Promotions />} />
                  <Route path="activity" element={<Activity />} />

                  <Route path="payments" element={<div className="animate-fade-in shadow-2xl rounded-[3rem] overflow-hidden"><IntegrationSettings /></div>} />
                  <Route path="simulator" element={<div className="animate-fade-in shadow-2xl rounded-[3rem] overflow-hidden"><Simulator /></div>} />
                  <Route path="billing" element={<BillingSettings />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="/profile" element={<Navigate to="/dashboard" replace />} />

                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pricing/:planId" element={<PlanDetails />} />
                <Route path="/order/:orderId" element={<OrderConfirmation />} />
                <Route path="/testme" element={<TestMenu />} />
                {/* <Route path="/simulator" element={<Simulator />} /> */}
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
