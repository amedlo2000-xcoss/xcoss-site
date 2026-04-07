import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import ExhibitorCard from '../components/ExhibitorCard'
import ContactForm from '../components/ContactForm'
import { supabase } from '../lib/supabase'

const categories = [
  "フード・ドリンク", "ハンドメイド・クラフト", "アパレル・ファッション", "植物・フラワー",
  "アート・イラスト", "雑貨・インテリア", "スイーツ・お菓子", "その他",
]

const faq = [
  { q: "出店申込みはどこからできますか？", a: "本サイトの「出店申込み」ボタンからお申込みいただけます。申込み後、事務局より3営業日以内にご連絡いたします。" },
  { q: "出店費用はいくらですか？", a: "出店費用はブースのサイズやカテゴリーによって異なります。詳細はお問い合わせください。" },
  { q: "当日のブース設営はどうすればいいですか？", a: "イベント当日は開場1時間前から設営可能です。設営ガイドを事前にメールでお送りします。" },
]

function Hero() {
  const navigate = useNavigate()

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-title">XCOSS 出店者紹介サイト</h1>
        <p className="hero-desc">XCOSSはハンドメイド・フード・アートなど多彩なジャンルが集まるマーケットイベントです。個性あふれる出店者たちとの出会いをお楽しみください。</p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => scrollTo('vendors')}>出店者を見る</button>
          <button className="btn btn-secondary" onClick={() => navigate('/apply')}>出店申込み</button>
          <button className="btn btn-outline" onClick={() => scrollTo('contact')}>お問い合わせ</button>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">XCOSSについて</h2>
        <p className="section-text">XCOSSは年2回開催される大型マーケットイベントです。全国から集まった個性豊かな出店者が、こだわりの商品やサービスを直接お届けします。来場者と出店者が直接つながれる場として、毎回多くの方にご来場いただいています。</p>
      </div>
    </section>
  )
}

function Categories() {
  return (
    <section className="section section-gray">
      <div className="container">
        <h2 className="section-title">カテゴリー一覧</h2>
        <div className="category-grid">
          {categories.map((cat, i) => <div key={i} className="category-item">{cat}</div>)}
        </div>
      </div>
    </section>
  )
}

function Vendors() {
  const navigate = useNavigate()
  const [exhibitors, setExhibitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('すべて')

  useEffect(() => {
    const fetchExhibitors = async () => {
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (!error) setExhibitors(data)
      setLoading(false)
    }
    fetchExhibitors()
  }, [])

  const filteredExhibitors = selectedCategory === 'すべて'
    ? exhibitors
    : exhibitors.filter((ex) => ex.category === selectedCategory)

  const usedCategories = ['すべて', ...Array.from(new Set(exhibitors.map((ex) => ex.category).filter(Boolean)))]

  return (
    <section className="section" id="vendors">
      <div className="container">
        <h2 className="section-title">出店者一覧</h2>
        {!loading && exhibitors.length > 0 && (
          <div className="category-filter">
            {usedCategories.map((cat) => (
              <button
                key={cat}
                className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        {loading ? (
          <p style={{ color: '#999' }}>読み込み中...</p>
        ) : filteredExhibitors.length === 0 ? (
          <p style={{ color: '#999' }}>該当する出店者はいません。</p>
        ) : (
          <div className="vendor-grid">
            {filteredExhibitors.map((ex) => (
              <div key={ex.id} onClick={() => navigate(`/exhibitor/${ex.id}`)} style={{ cursor: 'pointer' }}>
                <ExhibitorCard
                  image={ex.image_url || 'https://placehold.co/400x200?text=No+Image'}
                  shopName={ex.shop_name}
                  title={ex.title}
                  description={ex.description}
                  price={ex.price}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Flow() {
  return (
    <section className="section section-gray">
      <div className="container">
        <h2 className="section-title">出店の流れ</h2>
        <div className="flow-list">
          <div className="flow-item"><span className="flow-num">1</span><div><strong>申込み</strong><p>サイトの申込みフォームから必要事項を入力して送信してください。</p></div></div>
          <div className="flow-item"><span className="flow-num">2</span><div><strong>審査・連絡</strong><p>事務局にて内容を確認後、3営業日以内に結果をご連絡します。</p></div></div>
          <div className="flow-item"><span className="flow-num">3</span><div><strong>出店準備</strong><p>出店が決まったら、ガイドラインに沿って準備を進めてください。</p></div></div>
          <div className="flow-item"><span className="flow-num">4</span><div><strong>当日出店</strong><p>イベント当日は設営時間内にブースの準備をお願いします。</p></div></div>
        </div>
      </div>
    </section>
  )
}

function Merits() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">出店するメリット</h2>
        <div className="merit-grid">
          <div className="merit-item"><h3>多くのお客様と直接つながれる</h3><p>毎回数千人が来場するイベントで、商品やサービスを直接アピールできます。</p></div>
          <div className="merit-item"><h3>新規顧客の獲得</h3><p>SNSやECでは届かない新しいお客様との出会いの場として活用できます。</p></div>
          <div className="merit-item"><h3>出店者同士のネットワーク</h3><p>他の出店者との交流を通じて、コラボレーションやビジネスの幅が広がります。</p></div>
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  return (
    <section className="section section-gray">
      <div className="container">
        <h2 className="section-title">よくある質問</h2>
        <div className="faq-list">
          {faq.map((item, i) => (
            <div key={i} className="faq-item">
              <p className="faq-q">Q. {item.q}</p>
              <p className="faq-a">A. {item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="section" id="contact">
      <div className="container">
        <h2 className="section-title">お問い合わせ</h2>
        <p className="section-text" style={{ marginBottom: '32px' }}>出店に関するご質問・ご相談はこちらからお気軽にどうぞ。</p>
        <ContactForm />
      </div>
    </section>
  )
}

function Footer() {
  return <footer className="footer"><p>&copy; 2026 XCOSS. All rights reserved.</p></footer>
}

function TopPage() {
  return (
    <div>
      <Hero />
      <About />
      <Categories />
      <Vendors />
      <Flow />
      <Merits />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  )
}

export default TopPage
