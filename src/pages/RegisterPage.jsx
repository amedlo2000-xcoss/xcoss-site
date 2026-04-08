import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../LoginPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    referralCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError('パスワードが一致しません。')
      return
    }
    if (form.password.length < 6) {
      setError('パスワードは6文字以上で入力してください。')
      return
    }

    setLoading(true)

    // 紹介コード確認
    if (form.referralCode) {
      const { data: referrer } = await supabase
        .from('referrers')
        .select('id')
        .eq('code', form.referralCode.trim())
        .single()
      if (!referrer) {
        setError('紹介コードが見つかりません。')
        setLoading(false)
        return
      }
    }

    // ユーザー登録
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          nickname: form.nickname,
        }
      }
    })

    if (signUpError) {
      setError('登録に失敗しました: ' + signUpError.message)
      setLoading(false)
      return
    }

    // プロフィール保存
    if (data.user) {
      await supabase.from('user_profiles').insert([{
        id: data.user.id,
        name: form.name,
        nickname: form.nickname,
        referral_code_used: form.referralCode || null,
      }])
    }

    setSuccess(true)
    setLoading(false)
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
            <label className="form-label">お名前 *</label>
            <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="例：山田 太郎" />
          </div>
          <div className="form-group">
            <label className="form-label">ニックネーム *</label>
            <input className="form-input" type="text" name="nickname" value={form.nickname} onChange={handleChange} required placeholder="例：たろう" />
          </div>
          <div className="form-group">
            <label className="form-label">メールアドレス *</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="例：info@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">パスワード（6文字以上） *</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} required placeholder="パスワードを入力" />
          </div>
          <div className="form-group">
            <label className="form-label">パスワード確認 *</label>
            <input className="form-input" type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} required placeholder="もう一度入力" />
          </div>
          <div className="form-group">
            <label className="form-label">紹介コード（任意）</label>
            <input className="form-input" type="text" name="referralCode" value={form.referralCode} onChange={handleChange} placeholder="例：XCOSS-XXXXXX" />
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
