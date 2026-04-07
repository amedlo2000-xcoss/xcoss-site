import '../ExhibitorCard.css'

function ExhibitorCard({ image, shopName, title, description, price }) {
  return (
    <div className="exhibitor-card">
      <div className="card-image-wrap">
        <img src={image} alt={shopName} className="card-image" />
      </div>
      <div className="card-body">
        <p className="card-shop-name">{shopName}</p>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <p className="card-price">💴 {price}</p>
        <button className="card-btn">お問い合わせ</button>
      </div>
    </div>
  )
}

export default ExhibitorCard
