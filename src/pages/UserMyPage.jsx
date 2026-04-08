import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../UserMyPage.css'

function UserMyPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [participations, setParticipations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: profileData }, { data: participationsData }] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      supabase.from('event_participations').select('*, events(name, date, venue)').eq('guest_user_id', user.id).order('participated_at', { ascending: false }),
    ])
    if (profileData) setProfile(profileData)
    if (participationsData) setParticipations(participationsData)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (isLoading || loading) return (
    <div className="user-mypage">
      <p className="user-loading">読み込み中...</p>
    </div>
  )

  return (
    <div className="user-mypage">
      <div className="user-header">
        <h1 className="user-header-title">マイページ</h1>
        <div className="user-header-actions">
          <Link to="/" className="user-back-btn">← トップへ</Link>
          <button className="user-logout-btn" onClick={handleLogout}>ログアウト</button>
        </div>
      </div>

      <div className="user-container">

        {/* プロフィール */}
        <div className="user-card-box">
          <h2 className="user-section-title">プロフィール</h2>
          <div className="user-profile-info">
            <p className="user-info">👤 {profile?.nickname || profile?.name || 'ユーザー'}</p>
            <p className="user-info">📧 {user?.email}</p>
            {profile?.name && <p className="user-info">🏷️ {profile.name}</p>}
            {profile?.referral_code_used && (
              <p className="user-info">🔑 紹介コード：{profile.referral_code_used}</p>
            )}
          </div>
        </div>

        {/* イベント参加履歴 */}
        <div className="user-card-box">
          <h2 className="user-section-title">
            イベント参加履歴
            <span className="user-count-badge">{participations.length}件</span>
          </h2>
          {participations.length === 0 ? (
            <div className="user-empty">
              <p>まだイベント参加履歴はありません。</p>
              <Link to="/" className="user-cta-btn">イベントを見る</Link>
            </div>
          ) : (
            <div className="user-participation-list">
              {participations.map((p) => (
                <div key={p.id} className="user-participation-card">
                  <div className="user-participation-header">
                    <span className="user-participation-name">{p.events?.name || 'イベント'}</span>
                    <span className={`user-participation-status ${p.status}`}>
                      {p.status === 'attended' ? '参加済み' : p.status === 'applied' ? '申込済み' : p.status}
                    </span>
                  </div>
                  {p.events?.date && <p className="user-participation-date">📅 {p.events.date}</p>}
                  {p.events?.venue && <p className="user-participation-venue">📍 {p.events.venue}</p>}
                  <p className="user-participation-at">登録日：{new Date(p.participated_at).toLocaleDateString('ja-JP')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default UserMyPage
