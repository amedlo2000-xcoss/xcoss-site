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
    shop_name: '',
    title: '',
    description: '',
    price: '',
    category: '',
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
        shop_name: data.shop_name || '',
        title: data.title || '',
        description: data.description || '',
        price: data.price || '',
        category: data.category || '',
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
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      let image_url = form.image_url

      // 新しい画像があればアップロード
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
          <div className="form-group">
            <label className="form-label">お名前 *</label>
            <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">屋号 *</label>
            <input className="form-input" type="text" name="shop_name" value={form.shop_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">キャッチコピー *</label>
            <input className="form-input" type="text" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">紹介文 *</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} required rows={4} />
          </div>
          <div className="form-group">
            <label className="form-label">料金 *</label>
            <input className="form-input" type="text" name="price" value={form.price} onChange={handleChange} required />
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
            <label className="form-label">ステータス</label>
            <select className="form-input" name="status" value={form.status} onChange={handleChange}>
              <option value="pending">審査待ち</option>
              <option value="approved">承認済み</option>
              <option value="rejected">却下済み</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">現在の画像</label>
            {form.image_url && (
              <img src={form.image_url} alt="現在の画像" className="edit-current-image" />
            )}
          </div>
          <div className="form-group">
            <label className="form-label">新しい画像（変更する場合のみ）</label>
            <input className="form-input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
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
