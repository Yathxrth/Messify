import './App.css'
import { Routes, Route } from 'react-router-dom'
import AuthSystem from './page/login.jsx'
import MessMembersDirectory from './page/members.jsx'
import NotificationsPage from './page/notificationPage.jsx'
import FeedbackForm from './page/Feedback.jsx'
import Complaints from './page/Complaints.jsx'
import Profile from './page/Profile.jsx'
import Navbar from './page/nav.jsx'
import Home from './page/Home.jsx'
import Menu from './page/Menu.jsx'
import OptOut from './page/OptOut.jsx'
import WorkerDashboard from './page/WorkerDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/members" element={<MessMembersDirectory />} />
        <Route path="/login" element={<AuthSystem />} />
        <Route
          path="/notification"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints"
          element={
            <ProtectedRoute roles={['student']}>
              <Complaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={['student', 'worker', 'admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/optout"
          element={
            <ProtectedRoute roles={['student']}>
              <OptOut />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-dashboard"
          element={
            <ProtectedRoute roles={['worker', 'admin']}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
