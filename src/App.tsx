import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowUpRight, BarChart3, Bell, ChevronRight, CircleHelp,
  Clock3, ClipboardList, CreditCard, Filter, LayoutDashboard, LockKeyhole, Menu,
  Minus, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Trophy,
  UserRound, Wallet, X, Zap
} from 'lucide-react'
import { loadApiSportsEvents } from './apiSports'
import type { Event, Sport } from './types'

type Tab = 'sports' | 'dashboard' | 'admin'
type Slip = { eventId: number; eventName: string; market: string; odd: number }
type Transaction = { id: string; type: 'Пополнение' | 'Ставка' | 'Выигрыш'; amount: number; reason: string; date: string }

const events: Event[] = [
  { id: 1, sport: 'Футбол', league: 'Премьер-лига · Демо', time: '19:30', home: 'Арсенал', away: 'Челси', icon: '⚽', featured: true, source: 'Демо', markets: [{ label: 'П1', value: '1.72', key: 'home' }, { label: 'X', value: '3.85', key: 'draw' }, { label: 'П2', value: '4.60', key: 'away' }] },
  { id: 2, sport: 'Футбол', league: 'Ла Лига · Сегодня', time: '22:00', home: 'Реал Мадрид', away: 'Севилья', icon: '⚽', markets: [{ label: 'П1', value: '1.28', key: 'home' }, { label: 'X', value: '6.20', key: 'draw' }, { label: 'П2', value: '9.50', key: 'away' }] },
  { id: 3, sport: 'Хоккей', league: 'КХЛ · Демо', time: '17:00', home: 'Металлург Мг', away: 'Адмирал', icon: '🏒', featured: true, source: 'Демо', markets: [{ label: 'П1', value: '1.58', key: 'home' }, { label: 'X', value: '4.70', key: 'draw' }, { label: 'П2', value: '5.10', key: 'away' }] },
  { id: 7, sport: 'Хоккей', league: 'КХЛ · 5 октября 2026', time: '18:00', home: 'Лада', away: 'Шанхай Дрэгонс', icon: '🏒', markets: [{ label: 'П1', value: '2.35', key: 'home' }, { label: 'X', value: '4.20', key: 'draw' }, { label: 'П2', value: '2.55', key: 'away' }] },
  { id: 8, sport: 'Хоккей', league: 'КХЛ · 5 октября 2026', time: '19:30', home: 'Динамо Минск', away: 'Торпедо', icon: '🏒', markets: [{ label: 'П1', value: '1.86', key: 'home' }, { label: 'X', value: '4.40', key: 'draw' }, { label: 'П2', value: '3.55', key: 'away' }] },
  { id: 9, sport: 'Хоккей', league: 'КХЛ · 5 октября 2026', time: '19:30', home: 'Ак Барс', away: 'Локомотив', icon: '🏒', markets: [{ label: 'П1', value: '2.12', key: 'home' }, { label: 'X', value: '4.10', key: 'draw' }, { label: 'П2', value: '2.88', key: 'away' }] },
  { id: 10, sport: 'Хоккей', league: 'КХЛ · 5 октября 2026', time: '19:30', home: 'ЦСКА', away: 'Салават Юлаев', icon: '🏒', markets: [{ label: 'П1', value: '1.92', key: 'home' }, { label: 'X', value: '4.30', key: 'draw' }, { label: 'П2', value: '3.40', key: 'away' }] },
  { id: 11, sport: 'Хоккей', league: 'КХЛ · 6 октября 2026', time: '17:00', home: 'Автомобилист', away: 'Авангард', icon: '🏒', markets: [{ label: 'П1', value: '2.05', key: 'home' }, { label: 'X', value: '4.15', key: 'draw' }, { label: 'П2', value: '3.05', key: 'away' }] },
  { id: 12, sport: 'Хоккей', league: 'КХЛ · 6 октября 2026', time: '17:00', home: 'Трактор', away: 'Амур', icon: '🏒', markets: [{ label: 'П1', value: '1.74', key: 'home' }, { label: 'X', value: '4.35', key: 'draw' }, { label: 'П2', value: '4.15', key: 'away' }] },
  { id: 13, sport: 'Хоккей', league: 'КХЛ · 6 октября 2026', time: '19:30', home: 'СКА', away: 'Северсталь', icon: '🏒', markets: [{ label: 'П1', value: '1.67', key: 'home' }, { label: 'X', value: '4.60', key: 'draw' }, { label: 'П2', value: '4.55', key: 'away' }] },
  { id: 14, sport: 'Хоккей', league: 'КХЛ · 7 октября 2026', time: '15:30', home: 'Сибирь', away: 'Салават Юлаев', icon: '🏒', markets: [{ label: 'П1', value: '2.48', key: 'home' }, { label: 'X', value: '4.05', key: 'draw' }, { label: 'П2', value: '2.42', key: 'away' }] },
  { id: 15, sport: 'Хоккей', league: 'КХЛ · 7 октября 2026', time: '17:00', home: 'Металлург Мг', away: 'Адмирал', icon: '🏒', markets: [{ label: 'П1', value: '1.55', key: 'home' }, { label: 'X', value: '4.80', key: 'draw' }, { label: 'П2', value: '5.25', key: 'away' }] },
  { id: 16, sport: 'Хоккей', league: 'КХЛ · 7 октября 2026', time: '19:30', home: 'Динамо Москва', away: 'Шанхай Дрэгонс', icon: '🏒', markets: [{ label: 'П1', value: '1.62', key: 'home' }, { label: 'X', value: '4.55', key: 'draw' }, { label: 'П2', value: '4.60', key: 'away' }] },
  { id: 17, sport: 'Хоккей', league: 'КХЛ · 7 октября 2026', time: '19:30', home: 'Сочи', away: 'Спартак', icon: '🏒', markets: [{ label: 'П1', value: '3.85', key: 'home' }, { label: 'X', value: '4.30', key: 'draw' }, { label: 'П2', value: '1.78', key: 'away' }] },
  { id: 18, sport: 'Хоккей', league: 'КХЛ · 8 октября 2026', time: '17:00', home: 'Трактор', away: 'Амур', icon: '🏒', markets: [{ label: 'П1', value: '1.74', key: 'home' }, { label: 'X', value: '4.35', key: 'draw' }, { label: 'П2', value: '4.15', key: 'away' }] },
  { id: 19, sport: 'Хоккей', league: 'КХЛ · 8 октября 2026', time: '19:10', home: 'Динамо Минск', away: 'СКА', icon: '🏒', markets: [{ label: 'П1', value: '2.25', key: 'home' }, { label: 'X', value: '4.20', key: 'draw' }, { label: 'П2', value: '2.70', key: 'away' }] },
  { id: 20, sport: 'Хоккей', league: 'КХЛ · 8 октября 2026', time: '19:30', home: 'Торпедо', away: 'Северсталь', icon: '🏒', markets: [{ label: 'П1', value: '1.95', key: 'home' }, { label: 'X', value: '4.25', key: 'draw' }, { label: 'П2', value: '3.25', key: 'away' }] },
  { id: 21, sport: 'Хоккей', league: 'КХЛ · 8 октября 2026', time: '19:30', home: 'Нефтехимик', away: 'Авангард', icon: '🏒', markets: [{ label: 'П1', value: '2.85', key: 'home' }, { label: 'X', value: '4.10', key: 'draw' }, { label: 'П2', value: '2.05', key: 'away' }] },
  { id: 22, sport: 'Хоккей', league: 'КХЛ · 9 октября 2026', time: '17:00', home: 'Металлург Мг', away: 'Салават Юлаев', icon: '🏒', markets: [{ label: 'П1', value: '1.88', key: 'home' }, { label: 'X', value: '4.35', key: 'draw' }, { label: 'П2', value: '3.30', key: 'away' }] },
  { id: 23, sport: 'Хоккей', league: 'КХЛ · 9 октября 2026', time: '19:30', home: 'Сочи', away: 'Спартак', icon: '🏒', markets: [{ label: 'П1', value: '3.85', key: 'home' }, { label: 'X', value: '4.30', key: 'draw' }, { label: 'П2', value: '1.78', key: 'away' }] },
  { id: 24, sport: 'Хоккей', league: 'КХЛ · 9 октября 2026', time: '19:30', home: 'Динамо Москва', away: 'ЦСКА', icon: '🏒', markets: [{ label: 'П1', value: '2.65', key: 'home' }, { label: 'X', value: '4.25', key: 'draw' }, { label: 'П2', value: '2.20', key: 'away' }] },
  { id: 4, sport: 'Теннис', league: 'ATP Дубай · Сегодня', time: '18:45', home: 'А. Рублёв', away: 'Д. Медведев', icon: '🎾', markets: [{ label: 'П1', value: '2.10', key: 'home' }, { label: 'П2', value: '1.68', key: 'away' }] },
  { id: 5, sport: 'Баскетбол', league: 'Евролига · Завтра', time: '21:15', home: 'ЦСКА', away: 'Фенербахче', icon: '🏀', markets: [{ label: 'П1', value: '1.82', key: 'home' }, { label: 'П2', value: '2.02', key: 'away' }] },
  { id: 6, sport: 'Футбол', league: 'Серия A · Завтра', time: '21:45', home: 'Интер', away: 'Милан', icon: '⚽', markets: [{ label: 'П1', value: '1.94', key: 'home' }, { label: 'X', value: '3.40', key: 'draw' }, { label: 'П2', value: '3.90', key: 'away' }] },
  { id: 25, sport: 'Киберспорт', league: 'CS2 · Демо-матч', time: '20:00', home: 'Natus Vincere', away: 'Spirit', icon: '🎮', source: 'Демо', markets: [{ label: 'П1', value: '1.80', key: 'home' }, { label: 'П2', value: '2.05', key: 'away' }] },
  { id: 26, sport: 'Киберспорт', league: 'Dota 2 · Демо-матч', time: '22:30', home: 'Team Liquid', away: 'Virtus.pro', icon: '🎮', source: 'Демо', markets: [{ label: 'П1', value: '1.68', key: 'home' }, { label: 'П2', value: '2.22', key: 'away' }] },
]

const initialTransactions: Transaction[] = [
  { id: 'TRX-83921', type: 'Пополнение', amount: 10000, reason: 'Стартовый демо-баланс', date: 'Сегодня, 09:42' },
  { id: 'TRX-83920', type: 'Выигрыш', amount: 2480, reason: 'Экспресс · 3 события', date: 'Вчера, 22:18' },
  { id: 'TRX-83919', type: 'Ставка', amount: -800, reason: 'Арсенал — Челси · П1', date: 'Вчера, 18:54' },
]

const upcomingEvents: Event[] = [
  { id: 101, sport: 'Футбол', league: 'Лига чемпионов · 12 октября 2026', time: '19:45', home: 'Манчестер Сити', away: 'Реал Мадрид', icon: '⚽', featured: true, markets: [{ label: 'П1', value: '1.72', key: 'home' }, { label: 'X', value: '4.10', key: 'draw' }, { label: 'П2', value: '4.35', key: 'away' }] },
  { id: 102, sport: 'Футбол', league: 'Лига чемпионов · 12 октября 2026', time: '22:00', home: 'Бавария', away: 'ПСЖ', icon: '⚽', markets: [{ label: 'П1', value: '2.02', key: 'home' }, { label: 'X', value: '3.75', key: 'draw' }, { label: 'П2', value: '3.20', key: 'away' }] },
  { id: 103, sport: 'Хоккей', league: 'КХЛ · 12 октября 2026', time: '17:00', home: 'Локомотив', away: 'Ак Барс', icon: '🏒', featured: true, markets: [{ label: 'П1', value: '1.86', key: 'home' }, { label: 'X', value: '4.20', key: 'draw' }, { label: 'П2', value: '3.65', key: 'away' }] },
  { id: 104, sport: 'Хоккей', league: 'КХЛ · 12 октября 2026', time: '19:30', home: 'СКА', away: 'ЦСКА', icon: '🏒', markets: [{ label: 'П1', value: '2.18', key: 'home' }, { label: 'X', value: '4.15', key: 'draw' }, { label: 'П2', value: '2.58', key: 'away' }] },
  { id: 105, sport: 'Футбол', league: 'Премьер-лига · 13 октября 2026', time: '18:30', home: 'Ливерпуль', away: 'Арсенал', icon: '⚽', markets: [{ label: 'П1', value: '2.15', key: 'home' }, { label: 'X', value: '3.65', key: 'draw' }, { label: 'П2', value: '3.05', key: 'away' }] },
  { id: 106, sport: 'Хоккей', league: 'КХЛ · 13 октября 2026', time: '17:00', home: 'Динамо Москва', away: 'Трактор', icon: '🏒', markets: [{ label: 'П1', value: '1.78', key: 'home' }, { label: 'X', value: '4.35', key: 'draw' }, { label: 'П2', value: '3.85', key: 'away' }] },
  { id: 107, sport: 'Киберспорт', league: 'CS2 · 14 октября 2026', time: '18:00', home: 'Natus Vincere', away: 'Team Spirit', icon: '🎮', markets: [{ label: 'П1', value: '1.84', key: 'home' }, { label: 'П2', value: '1.96', key: 'away' }] },
  { id: 108, sport: 'Киберспорт', league: 'Dota 2 · 14 октября 2026', time: '21:00', home: 'Team Liquid', away: 'Gaimin Gladiators', icon: '🎮', markets: [{ label: 'П1', value: '2.05', key: 'home' }, { label: 'П2', value: '1.76', key: 'away' }] },
  { id: 109, sport: 'Футбол', league: 'Ла Лига · 15 октября 2026', time: '20:00', home: 'Барселона', away: 'Атлетико Мадрид', icon: '⚽', markets: [{ label: 'П1', value: '1.95', key: 'home' }, { label: 'X', value: '3.80', key: 'draw' }, { label: 'П2', value: '3.60', key: 'away' }] },
  { id: 110, sport: 'Хоккей', league: 'КХЛ · 15 октября 2026', time: '19:30', home: 'Спартак', away: 'Металлург Мг', icon: '🏒', markets: [{ label: 'П1', value: '2.32', key: 'home' }, { label: 'X', value: '4.25', key: 'draw' }, { label: 'П2', value: '2.42', key: 'away' }] },
]

