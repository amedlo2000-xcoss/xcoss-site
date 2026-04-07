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
        <button className="logout-btn" onClick={handleLogout}>ログアウト</button>
      </div>
      <div className="admin-container">
        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>審査待ち</button>
          <button className={`filter-tab ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>承認済み</button>
          <button className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>却下済み</button>
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
