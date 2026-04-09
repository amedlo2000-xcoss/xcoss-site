import { useEffect, useState } from 'react'
import xcossLogo from '../assets/xcoss-logo.jpg'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../UserMyPage.css'

function UserMyPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [participations, setParticipations] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const [emailResent, setEmailResent] = useState(false)

  const handleResendEmail = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    })
    if (!error) setEmailResent(true)
  }

  const fetchData = async () => {
    setLoading(true)
    const [{ data: profileData }, { data: participationsData }, { data: ticketsData }] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      supabase.from('event_participations').select('*, events(name, date, venue)').eq('guest_user_id', user.id).order('participated_at', { ascending: false }),
      supabase.from('tickets').select('*, events(name, date, venue)').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }),
    ])
    if (profileData) setProfile(profileData)
    if (participationsData) setParticipations(participationsData)
    if (ticketsData) setTickets(ticketsData)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (isLoading || loading) return (
    <div className="user-mypage" style={{ "--logo-url": `url(${xcossLogo})` }}>
      <p className="user-loading">読み込み中...</p>
    </div>
  )

  return (
    <div className="user-mypage" style={{ "--logo-url": `url(${xcossLogo})` }}>
      <div className="user-header">
        <h1 className="user-header-title">マイページ</h1>
        <div className="user-header-actions">
          <Link to="/" className="user-back-btn">← トップへ</Link>
          <button className="user-logout-btn" onClick={handleLogout}>ログアウト</button>
        </div>
      </div>

      {user && !user.email_confirmed_at && (
        <div className="user-email-warning">
          <p>📧 メールアドレスの確認が完了していません。</p>
          <p>登録時に送信した確認メールをご確認ください。</p>
          {emailResent ? (
            <p className="user-email-resent">✅ 確認メールを再送しました！</p>
          ) : (
            <button className="user-resend-btn" onClick={handleResendEmail}>
              確認メールを再送する
            </button>
          )}
        </div>
      )}
      <div className="user-page-wrapper">
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
            <p className="user-info">📅 登録日：{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : '-'}</p>
          </div>
        </div>

        {/* イベントボタン */}
        <div className="user-card-box">
          <h2 className="user-section-title">イベント</h2>
          <div className="user-event-actions">
            <Link to="/events" className="user-cta-btn">🎪 イベント一覧を見る</Link>
          </div>
        </div>

        {/* 入場券一覧 */}
        <div className="user-card-box">
          <h2 className="user-section-title">
            発行済み入場券
            <span className="user-count-badge">{tickets.length} / 3件</span>
          </h2>
          {tickets.length === 0 ? (
            <div className="user-empty">
              <p>まだ入場券はありません。</p>
              <Link to="/events" className="user-cta-btn">イベントを見る</Link>
            </div>
          ) : (
            <div className="user-participation-list">
              {tickets.map((t) => (
                <div key={t.id} className="user-ticket-card">
                  <div className="user-ticket-header">
                    <span className="user-ticket-event">{t.events?.name || 'イベント'}</span>
                    <span className="user-ticket-status">有効</span>
                  </div>
                  <div className="user-ticket-code">{t.ticket_code}</div>
                  {t.events?.date && <p className="user-participation-date">📅 {t.events.date}</p>}
                  {t.events?.venue && <p className="user-participation-venue">📍 {t.events.venue}</p>}
                </div>
              ))}
            </div>
          )}
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
    </div>
  )
}

export default UserMyPage
