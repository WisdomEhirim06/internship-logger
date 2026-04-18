const TEMPLATES = [
  (task: string, outcome: string, learning: string) =>
    `Worked on ${task}, achieved ${outcome}, and learned ${learning}.`,
  (task: string, outcome: string, learning: string) =>
    `Today involved ${task}. Outcome: ${outcome}. Takeaway: ${learning}.`,
  (task: string, outcome: string, learning: string) =>
    `${task} was the focus today — ${outcome}. Also gained insight into ${learning}.`,
]

export function generateSummary(
  task: string,
  outcome: string,
  learning: string,
  templateIndex?: number
): { summary: string; templateUsed: number } {
  const idx = templateIndex !== undefined
    ? templateIndex
    : Math.floor(Math.random() * TEMPLATES.length)
  const summary = TEMPLATES[idx](task.trim(), outcome.trim(), learning.trim())
  return { summary, templateUsed: idx }
}
