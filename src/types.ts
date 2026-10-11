export type Sport = 'Все' | 'Футбол' | 'Хоккей' | 'Киберспорт' | 'Теннис' | 'Баскетбол'

export type Event = {
  id: number
  sport: Exclude<Sport, 'Все'>
  league: string
  time: string
  status?: string
  home: string
  away: string
  icon: string
  featured?: boolean
  source?: 'API-Sports' | 'Демо'
  markets: { label: string; value: string; key: string }[]
}
