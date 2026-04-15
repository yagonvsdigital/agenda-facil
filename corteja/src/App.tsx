import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { connectSocket } from '@/services/socket'
import { requestNotificationPermission } from '@/services/notifications'

import Landing from '@/pages/public/Landing'
import BookingPage from '@/pages/public/BookingPage'
import Login from '@/pages/auth/Login'
import RegisterBarber from '@/pages/auth/RegisterBarber'
import RegisterClient from '@/pages/auth/RegisterClient'
import BarberDashboard from '@/pages/barber/BarberDashboard'
import BarberSchedule from '@/pages/barber/BarberSchedule'
import BarberQRCode from '@/pages/barber/BarberQRCode'
import BarberSettings from '@/pages/barber/BarberSettings'
import ClientDashboard from '@/pages/client/ClientDashboard'
import ClientBarberView from '@/pages/client/ClientBarberView'
import ClientScan from '@/pages/client/ClientScan'
import ClientNotifications from '@/pages/client/ClientNotifications'

function AuthGuard({ children, role }: { children: React.ReactNode; role: 'barber' | 'client' }) {
  const { currentUser } = useStore()
  if (!currentUser || currentUser.role !== role) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  const { token, currentUser, loadBarberProfile, loadAppointments } = useStore()

  useEffect(() => {
    requestNotificationPermission()
    if (token && currentUser) {
      connectSocket(token)
      if (currentUser.role === 'barber') loadBarberProfile()
      loadAppointments()
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/barber" element={<RegisterBarber />} />
      <Route path="/register/client" element={<RegisterClient />} />
      <Route path="/book/:barberId" element={<BookingPage />} />

      <Route path="/barber/dashboard" element={<AuthGuard role="barber"><BarberDashboard /></AuthGuard>} />
      <Route path="/barber/schedule" element={<AuthGuard role="barber"><BarberSchedule /></AuthGuard>} />
      <Route path="/barber/qrcode" element={<AuthGuard role="barber"><BarberQRCode /></AuthGuard>} />
      <Route path="/barber/settings" element={<AuthGuard role="barber"><BarberSettings /></AuthGuard>} />

      <Route path="/client/dashboard" element={<AuthGuard role="client"><ClientDashboard /></AuthGuard>} />
      <Route path="/client/barber/:barberId" element={<AuthGuard role="client"><ClientBarberView /></AuthGuard>} />
      <Route path="/client/scan" element={<AuthGuard role="client"><ClientScan /></AuthGuard>} />
      <Route path="/client/notifications" element={<AuthGuard role="client"><ClientNotifications /></AuthGuard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
