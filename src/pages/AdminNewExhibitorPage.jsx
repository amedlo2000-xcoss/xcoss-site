import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../AdminEditPage.css'

const categories = [
  "フード・ドリンク（市販品限定）",
  "ワークショップ・体験",
  "ビューティー・美容",
  "ヒーリング・占い",
  "ハンドメイド・物販",
  "ファッション",
  "ライフスタイル・サービス",
  "キッズ・ファミリー",
]

function AdminNewExhibitorPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    owner_name: '',
    shop_name: '',
    email: '',
    phone: '',
    title: '',
    description: '',
    menu: '',
    price: '',
    category: '',
    instagram_url: '',
    line_url: '',
    website_url: '',
    status: 'approved',
  })
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/admin/login')
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (image && image.size > 5 * 1024 * 1024) {
      setError('画像サイズは5MB以下にしてください')
      return
    }

    setSaving(true)
    setError('')

    try {
      let image_url = ''

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

      const { error: insertError } = await supabase
        .from('exhibitors')
        .insert([{ ...form, image_url }])

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => navigate('/admin'), 1500)
    } catch (err) {
      setError('登録に失敗しました: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="edit-page">
      <div className="edit-header">
        <h1 className="edit-header-title">新規出店者登録</h1>
        <button className="edit-back-btn" onClick={() => navigate('/admin')}>← 管理画面に戻る</button>
      </div>
      <div className="edit-container">
        {error && <p className="edit-error">{error}</p>}
        {success && <p className="edit-success">✅ 登録しました！管理画面に戻ります...</p>}

        <form onSubmit={handleSubmit} className="edit-form">

          <h2 className="edit-section-title">基本情報</h2>
          <div className="form-group">
            <label className="form-label">お名前 *</label>
            <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="例：山田 太郎" />
          </div>
          <div className="form-group">
            <label className="form-label">オーナー名</label>
            <input className="form-input" type="text" name="owner_name" value={form.owner_name} onChange={handleChange} placeholder="例：山田 太郎" />
          </div>
          <div className="form-group">
            <label className="form-label">屋号 *</label>
            <input className="form-input" type="text" name="shop_name" value={form.shop_name} onChange={handleChange} required placeholder="例：たこ焼き 浪速屋" />
          </div>
          <div className="form-group">
            <label className="form-label">メールアドレス</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="例：info@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">電話番号</label>
            <input className="form-input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="例：090-1234-5678" />
          </div>

          <h2 className="edit-section-title">商品・サービス情報</h2>
          <div className="form-group">
            <label className="form-label">キャッチコピー *</label>
            <input className="form-input" type="text" name="title" value={form.title} onChange={handleChange} required placeholder="例：大阪直伝の本格たこ焼き" />
          </div>
          <div className="form-group">
            <label className="form-label">紹介文 *</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="商品・サービスの説明" />
          </div>
          <div className="form-group">
            <label className="form-label">メニュー</label>
            <textarea className="form-textarea" name="menu" value={form.menu} onChange={handleChange} rows={3} placeholder="例：たこ焼き6個 500円" />
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

          <h2 className="edit-section-title">SNS・リンク</h2>
          <div className="form-group">
            <label className="form-label">Instagram URL</label>
            <input className="form-input" type="url" name="instagram_url" value={form.instagram_url} onChange={handleChange} placeholder="https://instagram.com/xxxxx" />
          </div>
          <div className="form-group">
            <label className="form-label">LINE URL</label>
            <input className="form-input" type="url" name="line_url" value={form.line_url} onChange={handleChange} placeholder="https://line.me/xxxxx" />
          </div>
          <div className="form-group">
            <label className="form-label">ウェブサイト URL</label>
            <input className="form-input" type="url" name="website_url" value={form.website_url} onChange={handleChange} placeholder="https://example.com" />
          </div>

          <h2 className="edit-section-title">画像・ステータス</h2>
          <div className="form-group">
            <label className="form-label">画像（5MB以下）</label>
            <input className="form-input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </div>
          <div className="form-group">
            <label className="form-label">ステータス</label>
            <select className="form-input" name="status" value={form.status} onChange={handleChange}>
              <option value="approved">承認済み</option>
              <option value="pending">審査待ち</option>
              <option value="rejected">却下済み</option>
            </select>
          </div>

          <div className="edit-form-actions">
            <button className="edit-cancel-btn" type="button" onClick={() => navigate('/admin')}>キャンセル</button>
            <button className="edit-save-btn" type="submit" disabled={saving}>
              {saving ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminNewExhibitorPage
