import '../ExhibitorCard.css'

function ExhibitorCard({ image, shopName, title, description, price }) {
  return (
    <div className="shop-card">
      <div className="logo-area">
        {image ? (
          <img src={image} alt={shopName} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>
      <div className="shop-name">{shopName}</div>
      {title && <div className="catch-copy">{title}</div>}
      {description && <p className="card-description">{description}</p>}
      {price && <p className="card-price">💴 {price}</p>}
    </div>
  )
}

export default ExhibitorCard
