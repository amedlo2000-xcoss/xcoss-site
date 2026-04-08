import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../ExhibitorDetail.css'

function ExhibitorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [exhibitor, setExhibitor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExhibitor = async () => {
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('id', id)
        .single()
      if (!error) setExhibitor(data)
      setLoading(false)
    }
    fetchExhibitor()
  }, [id])

  const handleContact = () => {
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById('contact')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  if (loading) return (
    <div className="detail-page">
      <div className="detail-container">
        <p>読み込み中...</p>
      </div>
    </div>
  )

  if (!exhibitor) {
    return (
      <div className="detail-not-found">
        <p>出店者が見つかりませんでした。</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>トップに戻る</button>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <div className="detail-container">
        <button className="detail-back" onClick={() => navigate('/')}>← 一覧に戻る</button>
        <img
          src={exhibitor.image_url || 'https://placehold.co/400x300?text=No+Image'}
          alt={exhibitor.shop_name}
          className="detail-image"
        />
        <div className="detail-body">
          <p className="detail-shop-name">{exhibitor.shop_name}</p>
          <h1 className="detail-title">{exhibitor.title}</h1>
          <p className="detail-description">{exhibitor.description}</p>
          <p className="detail-price">💴 {exhibitor.price}</p>

          {isAuthenticated ? (
            <>
              <button className="btn btn-primary detail-btn" onClick={handleContact}>お問い合わせ</button>
            </>
          ) : (
            <div className="detail-lock-box">
              <p className="detail-lock-text">🔒 詳細情報・お問い合わせはログイン後にご覧いただけます</p>
              <div className="detail-lock-actions">
                <Link to="/login" className="btn btn-primary detail-btn-link">ログイン</Link>
                <Link to="/register" className="btn btn-secondary detail-btn-link">新規登録</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExhibitorDetail