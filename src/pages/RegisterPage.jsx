import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../LoginPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません。')
      return
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError('登録に失敗しました: ' + error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="login-page">
        <div className="login-box">
          <h1 className="login-title">登録完了！</h1>
          <p className="login-desc">
            確認メールを送信しました。<br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <button className="login-btn" onClick={() => navigate('/login')}>
            ログインページへ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">新規登録</h1>
        <p className="login-desc">無料でアカウントを作成できます</p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleRegister} className="login-form">
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
          <div className="form-group">
            <label className="form-label">パスワード（6文字以上）</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="パスワードを入力"
            />
          </div>
          <div className="form-group">
            <label className="form-label">パスワード確認</label>
            <input
              className="form-input"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              placeholder="もう一度入力"
            />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>

        <p className="login-footer">
          すでにアカウントをお持ちの方は
          <Link to="/login" className="login-link">ログイン</Link>
        </p>
        <p className="login-footer">
          <Link to="/" className="login-link">トップに戻る</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
