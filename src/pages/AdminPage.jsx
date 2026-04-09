import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../AdminPage.css'

function AdminPage() {
  const navigate = useNavigate()
  const [exhibitors, setExhibitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    checkAuth()
    fetchExhibitors()
  }, [filter])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/admin/login')
  }

  const fetchExhibitors = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    if (!error) setExhibitors(data)
    setLoading(false)
  }

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('exhibitors')
      .update({ status: newStatus })
      .eq('id', id)
    if (!error) {
      // 承認時に報酬計算
      if (newStatus === 'approved') {
        await calculateReward(id)
      }
      fetchExhibitors()
    }
  }

  const calculateReward = async (exhibitorId) => {
    try {
      // 紹介関係を取得（最初に紹介した人を探す）
      const { data: referral } = await supabase
        .from('referrals')
        .select('*, referrers(*)')
        .eq('exhibitor_id', exhibitorId)
        .single()
      if (!referral) return // 紹介者なし

      // この出店者の過去の承認回数を取得
      const { data: pastRewards } = await supabase
        .from('referral_rewards')
        .select('id, entry_count')
        .eq('exhibitor_id', exhibitorId)
        .order('entry_count', { ascending: false })

      const entryCount = pastRewards && pastRewards.length > 0
        ? pastRewards[0].entry_count + 1
        : 1

      // 二重計算チェック（同じentry_countは保存しない）
      const { data: existing } = await supabase
        .from('referral_rewards')
        .select('id')
        .eq('exhibitor_id', exhibitorId)
        .eq('entry_count', entryCount)
        .single()
      if (existing) return

      // 初回出店は70%、2回目以降は50%
      const isFirstTime = entryCount === 1
      const rewardRate = isFirstTime ? 70 : 50
      const rewardType = isFirstTime ? '初回報酬（70%）' : `リピーター報酬（50%）`

      // 報酬を保存
      await supabase.from('referral_rewards').insert([{
        referrer_id: referral.referrer_id,
        exhibitor_id: exhibitorId,
        referral_id: referral.id,
        entry_count: entryCount,
        reward_rate: rewardRate,
        reward_type: rewardType,
        reward_status: 'confirmed',
      }])

      console.log(`報酬計算完了: 出店者${exhibitorId} ${entryCount}回目 ${rewardRate}%`)
    } catch (err) {
      console.error('報酬計算エラー:', err)
    }
  }

  const handleDelete = async (id, shopName) => {
    if (!window.confirm(`「${shopName}」を削除しますか？\nこの操作は元に戻せません。`)) return
    const { error } = await supabase
      .from('exhibitors')
      .update({ status: 'deleted' })
      .eq('id', id)
    if (!error) fetchExhibitors()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">管理画面</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="contacts-link-btn" onClick={() => navigate('/admin/contacts')}>📧 お問い合わせ</button>
          <button className="contacts-link-btn" onClick={() => navigate('/admin/events')}>📅 日程管理</button>
          <button className="contacts-link-btn" onClick={() => navigate('/admin/events')}>📅 開催日程</button>
          <button className="contacts-link-btn" onClick={() => navigate('/admin/referrers')}>👥 紹介者管理</button>
          <button className="contacts-link-btn" onClick={() => navigate('/admin/rewards')}>💰 報酬管理</button>
          <button className="logout-btn" onClick={handleLogout}>ログアウト</button>
        </div>
      </div>
      <div className="admin-container">
        <div className="admin-top-actions">
          <button className="action-btn new-exhibitor" onClick={() => navigate('/admin/new')}>＋ 新規出店者登録</button>
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>審査待ち</button>
          <button className={`filter-tab ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>承認済み</button>
          <button className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>却下済み</button>
          <button className={`filter-tab ${filter === 'deleted' ? 'active' : ''}`} onClick={() => setFilter('deleted')}>削除済み</button>
        </div>
        {loading ? (
          <p className="admin-loading">読み込み中...</p>
        ) : exhibitors.length === 0 ? (
          <p className="admin-empty">該当する出店者はいません</p>
        ) : (
          <div className="admin-list">
            {exhibitors.map((ex) => (
              <div key={ex.id} className="admin-card">
                {ex.image_url && <img src={ex.image_url} alt={ex.shop_name} className="admin-card-image" />}
                <div className="admin-card-body">
                  <p className="admin-card-category">{ex.category}</p>
                  <h2 className="admin-card-shop">{ex.shop_name}</h2>
                  <p className="admin-card-title">{ex.title}</p>
                  <p className="admin-card-desc">{ex.description}</p>
                  <p className="admin-card-price">💴 {ex.price}</p>
                  <p className="admin-card-name">申込者: {ex.name}</p>
                  <p className="admin-card-date">申込日: {new Date(ex.created_at).toLocaleDateString('ja-JP')}</p>
                  <div className="admin-card-actions">
                    {filter !== 'approved' && (
                      <button className="action-btn approve" onClick={() => updateStatus(ex.id, 'approved')}>承認する</button>
                    )}
                    {filter !== 'rejected' && (
                      <button className="action-btn reject" onClick={() => updateStatus(ex.id, 'rejected')}>却下する</button>
                    )}
                    {filter !== 'pending' && (
                      <button className="action-btn pending" onClick={() => updateStatus(ex.id, 'pending')}>審査待ちに戻す</button>
                    )}
                    <button className="action-btn edit" onClick={() => navigate(`/admin/edit/${ex.id}`)}>編集する</button>
                    {filter !== 'deleted' && (
                      <button className="action-btn delete" onClick={() => handleDelete(ex.id, ex.shop_name)}>削除する</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
