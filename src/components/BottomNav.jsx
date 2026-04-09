import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './BottomNav.css'

const navItems = [
  { label: 'ホーム', icon: '🏠', path: '/' },
  { label: 'マイページ', icon: '👤', path: '/mypage' },
  { label: 'イベント', icon: '🎪', path: '/events' },
  { label: '幹事', icon: '🤝', path: '/referrer' },
]

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // 管理者ページでは非表示
  if (location.pathname.startsWith('/admin')) return null

  const handleNav = (item) => {
    if ((item.path === '/mypage' || item.path === '/events') && !isAuthenticated) {
      navigate('/login')
      return
    }
    navigate(item.path)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isActive = (item) => location.pathname === item.path

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.label}
          className={`bottom-nav-item ${isActive(item) ? 'active' : ''}`}
          onClick={() => handleNav(item)}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
      <button className="bottom-nav-item logout" onClick={handleLogout}>
        <span className="bottom-nav-icon">🚪</span>
        <span className="bottom-nav-label">ログアウト</span>
      </button>
    </nav>
  )
}

export default BottomNav
