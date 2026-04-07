import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../AdminRewardsPage.css'

function AdminRewardsPage() {
  const navigate = useNavigate()
  const [rewards, setRewards] = useState([])
  const [grouped, setGrouped] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchRewards()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/admin/login')
  }

  const fetchRewards = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('referral_rewards')
      .select('*, referrers(name, nickname, code), exhibitors(shop_name, status)')
      .order('calculated_at', { ascending: false })

    if (!error && data) {
      setRewards(data)

      // 紹介者ごとにグループ化
      const groupMap = {}
      data.forEach((r) => {
        const rid = r.referrer_id
        if (!groupMap[rid]) {
          groupMap[rid] = {
            referrer: r.referrers,
            rewards: [],
            totalRate: 0,
          }
        }
        groupMap[rid].rewards.push(r)
        groupMap[rid].totalRate += r.reward_rate
      })
      setGrouped(Object.values(groupMap))
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="rewards-page">
      <div className="rewards-header">
        <h1 className="rewards-title">報酬管理</h1>
        <div className="rewards-header-actions">
          <button className="rewards-back-btn" onClick={() => navigate('/admin')}>← 管理画面に戻る</button>
          <button className="rewards-logout-btn" onClick={handleLogout}>ログアウト</button>
        </div>
      </div>

      <div className="rewards-container">

        {/* 紹介者別サマリー */}
        <div className="rewards-box">
          <h2 className="rewards-section-title">紹介者別サマリー</h2>
          {loading ? (
            <p className="rewards-loading">読み込み中...</p>
          ) : grouped.length === 0 ? (
            <p className="rewards-empty">報酬データはありません</p>
          ) : (
            <div className="rewards-summary-list">
              {grouped.map((g, i) => (
                <div key={i} className="rewards-summary-card">
                  <div className="rewards-summary-header">
                    <span className="rewards-summary-name">
                      {g.referrer?.nickname || g.referrer?.name || '-'}
                    </span>
                    <span className="rewards-summary-code">{g.referrer?.code}</span>
                  </div>
                  <div className="rewards-summary-stats">
                    <div className="rewards-stat">
                      <span className="rewards-stat-label">紹介件数</span>
                      <span className="rewards-stat-value">{g.rewards.length}件</span>
                    </div>
                    <div className="rewards-stat">
                      <span className="rewards-stat-label">初回報酬</span>
                      <span className="rewards-stat-value">
                        {g.rewards.filter(r => r.is_first_time).length}件（70%）
                      </span>
                    </div>
                    <div className="rewards-stat">
                      <span className="rewards-stat-label">リピーター報酬</span>
                      <span className="rewards-stat-value">
                        {g.rewards.filter(r => !r.is_first_time).length}件（50%）
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 報酬履歴一覧 */}
        <div className="rewards-box">
          <h2 className="rewards-section-title">報酬履歴一覧</h2>
          {loading ? (
            <p className="rewards-loading">読み込み中...</p>
          ) : rewards.length === 0 ? (
            <p className="rewards-empty">報酬履歴はありません</p>
          ) : (
            <table className="rewards-table">
              <thead>
                <tr>
                  <th>紹介者</th>
                  <th>出店者</th>
                  <th>報酬種別</th>
                  <th>報酬率</th>
                  <th>出店者ステータス</th>
                  <th>計算日</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((r) => (
                  <tr key={r.id}>
                    <td>{r.referrers?.nickname || r.referrers?.name || '-'}</td>
                    <td>{r.exhibitors?.shop_name || '-'}</td>
                    <td>
                      <span className={`reward-type-badge ${r.is_first_time ? 'first' : 'repeat'}`}>
                        {r.reward_type}
                      </span>
                    </td>
                    <td><strong>{r.reward_rate}%</strong></td>
                    <td>
                      <span className={`status-badge ${r.exhibitors?.status}`}>
                        {r.exhibitors?.status || '-'}
                      </span>
                    </td>
                    <td>{new Date(r.calculated_at).toLocaleDateString('ja-JP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminRewardsPage
