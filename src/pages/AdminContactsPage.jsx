import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../AdminContactsPage.css'

function AdminContactsPage() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchContacts()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/admin/login')
  }

  const fetchContacts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setContacts(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <h1 className="contacts-title">お問い合わせ管理</h1>
        <div className="contacts-header-actions">
          <button className="contacts-back-btn" onClick={() => navigate('/admin')}>← 管理画面に戻る</button>
          <button className="contacts-logout-btn" onClick={handleLogout}>ログアウト</button>
        </div>
      </div>
      <div className="contacts-container">
        {loading ? (
          <p className="contacts-loading">読み込み中...</p>
        ) : contacts.length === 0 ? (
          <p className="contacts-empty">お問い合わせはありません</p>
        ) : (
          <div className="contacts-list">
            {contacts.map((c) => (
              <div key={c.id} className="contact-card">
                <div className="contact-card-header">
                  <span className="contact-name">{c.name}</span>
                  <span className="contact-date">{new Date(c.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
                <p className="contact-email">📧 {c.email}</p>
                {c.subject && <p className="contact-subject">件名：{c.subject}</p>}
                <p className="contact-message">{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminContactsPage
