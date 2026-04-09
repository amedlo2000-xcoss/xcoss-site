import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../ExhibitorDetail.css'

function ExhibitorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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
        <div className="exhibitor-detail">
          <div className="shop-name">{exhibitor.shop_name}</div>
          {exhibitor.title && <div className="catch-copy">{exhibitor.title}</div>}
          {exhibitor.description && <div className="description">{exhibitor.description}</div>}
          {exhibitor.price && <div className="trial-price">お試し料金：{exhibitor.price}</div>}
        </div>
      </div>
    </div>
  )
}

export default ExhibitorDetail
