type Frequency = 'DAILY' | 'WEEKLY'

export function getCycleId(frequency: Frequency, date: Date = new Date()): string {
  if (frequency === 'WEEKLY') {
    const week = getISOWeek(date)
    const year = getISOWeekYear(date)
    return `${year}-W${String(week).padStart(2, '0')}`
  }
  const year = date.getUTCFullYear()
  const day = getDayOfYear(date)
  return `${year}-D${String(day).padStart(3, '0')}`
}

// ISO 8601 week number (weeks start Monday, week 1 contains the year's first Thursday)
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayOfWeek = d.getUTCDay() || 7 // make Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek) // shift to Thursday of the same week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

// The year a given date's ISO week belongs to (can differ from calendar year near year boundaries)
function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayOfWeek = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek)
  return d.getUTCFullYear()
}

function getDayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000) + 1
}
