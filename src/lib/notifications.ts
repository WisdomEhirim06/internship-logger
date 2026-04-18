export const NOTIFICATION_MESSAGES = {
  // 5pm — gentle first nudge
  first: [
    { title: "Logger", body: "Hey! How was your day at the office? Log it before you forget." },
    { title: "Logger", body: "Your logbook is waiting. 5 minutes now saves hours of guessing later." },
    { title: "Logger", body: "Quick reminder — your SIWES day isn't fully over until it's logged." },
    { title: "Logger", body: "What did you do today? Log it while it's still fresh in your head." },
    { title: "Logger", body: "Remember: your supervisor will sign that log. Make it count." },
    { title: "Logger", body: "Don't let today's work go undocumented. Just 3 fields. Open the app." },
    { title: "Logger", body: "You actually worked today. Prove it. Your logbook needs the receipts." },
    { title: "Logger", body: "Your lecturer wants to see real progress. Give them something to read." },
    { title: "Logger", body: "Tired after work? We know. You still need to log though. 3 fields only." },
    { title: "Logger", body: "Today happened. Your logbook doesn't know that yet. Let it know." },
  ],
  // 7pm — firmer second reminder
  second: [
    { title: "Still here 👀", body: "Still haven't logged today. Don't make it a 9pm thing." },
    { title: "Ehen, remember Logger?", body: "It's 7pm. The day is winding down. So should your logging excuses." },
    { title: "Defense day loading...", body: "Imagine defending your logbook and not remembering what you did this week." },
    { title: "Your streak is on the line", body: "No entry yet today. Don't break the chain now." },
    { title: "Second reminder", body: "Every day you skip is one more day you'll have to guess later. Log today." },
    { title: "Logger", body: "The blank line for today is staring at you. Fill it before it fills you with regret." },
    { title: "We believe in you", body: "Second reminder. Three fields. One sentence. You can do this. Log. Now." },
    { title: "Real talk", body: "Your SIWES defense is coming. Build the evidence now, not in panic." },
    { title: "Procrastination alert", body: "Procrastination is your enemy. Your logbook is your alibi. Choose wisely." },
    { title: "Still no entry?", body: "Your classmates are already ahead. Don't let a blank day haunt you at submission." },
  ],
  // 9pm — final call, urgent + funny
  final: [
    { title: "Last call tonight 🚨", body: "Last call. Your logbook or your grade. The choice is easy. Log it." },
    { title: "9pm. Final notice.", body: "If you don't log now, you'll forget by tomorrow. This is not a drill." },
    { title: "Picture this...", body: "Standing in front of your lecturer with an empty logbook. Avoid that scene. Log tonight." },
    { title: "Logger — Final Reminder", body: "Tonight's last reminder. Tomorrow, today is already a blur. Don't risk it." },
    { title: "Your future self is begging", body: "Your defense day self is begging your today self to just log it. Listen to them." },
    { title: "It's 9pm o", body: "The longer you wait, the vaguer your memory gets. Log now or cry later." },
    { title: "After this, you're on your own", body: "Final warning for today. After this, you're on your own at 3am trying to remember." },
    { title: "Imagine the embarrassment", body: "Imagine your supervisor asking what you did today and you say 'I don't remember'. Log it." },
    { title: "This is your last reminder", body: "Last reminder for today. Go open the app. Right now. Seriously." },
    { title: "Logger won't beg again tonight", body: "Your logbook doesn't fill itself. Neither does your grade. Log. Tonight." },
  ]
}

export function pickMessage(slot: 'first' | 'second' | 'final') {
  const pool = NOTIFICATION_MESSAGES[slot]
  return pool[Math.floor(Math.random() * pool.length)]
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleNotificationsViaSW(hasLoggedToday: boolean) {
  if (!navigator.serviceWorker?.controller) return

  navigator.serviceWorker.controller.postMessage({
    type: 'SCHEDULE_NOTIFICATIONS',
    hasLoggedToday,
  })
}
