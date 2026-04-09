import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../EventDetailPage.css'

// ランダムな入場券コードを生成
const generateTicketCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'TKT-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [ticketCount, setTicketCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchEvent()
    if (isAuthenticated && user) {
      fetchTicketInfo()
    }
  }, [id, isAuthenticated, user])

  const fetchEvent = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setEvent(data)
    setLoading(false)
  }

  const fetchTicketInfo = async () => {
    // このイベントの既存チケット確認
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_id', id)
      .eq('status', 'active')
      .single()
    if (existingTicket) setTicket(existingTicket)

    // 有効チケット総数確認
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'active')
    setTicketCount(count || 0)
  }

  const handleIssueTicket = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setIssuing(true)
    setError('')

    try {
      // 重複チェック
      if (ticket) {
        setError('このイベントの入場券はすでに発行済みです。')
        setIssuing(false)
        return
      }

      // 3件制限チェック
      if (ticketCount >= 3) {
        setError('入場券の保有上限（3件）に達しています。既存の入場券をご確認ください。')
        setIssuing(false)
        return
      }

      const ticketCode = generateTicketCode()
      const { data, error: insertError } = await supabase
        .from('tickets')
        .insert([{
          user_id: user.id,
          event_id: parseInt(id),
          ticket_code: ticketCode,
          status: 'active',
        }])
        .select()
        .single()

      if (insertError) throw insertError

      setTicket(data)
      setTicketCount(ticketCount + 1)
      setSuccess(true)
    } catch (err) {
      setError('入場券の発行に失敗しました: ' + err.message)
    } finally {
      setIssuing(false)
    }
  }

  if (loading) return (
    <div className="event-detail-page">
      <div className="event-detail-container">
        <p>読み込み中...</p>
      </div>
    </div>
  )

  if (!event) return (
    <div className="event-detail-page">
      <div className="event-detail-container">
        <p>イベントが見つかりませんでした。</p>
        <button onClick={() => navigate('/events')}>イベント一覧に戻る</button>
      </div>
    </div>
  )

  return (
    <div className="event-detail-page">
      <div className="event-detail-header">
        <button className="event-back-btn" onClick={() => navigate('/events')}>← イベント一覧に戻る</button>
      </div>

      <div className="event-detail-container">
        {/* イベント情報 */}
        <div className="event-detail-card">
          <h1 className="event-detail-name">{event.name}</h1>
          <div className="event-detail-info-list">
            <div className="event-detail-info-row">
              <span className="event-detail-label">📅 開催日</span>
              <span className="event-detail-value">{event.date}</span>
            </div>
            <div className="event-detail-info-row">
              <span className="event-detail-label">🕐 時間</span>
              <span className="event-detail-value">{event.time}</span>
            </div>
            <div className="event-detail-info-row">
              <span className="event-detail-label">📍 会場</span>
              <span className="event-detail-value">{event.venue}</span>
            </div>
            <div className="event-detail-info-row">
              <span className="event-detail-label">🗺️ 住所</span>
              <span className="event-detail-value">{event.address}</span>
            </div>
            {event.note && (
              <div className="event-detail-info-row">
                <span className="event-detail-label">📝 備考</span>
                <span className="event-detail-value">{event.note}</span>
              </div>
            )}
          </div>
        </div>

        {/* 入場券エリア */}
        <div className="event-ticket-area">
          {!isAuthenticated ? (
            <div className="event-ticket-cta">
              <p className="event-ticket-cta-text">🎟️ 入場券の発行にはログインが必要です</p>
              <div className="event-ticket-cta-buttons">
                <Link to="/login" className="btn btn-primary">ログイン</Link>
                <Link to="/register" className="btn btn-secondary">新規登録（無料）</Link>
              </div>
            </div>
          ) : ticket ? (
            <div className="event-ticket-issued">
              <h2 className="event-ticket-issued-title">🎟️ 入場券発行済み</h2>
              <div className="event-ticket-code">{ticket.ticket_code}</div>
              <p className="event-ticket-issued-note">このコードを当日受付でご提示ください。</p>
              <button className="event-mypage-btn" onClick={() => navigate('/mypage')}>マイページで確認する</button>
            </div>
          ) : (
            <div className="event-ticket-issue">
              <h2 className="event-ticket-title">このイベントに参加する</h2>
              {error && <p className="event-ticket-error">{error}</p>}
              {success && <p className="event-ticket-success">✅ 入場券を発行しました！</p>}
              <p className="event-ticket-note">
                現在の保有入場券：{ticketCount} / 3件
              </p>
              <button
                className="event-ticket-btn"
                onClick={handleIssueTicket}
                disabled={issuing}
              >
                {issuing ? '発行中...' : '🎟️ 入場券を発行する'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
