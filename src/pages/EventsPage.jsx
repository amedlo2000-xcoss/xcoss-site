import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../EventsPage.css'

function EventsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: true })
    if (!error) setEvents(data || [])
    setLoading(false)
  }

  return (
    <div className="events-page">
      <div className="events-page-header">
        <button className="events-back-btn" onClick={() => navigate('/mypage')}>← マイページに戻る</button>
        <h1 className="events-page-title">開催イベント一覧</h1>
      </div>
      <div className="events-page-container">
        {loading ? (
          <p className="events-page-loading">読み込み中...</p>
        ) : events.length === 0 ? (
          <p className="events-page-empty">現在公開中のイベントはありません。</p>
        ) : (
          <div className="events-page-list">
            {events.map((ev) => (
              <div key={ev.id} className="events-page-card" onClick={() => navigate(`/events/${ev.id}`)}>
                <div className="events-page-card-name">{ev.name}</div>
                <div className="events-page-card-info">📅 {ev.date}　🕐 {ev.time}</div>
                <div className="events-page-card-info">📍 {ev.venue}</div>
                {ev.note && <div className="events-page-card-note">{ev.note}</div>}
                <div className="events-page-card-btn">詳細・参加申込み →</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage
