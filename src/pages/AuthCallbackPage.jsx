import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../LoginPage.css'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('認証処理中...')

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        setMessage('認証に失敗しました。もう一度お試しください。')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      if (session) {
        setMessage('✅ メール確認が完了しました！マイページに移動します...')
        setTimeout(() => navigate('/mypage'), 2000)
      } else {
        setMessage('認証処理中です...')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">認証処理</h1>
        <p className="login-desc">{message}</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
