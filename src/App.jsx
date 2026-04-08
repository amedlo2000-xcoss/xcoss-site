import { Routes, Route } from 'react-router-dom'
import './App.css'
import TopPage from './pages/TopPage'
import ExhibitorDetail from './pages/ExhibitorDetail'
import ApplyPage from './pages/ApplyPage'
import AdminLogin from './pages/AdminLogin'
import AdminPage from './pages/AdminPage'
import AdminEditPage from './pages/AdminEditPage'
import AdminContactsPage from './pages/AdminContactsPage'
import AdminEventsPage from './pages/AdminEventsPage'
import AdminReferrersPage from './pages/AdminReferrersPage'
import ReferrerMyPage from './pages/ReferrerMyPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import UpdatePasswordPage from './pages/UpdatePasswordPage'
import UserMyPage from './pages/UserMyPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AdminRewardsPage from './pages/AdminRewardsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/exhibitor/:id" element={<ExhibitorDetail />} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/edit/:id" element={<AdminEditPage />} />
      <Route path="/admin/contacts" element={<AdminContactsPage />} />
      <Route path="/admin/events" element={<AdminEventsPage />} />
      <Route path="/admin/referrers" element={<AdminReferrersPage />} />
      <Route path="/referrer" element={<ReferrerMyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/mypage" element={<UserMyPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/admin/rewards" element={<AdminRewardsPage />} />
    </Routes>
  )
}

export default App
