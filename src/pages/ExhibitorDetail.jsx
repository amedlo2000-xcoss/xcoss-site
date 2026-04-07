import { useParams, useNavigate } from 'react-router-dom'
import exhibitors from '../data/exhibitors.json'
import '../ExhibitorDetail.css'

function ExhibitorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const exhibitor = exhibitors.find((ex) => ex.id === Number(id))

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
        <img src={exhibitor.image} alt={exhibitor.name} className="detail-image" />
        <div className="detail-body">
          <p className="detail-shop-name">{exhibitor.name}</p>
          <h1 className="detail-title">{exhibitor.title}</h1>
          <p className="detail-description">{exhibitor.description}</p>
          <p className="detail-price">💴 {exhibitor.price}</p>
          <button className="btn btn-primary detail-btn">お問い合わせ</button>
        </div>
      </div>
    </div>
  )
}

export default ExhibitorDetail
