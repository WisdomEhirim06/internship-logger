/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

// ── Scheduled local notifications ─────────────────────────────────────────
const FIRST_MESSAGES = [
  { title: "Logger", body: "Hey! How was your day at the office? Log it before you forget." },
  { title: "Logger", body: "Your logbook is waiting. 5 minutes now saves hours of guessing later." },
  { title: "Logger", body: "Quick reminder — your SIWES day isn't fully over until it's logged." },
  { title: "Logger", body: "What did you do today? Log it while it's still fresh in your head." },
  { title: "Logger", body: "Don't let today's work go undocumented. Just 3 fields. Open the app." },
  { title: "Logger", body: "You actually worked today. Prove it. Your logbook needs the receipts." },
  { title: "Logger", body: "Your lecturer wants to see real progress. Give them something to read." },
  { title: "Logger", body: "Tired after work? You still need to log though. 3 fields only." },
  { title: "Logger", body: "Today happened. Your logbook doesn't know that yet. Let it know." },
  { title: "Logger", body: "Remember: your supervisor will sign that log. Make it count." },
]

const SECOND_MESSAGES = [
  { title: "Still here 👀", body: "Still haven't logged today. Don't make it a 9pm thing." },
  { title: "Ehen, remember Logger?", body: "It's 7pm. The day is winding down. So should your logging excuses." },
  { title: "Defense day loading...", body: "Imagine defending your logbook and not remembering what you did this week." },
  { title: "Your streak is on the line", body: "No entry yet today. Don't break the chain now." },
  { title: "Second reminder", body: "Every day you skip is one more day you'll have to guess later. Log today." },
  { title: "Logger", body: "The blank line for today is staring at you. Fill it before it fills you with regret." },
  { title: "We believe in you", body: "Three fields. One sentence. You can do this. Log. Now." },
  { title: "Real talk", body: "Your SIWES defense is coming. Build the evidence now, not in panic." },
  { title: "Procrastination alert", body: "Procrastination is your enemy. Your logbook is your alibi. Choose wisely." },
  { title: "Still no entry?", body: "Your classmates are already ahead. Don't let a blank day haunt you at submission." },
]

const FINAL_MESSAGES = [
  { title: "Last call tonight 🚨", body: "Last call. Your logbook or your grade. The choice is easy. Log it." },
  { title: "9pm. Final notice.", body: "If you don't log now, you'll forget by tomorrow. This is not a drill." },
  { title: "Picture this...", body: "Standing in front of your lecturer with an empty logbook. Avoid that scene." },
  { title: "Logger — Final Reminder", body: "Tonight's last reminder. Tomorrow, today is already a blur. Don't risk it." },
  { title: "Your future self is begging", body: "Your defense day self is begging your today self to just log it. Listen." },
  { title: "It's 9pm o", body: "The longer you wait, the vaguer your memory gets. Log now or cry later." },
  { title: "After this, you're on your own", body: "Final warning for today. After this, you're on your own at 3am trying to remember." },
  { title: "Imagine the embarrassment", body: "Imagine your supervisor asking what you did today and you say 'I don't remember'." },
  { title: "This is your last reminder", body: "Last reminder for today. Go open the app. Right now. Seriously." },
  { title: "Logger won't beg again tonight", body: "Your logbook doesn't fill itself. Neither does your grade. Log. Tonight." },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function msUntil(hour: number, minute = 0): number {
  const now  = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  if (target <= now) return -1
  return target.getTime() - now.getTime()
}

const timers: ReturnType<typeof setTimeout>[] = []

function scheduleNotifications(hasLoggedToday: boolean) {
  timers.forEach(clearTimeout)
  timers.length = 0

  if (hasLoggedToday) return

  const slots: Array<{ hour: number; pool: typeof FIRST_MESSAGES }> = [
    { hour: 17, pool: FIRST_MESSAGES },
    { hour: 19, pool: SECOND_MESSAGES },
    { hour: 21, pool: FINAL_MESSAGES },
  ]

  for (const slot of slots) {
    const ms = msUntil(slot.hour)
    if (ms < 0) continue
    const msg = pick(slot.pool)
    const t = setTimeout(() => {
      self.registration.showNotification(msg.title, {
        body: msg.body,
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        tag: `logger-${slot.hour}`,
        data: { url: '/' },
      })
    }, ms)
    timers.push(t)
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleNotifications(event.data.hasLoggedToday)
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length) return clients[0].focus()
      return self.clients.openWindow('/')
    })
  )
})
