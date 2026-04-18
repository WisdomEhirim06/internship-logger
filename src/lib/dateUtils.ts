export function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function today(): string {
  return toDateStr(new Date())
}

export function parseDate(s: string): Date {
  return new Date(s + 'T00:00:00')
}

export function weekNumberFromStart(startDate: string, date: string): number {
  const start = parseDate(startDate)
  const d     = parseDate(date)
  const diff  = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.floor(diff / 7) + 1
}

export function weekdayName(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[parseDate(dateStr).getDay()]
}

export function formatDisplay(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

export function getWorkdaysInRange(startDate: string, endDate: string): string[] {
  const days: string[] = []
  const cur = parseDate(startDate)
  const end = parseDate(endDate)
  while (cur <= end) {
    const dow = cur.getDay()
    if (dow >= 1 && dow <= 6) days.push(toDateStr(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export function getWeekRange(startDate: string, weekNumber: number): { from: string; to: string } {
  const start = parseDate(startDate)
  const from  = new Date(start)
  from.setDate(start.getDate() + (weekNumber - 1) * 7)
  const to = new Date(from)
  to.setDate(from.getDate() + 5) // Mon–Sat
  return { from: toDateStr(from), to: toDateStr(to) }
}

export function getMissingWorkdays(startDate: string, entries: { date: string }[]): string[] {
  const loggedSet = new Set(entries.map(e => e.date))
  const now = today()
  const days = getWorkdaysInRange(startDate, now)
  return days.filter(d => !loggedSet.has(d))
}

export function getCurrentStreak(entries: { date: string }[]): number {
  if (!entries.length) return 0
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  const cur = new Date()
  for (const entry of sorted) {
    const d = parseDate(entry.date)
    const dow = d.getDay()
    if (dow === 0) continue // skip Sunday
    const diff = Math.round((cur.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff > 2) break
    streak++
    cur.setDate(cur.getDate() - 1)
    while (cur.getDay() === 0) cur.setDate(cur.getDate() - 1)
  }
  return streak
}

export function monthName(month: number): string {
  const names = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December']
  return names[month - 1]
}

export function daysUntilEnd(endDate: string): number {
  const end  = parseDate(endDate)
  const now  = new Date()
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}
