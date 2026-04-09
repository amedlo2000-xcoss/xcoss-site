import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './BottomNav.css'

const navItems = [
  { label: 'ホーム', icon: '🏠', path: '/' },
  { label: 'イベント', icon: '🎪', path: '/events' },
  { label: 'チケット', icon: '🎟️', path: '/mypage' },
  { label: '出店者', icon: '🏪', path: '/#vendors' },
  { label: 'マイページ', icon: '👤', path: '/mypage' },
]

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // 管理者ページでは非表示
  if (location.pathname.startsWith('/admin')) return null
  // 紹介者ページはそのまま表示

  const handleNav = (item) => {
    if (item.path === '/#vendors') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById('vendors')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return
    }
    if ((item.path === '/mypage' || item.path === '/events') && !isAuthenticated) {
      navigate('/login')
      return
    }
    navigate(item.path)
  }

  const isActive = (item) => {
    if (item.path === '/#vendors') return location.pathname === '/'
    return location.pathname === item.path
  }

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
    </nav>
  )
}

export default BottomNav
