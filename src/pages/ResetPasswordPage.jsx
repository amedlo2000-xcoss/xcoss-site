import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../LoginPage.css'

function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) {
      setError('送信に失敗しました: ' + error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="login-page">
        <div className="login-box">
          <h1 className="login-title">メールを送信しました</h1>
          <p className="login-desc">
            パスワードリセット用のリンクを送信しました。<br />
            メールをご確認ください。
          </p>
          <Link to="/login" className="login-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">パスワードリセット</h1>
        <p className="login-desc">登録済みのメールアドレスを入力してください</p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleReset} className="login-form">
          <div className="form-group">
            <label className="form-label">メールアドレス</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="例：info@example.com"
            />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? '送信中...' : 'リセットメールを送信'}
          </button>
        </form>

        <p className="login-footer">
          <Link to="/login" className="login-link">ログインに戻る</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordPage
