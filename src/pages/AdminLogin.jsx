import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../AdminLogin.css'

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('ログインに失敗しました: ' + error.message)
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">管理者ログイン</h1>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">メールアドレス</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">パスワード</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
