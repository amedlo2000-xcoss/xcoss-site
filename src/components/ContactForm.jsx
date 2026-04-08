import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../ContactForm.css'

function ContactForm() {
  const { isAuthenticated } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error: insertError } = await supabase
      .from('contacts')
      .insert([{
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      }])

    if (insertError) {
      setError('送信に失敗しました。もう一度お試しください。')
    } else {
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    }

    setLoading(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="contact-login-cta">
        <p className="contact-cta-text">💬 お問い合わせはログイン後にご利用いただけます</p>
        <div className="contact-cta-buttons">
          <Link to="/login" className="btn btn-primary">ログイン</Link>
          <Link to="/register" className="btn btn-secondary">新規登録（無料）</Link>
        </div>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {success && (
        <div className="contact-success">
          ✅ お問い合わせを受け付けました。ありがとうございます！
        </div>
      )}
      {error && (
        <div className="contact-error">
          ❌ {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">名前 *</label>
        <input
          className="form-input"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="例：山田 太郎"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">メール *</label>
        <input
          className="form-input"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="例：info@example.com"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">件名</label>
        <input
          className="form-input"
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="例：出店費用について"
        />
      </div>
      <div className="form-group">
        <label className="form-label">内容 *</label>
        <textarea
          className="form-textarea"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="お問い合わせ内容を入力してください"
          rows={5}
          required
        />
      </div>
      <button className="form-submit" type="submit" disabled={loading}>
        {loading ? '送信中...' : '送信する'}
      </button>
    </form>
  )
}

export default ContactForm
