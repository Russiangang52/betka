import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowUpRight, BarChart3, Bell, ChevronRight, CircleHelp,
  Clock3, ClipboardList, CreditCard, Filter, LayoutDashboard, LockKeyhole, Menu,
  Minus, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Trophy,
  UserRound, Wallet, X, Zap
} from 'lucide-react'

type Tab = 'sports' | 'dashboard' | 'admin'
type Sport = 'Все' | 'Футбол' | 'Хоккей' | 'Теннис' | 'Баскетбол'
type Event = {
  id: number; sport: Exclude<Sport, 'Все'>; league: string; time: string; status?: string
  home: string; away: string; icon: string; featured?: boolean
  markets: { label: string; value: string; key: string }[]
}
type Slip = { eventId: number; eventName: string; market: string; odd: number }
type Transaction = { id: string; type: 'Пополнение' | 'Ставка' | 'Выигрыш'; amount: number; reason: string; date: string }

const events: Event[] = [
  { id: 1, sport: 'Футбол', league: 'Премьер-лига · Сегодня', time: '19:30', home: 'Арсенал', away: 'Челси', icon: '⚽', featured: true, markets: [{ label: 'П1', value: '1.72', key: 'home' }, { label: 'X', value: '3.85', key: 'draw' }, { label: 'П2', value: '4.60', key: 'away' }] },
  { id: 2, sport: 'Футбол', league: 'Ла Лига · Сегодня', time: '22:00', home: 'Реал Мадрид', away: 'Севилья', icon: '⚽', markets: [{ label: 'П1', value: '1.28', key: 'home' }, { label: 'X', value: '6.20', key: 'draw' }, { label: 'П2', value: '9.50', key: 'away' }] },
  { id: 3, sport: 'Хоккей', league: 'КХЛ · Сегодня', time: '20:00', home: 'СКА', away: 'Динамо Москва', icon: '🏒', featured: true, markets: [{ label: 'П1', value: '1.58', key: 'home' }, { label: 'X', value: '4.70', key: 'draw' }, { label: 'П2', value: '5.10', key: 'away' }] },
  { id: 4, sport: 'Теннис', league: 'ATP Дубай · Сегодня', time: '18:45', home: 'А. Рублёв', away: 'Д. Медведев', icon: '🎾', markets: [{ label: 'П1', value: '2.10', key: 'home' }, { label: 'П2', value: '1.68', key: 'away' }] },
  { id: 5, sport: 'Баскетбол', league: 'Евролига · Завтра', time: '21:15', home: 'ЦСКА', away: 'Фенербахче', icon: '🏀', markets: [{ label: 'П1', value: '1.82', key: 'home' }, { label: 'П2', value: '2.02', key: 'away' }] },
  { id: 6, sport: 'Футбол', league: 'Серия A · Завтра', time: '21:45', home: 'Интер', away: 'Милан', icon: '⚽', markets: [{ label: 'П1', value: '1.94', key: 'home' }, { label: 'X', value: '3.40', key: 'draw' }, { label: 'П2', value: '3.90', key: 'away' }] },
]

const initialTransactions: Transaction[] = [
  { id: 'TRX-83921', type: 'Пополнение', amount: 10000, reason: 'Стартовый демо-баланс', date: 'Сегодня, 09:42' },
  { id: 'TRX-83920', type: 'Выигрыш', amount: 2480, reason: 'Экспресс · 3 события', date: 'Вчера, 22:18' },
  { id: 'TRX-83919', type: 'Ставка', amount: -800, reason: 'Арсенал — Челси · П1', date: 'Вчера, 18:54' },
]

const money = (value: number) => `${value.toLocaleString('ru-RU')} ₽`

function App() {
  const [tab, setTab] = useState<Tab>('sports')
  const [sport, setSport] = useState<Sport>('Все')
  const [query, setQuery] = useState('')
  const [slip, setSlip] = useState<Slip[]>([])
  const [stake, setStake] = useState('500')
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('pulse-balance') || 11680))
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try { return JSON.parse(localStorage.getItem('pulse-transactions') || JSON.stringify(initialTransactions)) } catch { return initialTransactions }
  })
  const [notice, setNotice] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => { localStorage.setItem('pulse-balance', String(balance)) }, [balance])
  useEffect(() => { localStorage.setItem('pulse-transactions', JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(''), 3200); return () => clearTimeout(timer) } }, [notice])

  const filteredEvents = useMemo(() => events.filter((event) => {
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => setTab('sports')}><span className="brand-mark"><Zap size={18} fill="currentColor" /></span><span>pulse<span>book</span></span></button>
          <nav className={mobileMenu ? 'main-nav open' : 'main-nav'}>
            <button className={tab === 'sports' ? 'nav-item active' : 'nav-item'} onClick={() => { setTab('sports'); setMobileMenu(false) }}><Trophy size={17} /> События</button>
            <button className={tab === 'dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => { setTab('dashboard'); setMobileMenu(false) }}><LayoutDashboard size={17} /> Мой профиль</button>
            <button className={tab === 'admin' ? 'nav-item active' : 'nav-item'} onClick={() => { setTab('admin'); setMobileMenu(false) }}><ShieldCheck size={17} /> Админ-панель</button>
          </nav>
          <div className="header-actions"><button className="icon-btn" aria-label="Уведомления"><Bell size={18} /><i /></button><div className="header-balance"><span>Баланс</span><strong>{money(balance)}</strong></div><div className="avatar">АИ</div><button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button></div>
        </div>
      </header>

      <main className="page">
        {tab === 'sports' && <SportsPage events={filteredEvents} sport={sport} setSport={setSport} query={query} setQuery={setQuery} slip={slip} addToSlip={addToSlip} removeFromSlip={removeFromSlip} stake={stake} setStake={setStake} totalOdds={totalOdds} potentialWin={potentialWin} placeBet={placeBet} />}
        {tab === 'dashboard' && <Dashboard balance={balance} transactions={transactions} onNavigate={setTab} />}
        {tab === 'admin' && <Admin balance={balance} transactions={transactions} adjustBalance={adjustBalance} />}
      </main>
      <footer className="footer"><span>© 2025 PulseBook Demo</span><span><LockKeyhole size={13} /> Только виртуальные ставки · Без денежных операций</span><span>Правила демо <CircleHelp size={14} /></span></footer>
      {notice && <div className="toast"><span className="toast-check">✓</span>{notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
    </div>
  )
}

function SportsPage(props: { events: Event[]; sport: Sport; setSport: (s: Sport) => void; query: string; setQuery: (s: string) => void; slip: Slip[]; addToSlip: (e: Event, m: { label: string; value: string }) => void; removeFromSlip: (id: number) => void; stake: string; setStake: (s: string) => void; totalOdds: number; potentialWin: number; placeBet: () => void }) {
  const { events, sport, setSport, query, setQuery, slip, addToSlip, removeFromSlip, stake, setStake, totalOdds, potentialWin, placeBet } = props
  return <div className="sports-layout">
    <section className="content-column">
      <div className="eyebrow"><span className="live-dot" /> LIVE ДЕМО <span className="eyebrow-divider" /> Обновлено только что</div>
      <div className="page-heading"><div><h1>Спортивные события</h1><p>Выберите исход и соберите свой купон</p></div><button className="outline-btn"><SlidersHorizontal size={16} /> Настроить вид</button></div>
      <div className="hero-card"><div className="hero-copy"><span className="hero-label"><Sparkles size={14} /> ВЫБОР ДНЯ</span><h2>Большой футбольный<br /><em>уикенд</em> уже здесь</h2><p>Лучшие матчи европейских лиг в одном месте</p><button className="hero-btn" onClick={() => setSport('Футбол')}>Смотреть матчи <ChevronRight size={16} /></button></div><div className="hero-ball">⚽</div><div className="hero-glow" /></div>
      <div className="toolbar"><div className="sport-tabs">{(['Все', 'Футбол', 'Хоккей', 'Теннис', 'Баскетбол'] as Sport[]).map((item) => <button key={item} className={sport === item ? 'sport-tab selected' : 'sport-tab'} onClick={() => setSport(item)}>{item === 'Все' ? 'Все виды' : item}</button>)}</div><label className="search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск команды или лиги" /></label><button className="filter-mobile"><Filter size={16} /></button></div>
      <div className="section-line"><h3>{sport === 'Все' ? 'Все события' : sport} <span>{events.length}</span></h3><button className="sort-btn"><Clock3 size={15} /> Сначала ближайшие <ChevronRight size={14} /></button></div>
      <div className="event-list">{events.map((event) => <EventCard key={event.id} event={event} selected={slip.find((item) => item.eventId === event.id)} onSelect={(market) => addToSlip(event, market)} />)}{!events.length && <div className="empty-state"><Search size={28} /><h3>Ничего не нашли</h3><p>Попробуйте изменить запрос или фильтр</p></div>}</div>
    </section>
    <BetSlip slip={slip} remove={removeFromSlip} stake={stake} setStake={setStake} totalOdds={totalOdds} potentialWin={potentialWin} placeBet={placeBet} />
  </div>
}

function EventCard({ event, selected, onSelect }: { event: Event; selected?: Slip; onSelect: (market: { label: string; value: string }) => void }) {
  return <article className={event.featured ? 'event-card featured-card' : 'event-card'}><div className="event-meta"><span className="sport-icon">{event.icon}</span><div><small>{event.league}</small><strong>{event.time} <i>•</i> {event.status || 'Прематч'}</strong></div>{event.featured && <span className="hot-badge">🔥 Популярное</span>}<button className="more-btn">•••</button></div><div className="teams"><div><span>{event.home.slice(0, 2).toUpperCase()}</span><strong>{event.home}</strong></div><div className="versus">VS</div><div className="away"><strong>{event.away}</strong><span>{event.away.slice(0, 2).toUpperCase()}</span></div></div><div className="markets">{event.markets.map((market) => <button key={market.key} className={selected?.market === market.label ? 'market selected-market' : 'market'} onClick={() => onSelect(market)}><span>{market.label}</span><strong>{market.value}</strong>{selected?.market === market.label && <i>✓</i>}</button>)}<button className="all-markets">Ещё 24 <ChevronRight size={14} /></button></div></article>
}

function BetSlip({ slip, remove, stake, setStake, totalOdds, potentialWin, placeBet }: { slip: Slip[]; remove: (id: number) => void; stake: string; setStake: (s: string) => void; totalOdds: number; potentialWin: number; placeBet: () => void }) {
  return <aside className="betslip"><div className="slip-head"><div><h2>Мой купон <span>{slip.length}</span></h2><p>Одиночная ставка</p></div><button className="slip-settings"><Settings2 size={17} /></button></div><div className="slip-mode"><button className="active">Одиночная</button><button>Экспресс</button></div>{slip.length ? <div className="slip-items">{slip.map((item) => <div className="slip-item" key={item.eventId}><div><small>{item.eventName}</small><strong>{item.market} <span>@ {item.odd.toFixed(2)}</span></strong></div><button onClick={() => remove(item.eventId)}><X size={15} /></button></div>)}</div> : <div className="slip-empty"><div className="slip-empty-icon"><ClipboardList size={22} /></div><strong>Купон пока пуст</strong><p>Нажмите на коэффициент,<br />чтобы добавить исход</p></div>}<div className="slip-summary"><div><span>Общий коэффициент</span><strong>{totalOdds.toFixed(2)}</strong></div><label><span>Сумма ставки</span><div className="stake-input"><input value={stake} onChange={(e) => setStake(e.target.value.replace(/\D/g, ''))} /><span>₽</span></div></label><div><span>Возможный выигрыш</span><strong className="win">{money(potentialWin)}</strong></div></div><button className="place-btn" onClick={placeBet}>Сделать ставку <ArrowUpRight size={17} /></button><p className="slip-note"><LockKeyhole size={12} /> Ставки виртуальные, списаний нет</p></aside>
}

function Dashboard({ balance, transactions, onNavigate }: { balance: number; transactions: Transaction[]; onNavigate: (tab: Tab) => void }) {
  return <div className="dashboard"><div className="eyebrow"><Activity size={14} /> ЛИЧНЫЙ КАБИНЕТ <span className="eyebrow-divider" /> Добро пожаловать, Алексей</div><div className="page-heading"><div><h1>Мой профиль</h1><p>Следите за ставками и результатами в одном месте</p></div><button className="outline-btn" onClick={() => onNavigate('sports')}><Trophy size={16} /> К событиям</button></div><div className="stats-grid"><div className="balance-card"><div className="stat-top"><span>Доступный баланс</span><Wallet size={18} /></div><strong>{money(balance)}</strong><p><span className="positive">+12.4%</span> за последние 30 дней</p><div className="balance-chart"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div><div className="stat-card"><span>Активных ставок</span><strong>3</strong><p><span className="dot-blue" /> 2 ожидают расчёта</p><div className="stat-icon"><ClipboardList size={19} /></div></div><div className="stat-card"><span>Результат за месяц</span><strong className="positive">+4 280 ₽</strong><p><ArrowUpRight size={14} className="positive" /> ROI 18.6%</p><div className="stat-icon green"><BarChart3 size={19} /></div></div></div><div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h2>История операций</h2><p>Последние изменения демо-баланса</p></div><button>Вся история <ChevronRight size={14} /></button></div><div className="transaction-list">{transactions.slice(0, 6).map((transaction) => <div className="transaction" key={transaction.id}><div className={transaction.amount > 0 ? 'transaction-icon green' : 'transaction-icon'}>{transaction.amount > 0 ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</div><div className="transaction-main"><strong>{transaction.type}</strong><span>{transaction.reason}</span></div><div className={transaction.amount > 0 ? 'transaction-amount positive' : 'transaction-amount'}>{transaction.amount > 0 ? '+' : ''}{money(transaction.amount)}</div><time>{transaction.date}</time></div>)}</div></section><section className="panel quick-panel"><div className="panel-heading"><div><h2>Быстрые действия</h2><p>Часто используемые разделы</p></div></div><button onClick={() => onNavigate('sports')}><span className="quick-icon purple"><Trophy size={18} /></span><span><strong>Найти событие</strong><small>Выбрать матч и коэффициент</small></span><ChevronRight size={16} /></button><button onClick={() => onNavigate('admin')}><span className="quick-icon orange"><Plus size={18} /></span><span><strong>Пополнить демо-баланс</strong><small>Доступно только в демо</small></span><ChevronRight size={16} /></button></section></div></div>
}

function Admin({ balance, transactions, adjustBalance }: { balance: number; transactions: Transaction[]; adjustBalance: (amount: number, reason: string) => void }) {
  const [amount, setAmount] = useState('5000')
  const [reason, setReason] = useState('Тестовое пополнение')
  return <div className="admin-page"><div className="eyebrow"><ShieldCheck size={14} /> CONTROL CENTER <span className="eyebrow-divider" /> Только для локального демо</div><div className="page-heading"><div><h1>Админ-панель</h1><p>Управление виртуальным балансом и аудит действий</p></div><span className="admin-status"><i /> Система в норме</span></div><div className="admin-warning"><ShieldCheck size={19} /><div><strong>Режим демонстрации</strong><p>Все операции выполняются только в браузере и сохраняются в localStorage. Реальных денег и платежей здесь нет.</p></div></div><div className="admin-grid"><section className="admin-adjust"><div className="panel-heading"><div><h2>Корректировка баланса</h2><p>Изменения требуют явного назначения</p></div><Wallet size={20} /></div><div className="current-balance"><span>Текущий баланс пользователя</span><strong>{money(balance)}</strong></div><label className="form-label">Сумма изменения<input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d-]/g, ''))} type="text" /><small>Используйте минус для списания</small></label><label className="form-label">Причина операции<textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} /></label><div className="admin-buttons"><button className="add-btn" onClick={() => adjustBalance(Number(amount), reason)}><Plus size={16} /> Применить изменение</button><button className="quick-amount" onClick={() => setAmount('1000')}>+1 000 ₽</button><button className="quick-amount" onClick={() => setAmount('5000')}>+5 000 ₽</button></div></section><section className="admin-audit"><div className="panel-heading"><div><h2>Журнал аудита</h2><p>Последние действия · только добавление</p></div><ClipboardList size={20} /></div><div className="audit-list">{transactions.slice(0, 7).map((tx) => <div className="audit-row" key={tx.id}><div className="audit-check">✓</div><div><strong>{tx.reason}</strong><span>{tx.id} · {tx.date}</span></div><b className={tx.amount > 0 ? 'positive' : ''}>{tx.amount > 0 ? '+' : ''}{money(tx.amount)}</b></div>)}</div></section></div></div>
}

export default App
