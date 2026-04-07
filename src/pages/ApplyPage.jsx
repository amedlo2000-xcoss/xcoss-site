import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../ApplyPage.css'

const categories = [
  "フード・ドリンク", "ハンドメイド・クラフト", "アパレル・ファッション", "植物・フラワー",
  "アート・イラスト", "雑貨・インテリア", "スイーツ・お菓子", "その他",
]

function ApplyPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    shop_name: '',
    title: '',
    description: '',
    price: '',
    category: '',
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let image_url = ''

      // 画像アップロード
      if (image) {
        const ext = image.name.split('.').pop()
        const fileName = `${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('exhibitor-images')
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('exhibitor-images')
          .getPublicUrl(fileName)
        image_url = data.publicUrl
      }

      // DBに保存
      const { error: insertError } = await supabase
        .from('exhibitors')
        .insert([{ ...form, image_url, status: 'pending' }])

      if (insertError) throw insertError

      alert('申込みが完了しました！審査後に公開されます。')
      navigate('/')
    } catch (err) {
      setError('エラーが発生しました: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="apply-page">
      <div className="apply-container">
        <h1 className="apply-title">出店申込み</h1>
        <p className="apply-desc">以下のフォームに入力して申込みしてください。審査後に公開されます。</p>

        {error && <p className="apply-error">{error}</p>}

        <form onSubmit={handleSubmit} className="apply-form">
          <div className="form-group">
            <label className="form-label">お名前 *</label>
            <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="例：山田 太郎" />
          </div>
          <div className="form-group">
            <label className="form-label">屋号 *</label>
            <input className="form-input" type="text" name="shop_name" value={form.shop_name} onChange={handleChange} required placeholder="例：たこ焼き 浪速屋" />
          </div>
          <div className="form-group">
            <label className="form-label">キャッチコピー *</label>
            <input className="form-input" type="text" name="title" value={form.title} onChange={handleChange} required placeholder="例：大阪直伝の本格たこ焼き" />
          </div>
          <div className="form-group">
            <label className="form-label">紹介文 *</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="商品・サービスの説明を入力してください" />
          </div>
          <div className="form-group">
            <label className="form-label">料金 *</label>
            <input className="form-input" type="text" name="price" value={form.price} onChange={handleChange} required placeholder="例：500円〜" />
          </div>
          <div className="form-group">
            <label className="form-label">カテゴリー *</label>
            <select className="form-input" name="category" value={form.category} onChange={handleChange} required>
              <option value="">選択してください</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">画像</label>
            <input className="form-input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </div>
          <button className="apply-btn" type="submit" disabled={loading}>
            {loading ? '送信中...' : '申込みを送信する'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ApplyPage
