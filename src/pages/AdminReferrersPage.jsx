import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../AdminReferrersPage.css'

const emptyForm = { name: '', email: '', code: '' }

function AdminReferrersPage() {
  const navigate = useNavigate()
  const [referrers, setReferrers] = useState([])
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/admin/login')
  }

  const fetchData = async () => {
    setLoading(true)
    const [{ data: refs }, { data: rels }] = await Promise.all([
      supabase.from('referrers').select('*').order('created_at', { ascending: false }),
      supabase.from('referrals').select('*, referrers(name, code), exhibitors(shop_name, status)').order('created_at', { ascending: false }),
    ])
    if (refs) setReferrers(refs)
    if (rels) setReferrals(rels)
    setLoading(false)
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const code = 'XCOSS-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setForm((f) => ({ ...f, code }))
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.from('referrers').insert([form])
    if (error) {
      setError('エラー: ' + error.message)
    } else {
      setSuccess('紹介者を追加しました！')
      setForm(emptyForm)
      fetchData()
    }
    setSaving(false)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`「${name}」を削除しますか？`)) return
    await supabase.from('referrers').delete().eq('id', id)
    fetchData()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="referrers-page">
      <div className="referrers-header">
        <h1 className="referrers-title">紹介者管理</h1>
        <div className="referrers-header-actions">
          <button className="referrers-back-btn" onClick={() => navigate('/admin')}>← 管理画面に戻る</button>
          <button className="referrers-logout-btn" onClick={handleLogout}>ログアウト</button>
        </div>
      </div>

      <div className="referrers-container">

        {/* 紹介者追加フォーム */}
        <div className="referrers-form-box">
          <h2 className="referrers-form-title">紹介者を追加</h2>
          {error && <p className="referrers-error">{error}</p>}
          {success && <p className="referrers-success">✅ {success}</p>}
          <form onSubmit={handleSubmit} className="referrers-form">
            <div className="form-group">
              <label className="form-label">名前 *</label>
              <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="例：山田 太郎" />
            </div>
            <div className="form-group">
              <label className="form-label">メールアドレス *</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="例：info@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">紹介コード *</label>
              <div className="code-input-wrap">
                <input className="form-input" type="text" name="code" value={form.code} onChange={handleChange} required placeholder="例：XCOSS-ABC123" />
                <button type="button" className="generate-btn" onClick={generateCode}>自動生成</button>
              </div>
            </div>
            <button type="submit" className="referrers-save-btn" disabled={saving}>
              {saving ? '追加中...' : '追加する'}
            </button>
          </form>
        </div>

        {/* 紹介者一覧 */}
        <div className="referrers-list-box">
          <h2 className="referrers-list-title">紹介者一覧</h2>
          {loading ? (
            <p className="referrers-loading">読み込み中...</p>
          ) : referrers.length === 0 ? (
            <p className="referrers-empty">紹介者はいません</p>
          ) : (
            <div className="referrers-list">
              {referrers.map((r) => {
                const count = referrals.filter((rel) => rel.referrer_id === r.id).length
                return (
                  <div key={r.id} className="referrer-card">
                    <div className="referrer-card-header">
                      <span className="referrer-name">{r.name}</span>
                      <span className="referrer-count">{count}件紹介</span>
                    </div>
                    <p className="referrer-email">📧 {r.email}</p>
                    <p className="referrer-code">🔑 {r.code}</p>
                    <p className="referrer-date">登録日: {new Date(r.created_at).toLocaleDateString('ja-JP')}</p>
                    <button className="referrer-delete-btn" onClick={() => handleDelete(r.id, r.name)}>削除</button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 紹介実績一覧 */}
        <div className="referrers-list-box">
          <h2 className="referrers-list-title">紹介実績一覧</h2>
          {loading ? (
            <p className="referrers-loading">読み込み中...</p>
          ) : referrals.length === 0 ? (
            <p className="referrers-empty">紹介実績はありません</p>
          ) : (
            <table className="referrals-table">
              <thead>
                <tr>
                  <th>紹介者</th>
                  <th>紹介コード</th>
                  <th>出店者</th>
                  <th>ステータス</th>
                  <th>日時</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((rel) => (
                  <tr key={rel.id}>
                    <td>{rel.referrers?.name || '-'}</td>
                    <td>{rel.code}</td>
                    <td>{rel.exhibitors?.shop_name || '-'}</td>
                    <td>
                      <span className={`status-badge ${rel.exhibitors?.status}`}>
                        {rel.exhibitors?.status || '-'}
                      </span>
                    </td>
                    <td>{new Date(rel.created_at).toLocaleDateString('ja-JP')}</td>
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

export default AdminReferrersPage
