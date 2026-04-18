# Logger — SIWES Logbook Companion

A PWA (Progressive Web App) that helps FUTO students fill their SIWES physical logbooks consistently. Log your daily internship activities in under 3 minutes, get Duolingo-style reminders, and export a ready-to-copy formatted logbook at any time.

## The Problem

The SIWES physical logbook requires a one-line daily summary (Mon–Sat) plus weekly and monthly summaries. Students procrastinate, forget what they did, and end up guessing weeks of work before submission — leading to poor grades at defense.

## What Logger Does

- **3-field daily entry** — Task, Outcome, Learning. Takes under 3 minutes.
- **Auto-generated one-liner** — Picks from 3 rotating sentence templates, producing the exact line you copy into your physical book.
- **Streak + missing days counter** — Shows exactly how many days you've missed and motivates you not to break the chain.
- **Backfill** — Log up to 7 days back for days you missed.
- **Weekly view** — Mirrors Section IV of the physical FUTO SIWES logbook exactly.
- **Export** — Generate a plain text list or formatted PDF of any week or month, ready to transcribe into the physical book.
- **Duolingo-style reminders** — 30 rotating campus-vibe notifications at 5pm, 7pm, and 9pm if you haven't logged. They escalate.

## Privacy

**Your data never leaves your device.** No accounts. No backend. No cloud sync. Everything is stored in your browser's IndexedDB. If you uninstall the app, your data is gone — export regularly.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Storage | Dexie.js (IndexedDB) |
| PDF Export | jsPDF |
| PWA / Offline | vite-plugin-pwa + Workbox |
| Notifications | Service Worker + Web Notifications API |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and complete the one-time onboarding (name, matric number, department, organization, supervisor, internship dates).

## Build & Deploy

```bash
npm run build
```

Output is in `dist/`. Deploy to any static host — Netlify, Vercel, GitHub Pages.

## Design

White primary background, hot pink (`#FF2D78`) accent, black (`#0D0D0D`) text. Minimalist, spacious, mobile-first (max-width 480px). Matches the pink cover of the FUTO SIWES logbook.

## Notification Schedule

| Time | Tone |
|---|---|
| 5:00 PM | Gentle first nudge |
| 7:00 PM | Firmer second reminder |
| 9:00 PM | Final call — urgent and campus-flavored |

10 different messages per slot (30 total), selected randomly so they never feel repetitive.

---

Built for FUTO SIWES students. Works for any SIWES student at any institution.
