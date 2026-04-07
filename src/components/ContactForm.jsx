import { useState } from 'react'
import '../ContactForm.css'

function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    shopName: '',
    email: '',
    message: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('送信内容:', form)
    alert('送信しました！\nコンソールに内容が出力されています。')
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">名前</label>
        <input
          className="form-input"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="例：山田 太郎"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">屋号</label>
        <input
          className="form-input"
          type="text"
          name="shopName"
          value={form.shopName}
          onChange={handleChange}
          placeholder="例：たこ焼き 浪速屋"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">メール</label>
        <input
          className="form-input"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="例：info@example.com"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">内容</label>
        <textarea
          className="form-textarea"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="お問い合わせ内容を入力してください"
          rows={5}
          required
        />
      </div>
      <button className="form-submit" type="submit">送信する</button>
    </form>
  )
}

export default ContactForm