const money = (value: number) => `${value.toLocaleString('ru-RU')} ₽`

function App() {
  const [tab, setTab] = useState<Tab>(() => new URLSearchParams(window.location.search).get('admin') === '1' ? 'admin' : 'sports')
  const [sport, setSport] = useState<Sport>('Все')
  const [liveEvents, setLiveEvents] = useState<Event[]>(upcomingEvents)
  const [apiState, setApiState] = useState<'demo' | 'loading' | 'live'>('demo')
  const [query, setQuery] = useState('')
  const [slip, setSlip] = useState<Slip[]>([])
  const [stake, setStake] = useState('500')
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('pulse-balance') || 11680))
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try { return JSON.parse(localStorage.getItem('pulse-transactions') || JSON.stringify(initialTransactions)) } catch { return initialTransactions }
  })
  const [notice, setNotice] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => { localStorage.setItem('pulse-balance', String(balance)) }, [balance])
  useEffect(() => { localStorage.setItem('pulse-transactions', JSON.stringify(transactions)) }, [transactions])
  useEffect(() => {
    let cancelled = false
    setApiState('loading')
    loadApiSportsEvents().then((remoteEvents) => {
      if (cancelled) return
      if (remoteEvents.length) {
        setLiveEvents(remoteEvents)
        setApiState('live')
      } else {
        setLiveEvents(upcomingEvents)
        setApiState('demo')
      }
    }).catch(() => {
      if (!cancelled) {
        setLiveEvents(upcomingEvents)
        setApiState('demo')
      }
    })
    return () => { cancelled = true }
  }, [])
  useEffect(() => {
    const hashId = Number(window.location.hash.replace('#event=', ''))
    const event = liveEvents.find((item) => item.id === hashId)
    if (event) setSelectedEvent(event)
  }, [liveEvents])
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(''), 3200); return () => clearTimeout(timer) } }, [notice])

  const filteredEvents = useMemo(() => liveEvents.filter((event) => {
    const matchesSport = sport === 'Все' || event.sport === sport
    const matchesQuery = `${event.home} ${event.away} ${event.league}`.toLowerCase().includes(query.toLowerCase())
    return matchesSport && matchesQuery
  }), [sport, query])
  const totalOdds = slip.reduce((sum, item) => sum * item.odd, 1)
  const potentialWin = Number(stake || 0) * totalOdds

  const addToSlip = (event: Event, market: { label: string; value: string }) => {
    const exists = slip.find((item) => item.eventId === event.id)
    if (exists) setSlip((current) => current.map((item) => item.eventId === event.id ? { ...item, market: market.label, odd: Number(market.value) } : item))
    else setSlip((current) => [...current, { eventId: event.id, eventName: `${event.home} — ${event.away}`, market: market.label, odd: Number(market.value) }])
    setNotice('Событие добавлено в купон')
  }
  const removeFromSlip = (id: number) => setSlip((current) => current.filter((item) => item.eventId !== id))
  const placeBet = () => {
    const amount = Number(stake)
    if (!amount || amount < 10) return setNotice('Минимальная ставка — 10 ₽')
    if (amount > balance) return setNotice('Недостаточно средств на демо-балансе')
    if (!slip.length) return setNotice('Добавьте событие в купон')
    setBalance((value) => value - amount)
    setTransactions((list) => [{ id: `BET-${Date.now().toString().slice(-5)}`, type: 'Ставка', amount: -amount, reason: `${slip.length} событ. · ${slip.map((item) => item.market).join(', ')}`, date: 'Только что' }, ...list])
    setSlip([])
    setNotice('Ставка принята — удачи!')
  }
  const adjustBalance = (amount: number, reason: string) => {
    setBalance((value) => value + amount)
    setTransactions((list) => [{ id: `ADM-${Date.now().toString().slice(-5)}`, type: amount > 0 ? 'Пополнение' : 'Ставка', amount, reason, date: 'Только что' }, ...list])
    setNotice('Баланс обновлён, запись добавлена в журнал')
  }
  const topUpBalance = (amount: number) => {
    adjustBalance(amount, 'Пользовательское виртуальное пополнение')
    setTab('dashboard')
  }
  const openEvent = (event: Event) => {
    const url = new URL(window.location.href)
    url.search = ''
    url.hash = `event=${event.id}`
    const link = document.createElement('a')
    link.href = url.toString()
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => setTab('sports')}><span className="brand-mark"><Zap size={18} fill="currentColor" /></span><span>mex<span>bet</span></span></button>
          <nav className={mobileMenu ? 'main-nav open' : 'main-nav'}>
            <button className={tab === 'sports' ? 'nav-item active' : 'nav-item'} onClick={() => { setTab('sports'); setMobileMenu(false) }}><Trophy size={17} /> События</button>
            <button className={tab === 'dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => { setTab('dashboard'); setMobileMenu(false) }}><LayoutDashboard size={17} /> Мой профиль</button>
          </nav>
          <div className="header-actions"><button className="icon-btn" aria-label="Уведомления"><Bell size={18} /><i /></button><div className="header-balance"><span>Баланс</span><strong>{money(balance)}</strong></div><div className="avatar">АИ</div><button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button></div>
        </div>
      </header>

      <main className="page">
        {tab === 'sports' && <SportsPage events={filteredEvents} apiState={apiState} sport={sport} setSport={setSport} query={query} setQuery={setQuery} slip={slip} addToSlip={addToSlip} openEvent={openEvent} removeFromSlip={removeFromSlip} stake={stake} setStake={setStake} totalOdds={totalOdds} potentialWin={potentialWin} placeBet={placeBet} />}
        {tab === 'dashboard' && <Dashboard balance={balance} transactions={transactions} onNavigate={setTab} onTopUp={topUpBalance} />}
        {tab === 'admin' && <Admin balance={balance} transactions={transactions} adjustBalance={adjustBalance} />}
      </main>
      <footer className="footer"><span>© 2026 MEXBET Demo</span><span><LockKeyhole size={13} /> Только виртуальные ставки · Без денежных операций</span><span>Правила демо <CircleHelp size={14} /></span></footer>
      {notice && <div className="toast"><span className="toast-check">✓</span>{notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
      {selectedEvent && <EventDetails event={selectedEvent} selected={slip.find((item) => item.eventId === selectedEvent.id)} onSelect={(market) => addToSlip(selectedEvent, market)} onClose={() => setSelectedEvent(null)} />}
    </div>
  )
}

function SportsPage(props: { events: Event[]; apiState: 'demo' | 'loading' | 'live'; sport: Sport; setSport: (s: Sport) => void; query: string; setQuery: (s: string) => void; slip: Slip[]; addToSlip: (e: Event, m: { label: string; value: string }) => void; openEvent: (event: Event) => void; removeFromSlip: (id: number) => void; stake: string; setStake: (s: string) => void; totalOdds: number; potentialWin: number; placeBet: () => void }) {
  const { events, apiState, sport, setSport, query, setQuery, slip, addToSlip, openEvent, removeFromSlip, stake, setStake, totalOdds, potentialWin, placeBet } = props
  return <div className="sports-layout">
    <section className="content-column">
      <div className="eyebrow"><span className={apiState === 'live' ? 'live-dot' : 'live-dot muted-dot'} /> {apiState === 'live' ? 'LIVE API-SPORTS' : apiState === 'loading' ? 'ЗАГРУЗКА ЛИНИИ' : 'ДЕМО-ЛИНИЯ'} <span className="eyebrow-divider" /> {apiState === 'live' ? 'Реальные события' : 'Ключ API не подключён'}</div>
      <div className="page-heading"><div><h1>Спортивные события</h1><p>Выберите исход и соберите свой купон</p></div><button className="outline-btn"><SlidersHorizontal size={16} /> Настроить вид</button></div>
      <div className="hero-card"><div className="hero-copy"><span className="hero-label"><Sparkles size={14} /> ВЫБОР ДНЯ</span><h2>Большой футбольный<br /><em>уикенд</em> уже здесь</h2><p>Лучшие матчи европейских лиг в одном месте</p><button className="hero-btn" onClick={() => setSport('Футбол')}>Смотреть матчи <ChevronRight size={16} /></button></div><div className="hero-ball">⚽</div><div className="hero-glow" /></div>
      <div className="toolbar"><div className="sport-tabs">{(['Все', 'Футбол', 'Хоккей', 'Киберспорт', 'Теннис', 'Баскетбол'] as Sport[]).map((item) => <button key={item} className={sport === item ? 'sport-tab selected' : 'sport-tab'} onClick={() => setSport(item)}>{item === 'Все' ? 'Все виды' : item}</button>)}</div><label className="search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск команды или лиги" /></label><button className="filter-mobile"><Filter size={16} /></button></div>
      <div className="data-note">MEXBET загружает футбольные и хоккейные события через API-Sports. Если ключ не задан, показывается резервная линия; киберспорт остаётся отдельной демо-категорией.</div>
      <div className="section-line"><h3>{sport === 'Все' ? 'Все события' : sport} <span>{events.length}</span></h3><button className="sort-btn"><Clock3 size={15} /> Сначала ближайшие <ChevronRight size={14} /></button></div>
      <div className="event-list">{events.map((event) => <EventCard key={event.id} event={event} selected={slip.find((item) => item.eventId === event.id)} onSelect={(market) => addToSlip(event, market)} onOpen={() => openEvent(event)} />)}{!events.length && <div className="empty-state"><Search size={28} /><h3>Ничего не нашли</h3><p>Попробуйте изменить запрос или фильтр</p></div>}</div>
    </section>
    <BetSlip slip={slip} remove={removeFromSlip} stake={stake} setStake={setStake} totalOdds={totalOdds} potentialWin={potentialWin} placeBet={placeBet} />
  </div>
}

function EventCard({ event, selected, onSelect, onOpen }: { event: Event; selected?: Slip; onSelect: (market: { label: string; value: string }) => void; onOpen: () => void }) {
  const href = `${window.location.pathname}#event=${event.id}`
  return <article className={event.featured ? 'event-card featured-card' : 'event-card'}><div className="event-meta"><span className="sport-icon">{event.icon}</span><a className="event-title" href={href} target="_blank" rel="noopener noreferrer"><small>{event.league}</small><strong>{event.time} <i>•</i> {event.status || 'Прематч'}</strong></a>{event.featured && <span className="hot-badge">🔥 Популярное</span>}<a className="more-btn" href={href} target="_blank" rel="noopener noreferrer">•••</a></div><a className="teams teams-button" href={href} target="_blank" rel="noopener noreferrer"><div><span>{event.home.slice(0, 2).toUpperCase()}</span><strong>{event.home}</strong></div><div className="versus">VS</div><div className="away"><strong>{event.away}</strong><span>{event.away.slice(0, 2).toUpperCase()}</span></div></a><div className="markets">{event.markets.map((market) => <button key={market.key} className={selected?.market === market.label ? 'market selected-market' : 'market'} onClick={() => onSelect(market)}><span>{market.label}</span><strong>{market.value}</strong>{selected?.market === market.label && <i>✓</i>}</button>)}<a className="all-markets" href={href} target="_blank" rel="noopener noreferrer">Все исходы <ChevronRight size={14} /></a></div></article>
}

function BetSlip({ slip, remove, stake, setStake, totalOdds, potentialWin, placeBet }: { slip: Slip[]; remove: (id: number) => void; stake: string; setStake: (s: string) => void; totalOdds: number; potentialWin: number; placeBet: () => void }) {
  const express = slip.length > 1
  return <aside className="betslip"><div className="slip-head"><div><h2>Мой купон <span>{slip.length}</span></h2><p>{express ? 'Экспресс · все выбранные события' : 'Одиночная ставка'}</p></div><button className="slip-settings"><Settings2 size={17} /></button></div><div className="slip-mode"><button className={!express ? 'active' : ''}>Одиночная</button><button className={express ? 'active' : ''}>Экспресс</button></div>{slip.length ? <div className="slip-items">{slip.map((item) => <div className="slip-item" key={item.eventId}><div><small>{item.eventName}</small><strong>{item.market} <span>@ {item.odd.toFixed(2)}</span></strong></div><button onClick={() => remove(item.eventId)}><X size={15} /></button></div>)}</div> : <div className="slip-empty"><div className="slip-empty-icon"><ClipboardList size={22} /></div><strong>Купон пока пуст</strong><p>Откройте событие и выберите исход</p></div>}<div className="slip-summary"><div><span>{express ? 'Коэффициент экспресса' : 'Коэффициент'}</span><strong>{totalOdds.toFixed(2)}</strong></div><label><span>Сумма ставки</span><div className="stake-input"><input value={stake} onChange={(e) => setStake(e.target.value.replace(/\D/g, ''))} /><span>₽</span></div></label><div><span>Возможный выигрыш</span><strong className="win">{money(potentialWin)}</strong></div></div><button className="place-btn" onClick={placeBet}>Сделать {express ? 'экспресс' : 'ставку'} <ArrowUpRight size={17} /></button><p className="slip-note"><LockKeyhole size={12} /> Ставки виртуальные, списаний нет</p></aside>
}

function EventDetails({ event, selected, onSelect, onClose }: { event: Event; selected?: Slip; onSelect: (market: { label: string; value: string }) => void; onClose: () => void }) {
  const extraMarkets = event.sport === 'Киберспорт'
    ? [{ label: 'Тотал карт больше 2.5', value: '1.72', key: 'maps-over' }, { label: 'Фора +1.5', value: '1.55', key: 'handicap' }]
    : [{ label: 'Тотал больше 2.5', value: '1.84', key: 'total-over' }, { label: 'Обе забьют', value: '1.76', key: 'both-score' }, { label: 'Точный счёт 2:1', value: '8.50', key: 'score' }]
  return <div className="modal-backdrop" onClick={onClose}><section className="event-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={19} /></button><div className="modal-kicker">{event.icon} {event.league}</div><h2>{event.home} <span>vs</span> {event.away}</h2><p className="modal-time">{event.time} · {event.status || 'Прематч'} · {event.source || 'Демо-линия'}</p><h3>Основные исходы</h3><div className="detail-markets">{event.markets.map((market) => <button key={market.key} className={selected?.market === market.label ? 'detail-market selected-market' : 'detail-market'} onClick={() => onSelect(market)}><span>{market.label}</span><strong>{market.value}</strong></button>)}</div><h3>Дополнительные рынки</h3><div className="detail-markets">{extraMarkets.map((market) => <button key={market.key} className="detail-market" onClick={() => onSelect(market)}><span>{market.label}</span><strong>{market.value}</strong></button>)}</div><button className="modal-action" onClick={onClose}>Готово</button></section></div>
}

function Dashboard({ balance, transactions, onNavigate, onTopUp }: { balance: number; transactions: Transaction[]; onNavigate: (tab: Tab) => void; onTopUp: (amount: number) => void }) {
  return <div className="dashboard"><div className="eyebrow"><Activity size={14} /> ЛИЧНЫЙ КАБИНЕТ <span className="eyebrow-divider" /> Добро пожаловать, Алексей</div><div className="page-heading"><div><h1>Мой профиль</h1><p>Следите за ставками и результатами в одном месте</p></div><button className="outline-btn" onClick={() => onNavigate('sports')}><Trophy size={16} /> К событиям</button></div><div className="stats-grid"><div className="balance-card"><div className="stat-top"><span>Доступный баланс</span><Wallet size={18} /></div><strong>{money(balance)}</strong><p><span className="positive">+12.4%</span> за последние 30 дней</p><div className="balance-chart"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div><div className="stat-card"><span>Активных ставок</span><strong>3</strong><p><span className="dot-blue" /> 2 ожидают расчёта</p><div className="stat-icon"><ClipboardList size={19} /></div></div><div className="stat-card"><span>Результат за месяц</span><strong className="positive">+4 280 ₽</strong><p><ArrowUpRight size={14} className="positive" /> ROI 18.6%</p><div className="stat-icon green"><BarChart3 size={19} /></div></div></div><div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h2>История операций</h2><p>Последние изменения баланса</p></div><button>Вся история <ChevronRight size={14} /></button></div><div className="transaction-list">{transactions.slice(0, 6).map((transaction) => <div className="transaction" key={transaction.id}><div className={transaction.amount > 0 ? 'transaction-icon green' : 'transaction-icon'}>{transaction.amount > 0 ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</div><div className="transaction-main"><strong>{transaction.type}</strong><span>{transaction.reason}</span></div><div className={transaction.amount > 0 ? 'transaction-amount positive' : 'transaction-amount'}>{transaction.amount > 0 ? '+' : ''}{money(transaction.amount)}</div><time>{transaction.date}</time></div>)}</div></section><section className="panel quick-panel"><div className="panel-heading"><div><h2>Пополнение виртуального баланса</h2><p>Доступно каждому пользователю, без платежей</p></div><Wallet size={20} /></div><div className="topup-options"><button onClick={() => onTopUp(1000)}>+1 000 ₽</button><button onClick={() => onTopUp(5000)}>+5 000 ₽</button><button onClick={() => onTopUp(10000)}>+10 000 ₽</button></div><button onClick={() => onNavigate('sports')}><span className="quick-icon purple"><Trophy size={18} /></span><span><strong>Найти событие</strong><small>Выбрать матч и коэффициент</small></span><ChevronRight size={16} /></button></section></div></div>
}

function Admin({ balance, transactions, adjustBalance }: { balance: number; transactions: Transaction[]; adjustBalance: (amount: number, reason: string) => void }) {
  const [amount, setAmount] = useState('5000')
  const [reason, setReason] = useState('Тестовое пополнение')
  return <div className="admin-page"><div className="eyebrow"><ShieldCheck size={14} /> CONTROL CENTER <span className="eyebrow-divider" /> Только для локального демо</div><div className="page-heading"><div><h1>Админ-панель</h1><p>Управление виртуальным балансом и аудит действий</p></div><span className="admin-status"><i /> Система в норме</span></div><div className="admin-warning"><ShieldCheck size={19} /><div><strong>Режим демонстрации</strong><p>Все операции выполняются только в браузере и сохраняются в localStorage. Реальных денег и платежей здесь нет.</p></div></div><div className="admin-grid"><section className="admin-adjust"><div className="panel-heading"><div><h2>Корректировка баланса</h2><p>Изменения требуют явного назначения</p></div><Wallet size={20} /></div><div className="current-balance"><span>Текущий баланс пользователя</span><strong>{money(balance)}</strong></div><label className="form-label">Сумма изменения<input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d-]/g, ''))} type="text" /><small>Используйте минус для списания</small></label><label className="form-label">Причина операции<textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} /></label><div className="admin-buttons"><button className="add-btn" onClick={() => adjustBalance(Number(amount), reason)}><Plus size={16} /> Применить изменение</button><button className="quick-amount" onClick={() => setAmount('1000')}>+1 000 ₽</button><button className="quick-amount" onClick={() => setAmount('5000')}>+5 000 ₽</button></div></section><section className="admin-audit"><div className="panel-heading"><div><h2>Журнал аудита</h2><p>Последние действия · только добавление</p></div><ClipboardList size={20} /></div><div className="audit-list">{transactions.slice(0, 7).map((tx) => <div className="audit-row" key={tx.id}><div className="audit-check">✓</div><div><strong>{tx.reason}</strong><span>{tx.id} · {tx.date}</span></div><b className={tx.amount > 0 ? 'positive' : ''}>{tx.amount > 0 ? '+' : ''}{money(tx.amount)}</b></div>)}</div></section></div></div>
}

export default App
