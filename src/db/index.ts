import Dexie, { type Table } from 'dexie'

export interface Profile {
  id?: number
  name: string
  matricNo: string
  department: string
  institution: string
  organization: string
  supervisor: string
  sectionBased: string
  startDate: string
  endDate: string
  notificationEnabled: boolean
}

export interface Entry {
  id?: number
  date: string        // YYYY-MM-DD
  weekNumber: number
  task: string
  outcome: string
  learning: string
  summary: string
  templateUsed: number
  createdAt: number
}

export interface Week {
  id?: number
  weekNumber: number
  projectForWeek: string
  sectionBased: string
}

class LoggerDB extends Dexie {
  profile!: Table<Profile>
  entries!: Table<Entry>
  weeks!: Table<Week>

  constructor() {
    super('LoggerDB')
    this.version(1).stores({
      profile: '++id',
      entries: '++id, date, weekNumber',
      weeks:   '++id, &weekNumber',
    })
  }
}

export const db = new LoggerDB()

export async function getProfile(): Promise<Profile | undefined> {
  return db.profile.toCollection().first()
}

export async function saveProfile(p: Omit<Profile, 'id'>): Promise<void> {
  const existing = await getProfile()
  if (existing?.id) {
    await db.profile.update(existing.id, p)
  } else {
    await db.profile.add(p)
  }
}

export async function getEntry(date: string): Promise<Entry | undefined> {
  return db.entries.where('date').equals(date).first()
}

export async function saveEntry(entry: Omit<Entry, 'id'>): Promise<void> {
  const existing = await getEntry(entry.date)
  if (existing?.id) {
    await db.entries.update(existing.id, entry)
  } else {
    await db.entries.add(entry)
  }
}

export async function getEntriesForWeek(weekNumber: number): Promise<Entry[]> {
  return db.entries.where('weekNumber').equals(weekNumber).toArray()
}

export async function getEntriesForMonth(year: number, month: number): Promise<Entry[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end   = `${year}-${String(month).padStart(2, '0')}-31`
  return db.entries.where('date').between(start, end, true, true).toArray()
}

export async function getAllEntries(): Promise<Entry[]> {
  return db.entries.orderBy('date').toArray()
}

export async function getWeekMeta(weekNumber: number): Promise<Week | undefined> {
  return db.weeks.where('weekNumber').equals(weekNumber).first()
}

export async function saveWeekMeta(w: Omit<Week, 'id'>): Promise<void> {
  const existing = await getWeekMeta(w.weekNumber)
  if (existing?.id) {
    await db.weeks.update(existing.id, w)
  } else {
    await db.weeks.add(w)
  }
}
