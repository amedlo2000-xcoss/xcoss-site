import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../AdminEventsPage.css'

const emptyForm = {
  name: '',
  date: '',
  time: '',
  venue: '',
  address: '',
  note: '',
  is_published: true,
}

function AdminEventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkAuth()
    fetchEvents()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/admin/login')
  }

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setEvents(data)
    setLoading(false)
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleEdit = (ev) => {
    setEditingId(ev.id)
    setForm({
      name: ev.name || '',
      date: ev.date || '',
      time: ev.time || '',
      venue: ev.venue || '',
      address: ev.address || '',
      note: ev.note || '',
      is_published: ev.is_published ?? true,
    })
    setError('')
    setSuccess('')
    // フォームまで自動スクロール
    setTimeout(() => {
      const el = document.getElementById('events-form-top')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        const { error } = await supabase
          .from('events')
          .update(form)
          .eq('id', editingId)
        if (error) throw error
        setSuccess('更新しました！')
      } else {
        const { error } = await supabase
          .from('events')
          .insert([form])
        if (error) throw error
        setSuccess('追加しました！')
      }
      setEditingId(null)
      setForm(emptyForm)
      fetchEvents()
    } catch (err) {
      setError('保存に失敗しました: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`「${name}」を削除しますか？`)) return
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (!error) fetchEvents()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="events-admin-page">
      <div className="events-admin-header">
        <h1 className="events-admin-title">開催日程管理</h1>
        <div className="events-admin-header-actions">
          <button className="events-back-btn" onClick={() => navigate('/admin')}>← 管理画面に戻る</button>
          <button className="events-logout-btn" onClick={handleLogout}>ログアウト</button>
        </div>
      </div>

      <div className="events-admin-container">
        <div className="events-form-box" id="events-form-top">
          <h2 className="events-form-title">{editingId ? '日程を編集' : '新しい日程を追加'}</h2>
          {error && <p className="events-error">{error}</p>}
          {success && <p className="events-success">✅ {success}</p>}
          <form onSubmit={handleSubmit} className="events-form">
            <div className="form-group">
              <label className="form-label">イベント名 *</label>
              <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="例：XCOSS Vol.1" />
            </div>
            <div className="form-group">
              <label className="form-label">開催日 *</label>
              <input className="form-input" type="text" name="date" value={form.date} onChange={handleChange} required placeholder="例：2026年5月3日（日）" />
            </div>
            <div className="form-group">
              <label className="form-label">時間 *</label>
              <input className="form-input" type="text" name="time" value={form.time} onChange={handleChange} required placeholder="例：10:00〜17:00" />
            </div>
            <div className="form-group">
              <label className="form-label">会場名 *</label>
              <input className="form-input" type="text" name="venue" value={form.venue} onChange={handleChange} required placeholder="例：〇〇公園 イベント広場" />
            </div>
            <div className="form-group">
              <label className="form-label">住所 *</label>
              <input className="form-input" type="text" name="address" value={form.address} onChange={handleChange} required placeholder="例：東京都〇〇区〇〇1-2-3" />
            </div>
            <div className="form-group">
              <label className="form-label">備考</label>
              <input className="form-input" type="text" name="note" value={form.note} onChange={handleChange} placeholder="例：入場無料・雨天決行" />
            </div>
            <div className="form-group form-group-checkbox">
              <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} id="is_published" />
              <label htmlFor="is_published" className="form-label-checkbox">公開する</label>
            </div>
            <div className="events-form-actions">
              {editingId && (
                <button className="events-cancel-btn" type="button" onClick={handleCancel}>キャンセル</button>
              )}
              <button className="events-save-btn" type="submit" disabled={saving}>
                {saving ? '保存中...' : editingId ? '更新する' : '追加する'}
              </button>
            </div>
          </form>
        </div>

        <div className="events-list-box">
          <h2 className="events-list-title">登録済み日程</h2>
          {loading ? (
            <p className="events-loading">読み込み中...</p>
          ) : events.length === 0 ? (
            <p className="events-empty">日程が登録されていません</p>
          ) : (
            <div className="events-admin-list">
              {events.map((ev) => (
                <div key={ev.id} className="events-admin-card">
                  <div className="events-admin-card-info">
                    <p className="events-admin-name">{ev.name}</p>
                    <p className="events-admin-detail">📅 {ev.date} 🕐 {ev.time}</p>
                    <p className="events-admin-detail">📍 {ev.venue}</p>
                    <p className="events-admin-detail">🗺️ {ev.address}</p>
                    {ev.note && <p className="events-admin-detail">📝 {ev.note}</p>}
                    <span className={`events-admin-status ${ev.is_published ? 'published' : 'draft'}`}>
                      {ev.is_published ? '公開中' : '非公開'}
                    </span>
                  </div>
                  <div className="events-admin-actions">
                    <button className="events-edit-btn" onClick={() => handleEdit(ev)}>編集</button>
                    <button className="events-delete-btn" onClick={() => handleDelete(ev.id, ev.name)}>削除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminEventsPage
