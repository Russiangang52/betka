import type { Event } from './types'

type ApiFixture = {
  fixture?: { id?: number; date?: string; status?: { short?: string } }
  teams?: { home?: { name?: string }; away?: { name?: string } }
  league?: { name?: string }
}

type ApiHockeyGame = {
  id?: number
  date?: string
  status?: { short?: string }
  teams?: { home?: { name?: string }; away?: { name?: string } }
  league?: { name?: string }
}

type ApiOdds = {
  response?: Array<{
    bookmakers?: Array<{
      bets?: Array<{
        name?: string
        values?: Array<{ value?: string; odd?: string }>
      }>
    }>
  }>
}

const apiKey = import.meta.env.VITE_API_SPORTS_KEY as string | undefined
const headers = apiKey ? { 'x-apisports-key': apiKey } : undefined
const cacheKey = 'mexbet-api-events-v1'
const cacheTtlMs = 10 * 60 * 1000

const fallbackMarkets = [
  { label: 'П1', value: '1.90', key: 'home' },
  { label: 'X', value: '3.80', key: 'draw' },
  { label: 'П2', value: '2.90', key: 'away' },
]

const formatEvent = (
  id: number,
  sport: Event['sport'],
  league: string,
  date: string | undefined,
  home: string,
  away: string,
  status?: string,
): Event => ({
  id,
  sport,
  league: `${league} · API-Sports`,
  time: date ? new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '—',
  startAt: date,
  home,
  away,
  icon: sport === 'Хоккей' ? '🏒' : sport === 'Футбол' ? '⚽' : '🎮',
  status: status || 'Прематч',
  source: 'API-Sports',
  markets: fallbackMarkets,
})

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`API-Sports: ${response.status}`)
  return response.json() as Promise<T>
}

const withLiveOdds = async (event: Event, url: string): Promise<Event> => {
  try {
    const payload = await getJson<ApiOdds>(url)
    const values = payload.response?.[0]?.bookmakers?.[0]?.bets?.find((bet) => /match winner|1x2|winner/i.test(bet.name || ''))?.values || []
    const pick = (name: string) => values.find((item) => item.value?.toLowerCase().includes(name))?.odd
    const home = pick(event.home.toLowerCase())
    const away = pick(event.away.toLowerCase())
    const draw = values.find((item) => item.value === 'Draw' || item.value === 'X')?.odd
    const odds = [
      home && { label: 'П1', value: home, key: 'home' },
      draw && { label: 'X', value: draw, key: 'draw' },
      away && { label: 'П2', value: away, key: 'away' },
    ].filter(Boolean) as Event['markets']
    return odds.length >= 2 ? { ...event, markets: odds } : event
  } catch {
    return event
  }
}

export async function loadApiSportsEvents(): Promise<Event[]> {
  if (!apiKey) return []
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null') as { savedAt?: number; events?: Event[] } | null
    if (cached?.savedAt && cached.events?.length && Date.now() - cached.savedAt < cacheTtlMs) return cached.events
  } catch {
    // Ignore an invalid browser cache and request a fresh line.
  }

  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return date.toISOString().slice(0, 10)
  })
  const requests = await Promise.all(dates.flatMap((date) => [
    getJson<{ response?: ApiFixture[] }>(`https://v3.football.api-sports.io/fixtures?date=${date}`),
    getJson<{ response?: ApiHockeyGame[] }>(`https://v1.hockey.api-sports.io/games?date=${date}`),
  ]).map((request) => request.then((value) => value).catch(() => ({ response: [] }))))
  const football = requests.filter((_, index) => index % 2 === 0).flatMap((item) => item.response || []) as ApiFixture[]
  const hockey = requests.filter((_, index) => index % 2 === 1).flatMap((item) => item.response || []) as ApiHockeyGame[]
  const isUpcoming = (status?: string) => !['FT', 'AET', 'PEN', 'CANC', 'PST', 'ABD'].includes(status || '')

  const events = [
    ...football.flatMap((item) => {
      const home = item.teams?.home?.name
      const away = item.teams?.away?.name
      if (!item.fixture?.id || !home || !away || !isUpcoming(item.fixture.status?.short)) return []
      return [formatEvent(item.fixture.id, 'Футбол', item.league?.name || 'Футбол', item.fixture.date, home, away, item.fixture.status?.short)]
    }),
    ...hockey.flatMap((item) => {
      const home = item.teams?.home?.name
      const away = item.teams?.away?.name
      if (!item.id || !home || !away || !isUpcoming(item.status?.short)) return []
      return [formatEvent(item.id, 'Хоккей', item.league?.name || 'Хоккей', item.date, home, away, item.status?.short)]
    }),
  ].sort((a, b) => (a.startAt || '').localeCompare(b.startAt || ''))

  const enriched = await Promise.all(events.slice(0, 30).map((event) => {
    const endpoint = event.sport === 'Хоккей'
      ? `https://v1.hockey.api-sports.io/odds?game=${event.id}`
      : `https://v3.football.api-sports.io/odds?fixture=${event.id}`
    return withLiveOdds(event, endpoint)
  }))
  const result = [...enriched, ...events.slice(30)]
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), events: result }))
  } catch {
    // The line remains usable when browser storage is unavailable.
  }
  return result
}
