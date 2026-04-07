import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../AdminEditPage.css'

const categories = [
  "フード・ドリンク", "ハンドメイド・クラフト", "アパレル・ファッション", "植物・フラワー",
  "アート・イラスト", "雑貨・インテリア", "スイーツ・お菓子", "その他",
]

function AdminEditPage() {
  const { id } = useParams()
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
    image_url: '',
    status: 'pending',
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchExhibitor()
  }, [id])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/admin/login')
  }

  const fetchExhibitor = async () => {
    const { data, error } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      setError('データの取得に失敗しました')
    } else {
      setForm({
        name: data.name || '',
        owner_name: data.owner_name || '',
        shop_name: data.shop_name || '',
        email: data.email || '',
        phone: data.phone || '',
        title: data.title || '',
        description: data.description || '',
        menu: data.menu || '',
        price: data.price || '',
        category: data.category || '',
        instagram_url: data.instagram_url || '',
        line_url: data.line_url || '',
        website_url: data.website_url || '',
        image_url: data.image_url || '',
        status: data.status || 'pending',
      })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // 画像サイズチェック（5MB以下）
    if (image && image.size > 5 * 1024 * 1024) {
      setError('画像サイズは5MB以下にしてください')
      return
    }

    setSaving(true)

    try {
      let image_url = form.image_url

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

      const { error: updateError } = await supabase
        .from('exhibitors')
        .update({ ...form, image_url })
        .eq('id', id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => navigate('/admin'), 1500)
    } catch (err) {
      setError('更新に失敗しました: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="edit-page">
      <div className="edit-container">
        <p>読み込み中...</p>
      </div>
    </div>
  )

  return (
    <div className="edit-page">
      <div className="edit-header">
        <h1 className="edit-header-title">出店者編集</h1>
        <button className="edit-back-btn" onClick={() => navigate('/admin')}>← 管理画面に戻る</button>
      </div>
      <div className="edit-container">
        {error && <p className="edit-error">{error}</p>}
        {success && <p className="edit-success">✅ 更新しました！管理画面に戻ります...</p>}

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
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="商品・サービスの説明を入力してください" />
          </div>
          <div className="form-group">
            <label className="form-label">メニュー</label>
            <textarea className="form-textarea" name="menu" value={form.menu} onChange={handleChange} rows={3} placeholder="例：たこ焼き6個 500円、チーズたこ焼き 600円" />
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
            <input className="form-input" type="url" name="instagram_url" value={form.instagram_url} onChange={handleChange} placeholder="例：https://instagram.com/xxxxx" />
          </div>
          <div className="form-group">
            <label className="form-label">LINE URL</label>
            <input className="form-input" type="url" name="line_url" value={form.line_url} onChange={handleChange} placeholder="例：https://line.me/xxxxx" />
          </div>
          <div className="form-group">
            <label className="form-label">ウェブサイト URL</label>
            <input className="form-input" type="url" name="website_url" value={form.website_url} onChange={handleChange} placeholder="例：https://example.com" />
          </div>

          <h2 className="edit-section-title">画像・ステータス</h2>

          <div className="form-group">
            <label className="form-label">現在の画像</label>
            {form.image_url ? (
              <img src={form.image_url} alt="現在の画像" className="edit-current-image" />
            ) : (
              <p className="edit-no-image">画像なし</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">新しい画像（変更する場合のみ）</label>
            <input className="form-input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </div>
          <div className="form-group">
            <label className="form-label">ステータス</label>
            <select className="form-input" name="status" value={form.status} onChange={handleChange}>
              <option value="pending">審査待ち</option>
              <option value="approved">承認済み</option>
              <option value="rejected">却下済み</option>
            </select>
          </div>

          <div className="edit-form-actions">
            <button className="edit-cancel-btn" type="button" onClick={() => navigate('/admin')}>キャンセル</button>
            <button className="edit-save-btn" type="submit" disabled={saving}>
              {saving ? '保存中...' : '更新する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminEditPage
