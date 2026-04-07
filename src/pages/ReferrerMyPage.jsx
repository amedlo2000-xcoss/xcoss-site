import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../ReferrerMyPage.css'

function ReferrerMyPage() {
  const [code, setCode] = useState('')
  const [referrer, setReferrer] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setReferrer(null)
    setReferrals([])

    const { data: referrerData, error: referrerError } = await supabase
      .from('referrers')
      .select('*')
      .eq('code', code.trim())
      .single()

    if (referrerError || !referrerData) {
      setError('紹介コードが見つかりません。もう一度確認してください。')
      setLoading(false)
      return
    }

    // 紹介実績を取得
    const { data: referralsData } = await supabase
      .from('referrals')
      .select('*, exhibitors(shop_name, title, status, created_at)')
      .eq('referrer_id', referrerData.id)
      .order('created_at', { ascending: false })

    setReferrer(referrerData)
    setReferrals(referralsData || [])
    setLoading(false)
  }

  const referralLink = referrer
    ? `${window.location.origin}/apply?ref=${referrer.code}`
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    setReferrer(null)
    setReferrals([])
    setCode('')
    setError('')
  }

  const statusLabel = (status) => {
    switch (status) {
      case 'approved': return { text: '承認済み', cls: 'approved' }
      case 'pending': return { text: '審査待ち', cls: 'pending' }
      case 'rejected': return { text: '却下', cls: 'rejected' }
      default: return { text: status, cls: '' }
    }
  }

  // ログイン前
  if (!referrer) {
    return (
      <div className="referrer-page">
        <div className="referrer-login-box">
          <h1 className="referrer-login-title">紹介者マイページ</h1>
          <p className="referrer-login-desc">紹介コードを入力してログインしてください。</p>
          {error && <p className="referrer-error">{error}</p>}
          <form onSubmit={handleLogin} className="referrer-login-form">
            <input
              className="referrer-code-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="例：XCOSS-XXXXXX"
              required
            />
            <button className="referrer-login-btn" type="submit" disabled={loading}>
              {loading ? '確認中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ログイン後（マイページ）
  return (
    <div className="referrer-page">
      <div className="referrer-header">
        <h1 className="referrer-header-title">紹介者マイページ</h1>
        <button className="referrer-logout-btn" onClick={handleLogout}>ログアウト</button>
      </div>

      <div className="referrer-container">

        {/* プロフィール */}
        <div className="referrer-card-box">
          <h2 className="referrer-section-title">プロフィール</h2>
          <p className="referrer-info">👤 {referrer.nickname || referrer.name}</p>
          <p className="referrer-info">📧 {referrer.email}</p>
          <p className="referrer-info">🔑 紹介コード：<strong>{referrer.code}</strong></p>
        </div>

        {/* 紹介リンク */}
        <div className="referrer-card-box">
          <h2 className="referrer-section-title">紹介リンク</h2>
          <p className="referrer-link-desc">このリンクを出店希望者に共有してください。</p>
          <div className="referrer-link-wrap">
            <input
              className="referrer-link-input"
              type="text"
              value={referralLink}
              readOnly
            />
            <button className="referrer-copy-btn" onClick={handleCopy}>
              {copied ? '✅ コピー済み' : 'コピー'}
            </button>
          </div>
        </div>

        {/* 紹介実績 */}
        <div className="referrer-card-box">
          <h2 className="referrer-section-title">
            紹介実績
            <span className="referrer-count-badge">{referrals.length}件</span>
          </h2>
          {referrals.length === 0 ? (
            <p className="referrer-empty">まだ紹介実績はありません。</p>
          ) : (
            <div className="referrer-referrals-list">
              {referrals.map((rel) => {
                const s = statusLabel(rel.exhibitors?.status)
                return (
                  <div key={rel.id} className="referrer-referral-card">
                    <div className="referrer-referral-header">
                      <span className="referrer-referral-shop">{rel.exhibitors?.shop_name || '-'}</span>
                      <span className={`referrer-status-badge ${s.cls}`}>{s.text}</span>
                    </div>
                    <p className="referrer-referral-title">{rel.exhibitors?.title || ''}</p>
                    <p className="referrer-referral-date">申込日：{new Date(rel.created_at).toLocaleDateString('ja-JP')}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ReferrerMyPage
