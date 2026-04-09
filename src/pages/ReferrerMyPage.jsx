import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../ReferrerMyPage.css'

// 月別集計ヘルパー
const getMonthKey = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const getLast6Months = () => {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

const formatMonth = (key) => {
  const [y, m] = key.split('-')
  return `${y}年${parseInt(m)}月`
}

function ActivityGraph({ referralsData, participationsData, guestReferralsData }) {
  const months = getLast6Months()
  const thisMonth = months[months.length - 1]

  // 月別集計
  const monthlyData = months.map((m) => {
    const referrals = referralsData.filter(r => getMonthKey(r.created_at) === m).length
    const participations = participationsData.filter(p => getMonthKey(p.participated_at) === m).length
    const guests = guestReferralsData.filter(g => getMonthKey(g.referred_at) === m && g.is_new_guest).length
    const score = referrals * 5 + participations * 2 + guests * 4
    return { month: m, referrals, participations, guests, score }
  })

  const thisMonthData = monthlyData.find(m => m.month === thisMonth) || { referrals: 0, participations: 0, guests: 0, score: 0 }
  const lastMonth = months[months.length - 2]
  const lastMonthData = monthlyData.find(m => m.month === lastMonth) || { referrals: 0, participations: 0, guests: 0, score: 0 }
  const maxScore = Math.max(...monthlyData.map(m => m.score), 1)

  const diff = (curr, prev) => {
    const d = curr - prev
    if (d > 0) return { text: `+${d}`, cls: 'diff-up' }
    if (d < 0) return { text: `${d}`, cls: 'diff-down' }
    return { text: '±0', cls: 'diff-none' }
  }

  // 活動指数レベル
  const getLevel = (score) => {
    if (score >= 30) return { label: 'S', color: '#e94560' }
    if (score >= 20) return { label: 'A', color: '#f39c12' }
    if (score >= 10) return { label: 'B', color: '#2ecc71' }
    if (score >= 5) return { label: 'C', color: '#3498db' }
    return { label: 'D', color: '#95a5a6' }
  }

  const level = getLevel(thisMonthData.score)

  return (
    <div className="referrer-card-box">
      <h2 className="referrer-section-title">今月の活動インジケーター</h2>

      {/* 活動指数 */}
      <div className="activity-indicator">
        <div className="activity-score-wrap">
          <div className="activity-level-badge" style={{ background: level.color }}>
            {level.label}
          </div>
          <div className="activity-score-info">
            <span className="activity-score-num">{thisMonthData.score}</span>
            <span className="activity-score-label">ポイント</span>
          </div>
        </div>
        <div className="activity-score-bar-wrap">
          <div
            className="activity-score-bar"
            style={{ width: `${Math.min((thisMonthData.score / 30) * 100, 100)}%`, background: level.color }}
          />
        </div>
        <p className="activity-score-desc">
          出店紹介×5pt・イベント参加×2pt・ゲスト紹介×4pt
        </p>
      </div>

      {/* 月別棒グラフ */}
      <h3 className="activity-graph-title">月別活動実績</h3>
      <div className="activity-graph">
        {monthlyData.map((m) => (
          <div key={m.month} className="activity-bar-col">
            <div className="activity-bar-stack">
              <div
                className="activity-bar referrals-bar"
                style={{ height: `${(m.referrals * 5 / maxScore) * 120}px` }}
                title={`出店紹介: ${m.referrals}件`}
              />
              <div
                className="activity-bar participations-bar"
                style={{ height: `${(m.participations * 2 / maxScore) * 120}px` }}
                title={`イベント参加: ${m.participations}回`}
              />
              <div
                className="activity-bar guests-bar"
                style={{ height: `${(m.guests * 4 / maxScore) * 120}px` }}
                title={`ゲスト紹介: ${m.guests}名`}
              />
            </div>
            <span className="activity-bar-label">{formatMonth(m.month).replace('年', '/').replace('月', '')}</span>
          </div>
        ))}
      </div>

      {/* グラフ凡例 */}
      <div className="activity-legend">
        <span className="legend-item"><span className="legend-dot referrals-dot" />出店紹介</span>
        <span className="legend-item"><span className="legend-dot participations-dot" />イベント参加</span>
        <span className="legend-item"><span className="legend-dot guests-dot" />ゲスト紹介</span>
      </div>

      {/* 今月サマリー */}
      <h3 className="activity-graph-title" style={{ marginTop: '24px' }}>今月のサマリー</h3>
      <div className="activity-summary">
        <div className="summary-card">
          <span className="summary-icon">🏪</span>
          <span className="summary-value">{thisMonthData.referrals}件</span>
          <span className="summary-label">出店紹介</span>
          <span className="summary-pt">+{thisMonthData.referrals * 5}pt</span>
          <span className={`summary-diff ${diff(thisMonthData.referrals, lastMonthData.referrals).cls}`}>
            先月比 {diff(thisMonthData.referrals, lastMonthData.referrals).text}件
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-icon">📅</span>
          <span className="summary-value">{thisMonthData.participations}回</span>
          <span className="summary-label">イベント参加</span>
          <span className="summary-pt">+{thisMonthData.participations * 2}pt</span>
          <span className={`summary-diff ${diff(thisMonthData.participations, lastMonthData.participations).cls}`}>
            先月比 {diff(thisMonthData.participations, lastMonthData.participations).text}回
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-icon">👥</span>
          <span className="summary-value">{thisMonthData.guests}名</span>
          <span className="summary-label">ゲスト紹介</span>
          <span className="summary-pt">+{thisMonthData.guests * 4}pt</span>
          <span className={`summary-diff ${diff(thisMonthData.guests, lastMonthData.guests).cls}`}>
            先月比 {diff(thisMonthData.guests, lastMonthData.guests).text}名
          </span>
        </div>
      </div>
    </div>
  )
}

function ReferrerMyPage() {
  const [code, setCode] = useState('')
  const [referrer, setReferrer] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [rewards, setRewards] = useState([])
  const [participations, setParticipations] = useState([])
  const [guestReferrals, setGuestReferrals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setReferrer(null)

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

    const [
      { data: referralsData },
      { data: rewardsData },
      { data: participationsData },
      { data: guestReferralsData },
    ] = await Promise.all([
      supabase.from('referrals').select('*, exhibitors(shop_name, title, status, created_at)').eq('referrer_id', referrerData.id).order('created_at', { ascending: false }),
      supabase.from('referral_rewards').select('*, exhibitors(shop_name)').eq('referrer_id', referrerData.id),
      supabase.from('event_participations').select('*').eq('referrer_id', referrerData.id),
      supabase.from('guest_referrals').select('*').eq('referrer_id', referrerData.id),
    ])

    setReferrer(referrerData)
    setReferrals(referralsData || [])
    setRewards(rewardsData || [])
    setParticipations(participationsData || [])
    setGuestReferrals(guestReferralsData || [])
    setLoading(false)
  }

  const referralLink = referrer ? `${window.location.origin}/apply?ref=${referrer.code}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    setReferrer(null)
    setReferrals([])
    setRewards([])
    setParticipations([])
    setGuestReferrals([])
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

  if (!referrer) {
    return (
      <div className="referrer-page">
        <div className="referrer-login-box">
          <div className="referrer-login-logo">🤝</div>
          <h1 className="referrer-login-title">幹事マイページ</h1>
          <p className="referrer-login-subtitle">XCOSS 幹事専用</p>
          <p className="referrer-login-desc">発行された紹介コードを入力してログインしてください。</p>
          {error && <p className="referrer-error">{error}</p>}
          <form onSubmit={handleLogin} className="referrer-login-form">
            <div className="referrer-input-wrap">
              <span className="referrer-input-icon">🔑</span>
              <input
                className="referrer-code-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="例：XCOSS-XXXXXX"
                required
              />
            </div>
            <button className="referrer-login-btn" type="submit" disabled={loading}>
              {loading ? '確認中...' : '幹事ページにログイン'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="referrer-page">
      <div className="referrer-header">
        <h1 className="referrer-header-title">幹事ダッシュボード</h1>
        <button className="referrer-logout-btn" onClick={handleLogout}>ログアウト</button>
      </div>

      <div className="referrer-container">

        {/* プロフィールカード */}
        <div className="referrer-profile-hero">
          <div className="referrer-profile-avatar">🤝</div>
          <div className="referrer-profile-info">
            <p className="referrer-profile-name">{referrer.nickname || referrer.name}</p>
            <p className="referrer-profile-role">XCOSS 幹事メンバー</p>
          </div>
          <div className="referrer-profile-code-badge">
            <span className="referrer-profile-code-label">紹介コード</span>
            <span className="referrer-profile-code-value">{referrer.code}</span>
          </div>
        </div>

        {/* 活動インジケーター */}
        <ActivityGraph
          referralsData={referrals}
          participationsData={participations}
          guestReferralsData={guestReferrals}
        />

        {/* 紹介リンク */}
        <div className="referrer-card-box referrer-link-card">
          <h2 className="referrer-section-title">🔗 紹介リンク</h2>
          <p className="referrer-link-desc">出店希望者にこのリンクを共有してください</p>
          <div className="referrer-link-display">
            <span className="referrer-link-text">{referralLink}</span>
          </div>
          <button className="referrer-copy-btn-full" onClick={handleCopy}>
            {copied ? '✅ コピーしました！' : '📋 リンクをコピーする'}
          </button>
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

        {/* 報酬履歴 */}
        <div className="referrer-card-box">
          <h2 className="referrer-section-title">
            報酬履歴
            <span className="referrer-count-badge">{rewards.length}件</span>
          </h2>
          {rewards.length === 0 ? (
            <p className="referrer-empty">まだ報酬履歴はありません。</p>
          ) : (
            <div className="referrer-referrals-list">
              {rewards.map((r) => (
                <div key={r.id} className="referrer-referral-card">
                  <div className="referrer-referral-header">
                    <span className="referrer-referral-shop">{r.exhibitors?.shop_name || '-'}</span>
                    <span className={`referrer-status-badge ${r.reward_rate === 70 ? 'approved' : 'pending'}`}>
                      {r.reward_type}
                    </span>
                  </div>
                  <p className="referrer-referral-title">出店回数：{r.entry_count}回目</p>
                  <p className="referrer-referral-date">確定日：{new Date(r.created_at).toLocaleDateString('ja-JP')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ReferrerMyPage
