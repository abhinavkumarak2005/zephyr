import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ReactLenis } from '@studio-freight/react-lenis'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Auth from './Auth'
import AdminAuth from './pages/AdminAuth'
import VolunteerAuth from './pages/VolunteerAuth'
import VolunteerDashboard from './pages/VolunteerDashboard'

function App() {
  return (
    <ReactLenis root>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-login" element={<AdminAuth />} />
          <Route path="/volunteer-login" element={<VolunteerAuth />} />
          <Route path="/volunteer" element={<VolunteerDashboard />} />
        </Routes>
      </BrowserRouter>
    </ReactLenis>
  )
}

export default App
