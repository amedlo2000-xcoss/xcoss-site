import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">ログイン</h1>
        <p className="login-desc">アカウントをお持ちの方はこちら</p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleLogin} className="login-form">
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
            <label className="form-label">パスワード</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="パスワードを入力"
            />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="login-footer">
          アカウントをお持ちでない方は
          <Link to="/register" className="login-link">新規登録</Link>
        </p>
        <p className="login-footer">
          <Link to="/" className="login-link">トップに戻る</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
