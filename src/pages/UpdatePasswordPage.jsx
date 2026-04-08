import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../LoginPage.css'

function UpdatePasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleUpdate = async (e) => {
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

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('更新に失敗しました: ' + error.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="login-page">
        <div className="login-box">
          <h1 className="login-title">パスワードを更新しました！</h1>
          <p className="login-desc">ログインページに移動します...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">新しいパスワードを設定</h1>
        <p className="login-desc">新しいパスワードを入力してください</p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleUpdate} className="login-form">
          <div className="form-group">
            <label className="form-label">新しいパスワード（6文字以上）</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="新しいパスワードを入力"
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
            {loading ? '更新中...' : 'パスワードを更新する'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdatePasswordPage
