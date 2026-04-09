import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import AuthVerifyPage from './pages/AuthVerifyPage'
import SubmitPage from './pages/SubmitPage'
import TankView from './pages/TankView'
import Dashboard from './pages/Dashboard'
import ManagePage from './pages/ManagePage'
import DevCoralTestPage from './pages/DevCoralTestPage'
import SetupPage from './pages/SetupPage'
import DevTreeTestPage from './pages/DevTreeTestPage'
import LandingPage from './pages/LandingPage'
import DemoView from './pages/DemoView'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo/reef"   element={<DemoView theme="reef" />} />
          <Route path="/demo/tree"   element={<DemoView theme="tree" />} />
          <Route path="/demo/creek"  element={<DemoView theme="creek" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/verify/:token" element={<AuthVerifyPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/tank/:deploymentId" element={<TankView />} />
          <Route path="/dashboard/:deploymentId" element={<Dashboard />} />
          <Route path="/manage/:deploymentId" element={<ManagePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/dev/coral" element={<DevCoralTestPage />} />
          <Route path="/dev/tree" element={<DevTreeTestPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
