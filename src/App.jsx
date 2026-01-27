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

import OrderConfirmation from './pages/OrderConfirmation'
import Checkout from './pages/Checkout'
import PublicMenu from './pages/PublicMenu'
import AdminDashboard from './pages/AdminDashboard'
import PlanDetails from './pages/PlanDetails'
import TestMenu from './pages/TestMenu'

import PublicMenuPizza1 from './pages/PublicMenuPizza1'
import ManageMenu from './pages/ManageMenu'
import PublicMenuTestemplate2 from './pages/PublicMenuTestemplate2'

import ScrollToTop from './components/ScrollToTop'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { ClientAuthProvider } from './context/ClientAuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import PersistentOrderTracker from './components/PersistentOrderTracker'
import PWAInstallPrompt from './components/PWAInstallPrompt'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ClientAuthProvider>
          <ThemeProvider>
            <CartProvider>
              <Router>
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



                    <Route path="settings" element={<Settings />} />
                  </Route>

                  <Route path="/profile" element={<Navigate to="/dashboard" replace />} />

                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/pricing/:planId" element={<PlanDetails />} />
                  <Route path="/order/:orderId" element={<OrderConfirmation />} />
                  <Route path="/testme" element={<TestMenu />} />
                  <Route path="/menu-pizza1" element={<PublicMenuPizza1 />} />
                  <Route path="/menu-testemplate" element={<PublicMenuTestemplate />} />
                  <Route path="/menu-testemplate2" element={<PublicMenuTestemplate2 />} />
                  <Route path="/menu/:templateKey" element={<PublicMenu />} />

                  {/* Unified Management Route */}
                  <Route path="/manage-menu/:templateKey" element={<ManageMenu />} />

                  {/* Admin Management Routes - Reusing same component */}
                  <Route path="/manage-template/:templateKey" element={<ManageMenu isAdminView={true} />} />

                  {/* Public Menu Route - Must be last to avoid conflicts */}
                  <Route path="/:restaurantName" element={<PublicMenu />} />
                </Routes>
              </Router>
            </CartProvider>
          </ThemeProvider>
        </ClientAuthProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
