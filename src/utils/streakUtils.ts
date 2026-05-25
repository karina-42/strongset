import type { MonthOverride, WorkoutEntry } from "../types";

export function calculateStreak(
  workoutHistory: WorkoutEntry[],
  monthOverrides: MonthOverride[],
): number {
  let streak = 0
  const now = new Date()

  //Start from last month
  let year = now.getFullYear()
  let month = now.getMonth() - 1

  while (true) {
    // handle January rollover
    if (month < 0) {
      month = 11
      year -= 1
    }

    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`
    const hasOverride = monthOverrides.find(o => o.yearMonth === yearMonth)
    const visits = getGymVisitsForMonth(workoutHistory, year, month)
    
    if (hasOverride || visits >= 12) {
      streak++
      month-- //go back one more month
    } else {
      break //streak is broken
    }
  }

  return streak
}

function getGymVisitsForMonth(
  workoutHistory: WorkoutEntry[],
  year: number,
  month: number,
): number {
  const gymEntries = workoutHistory.filter(e => 
    e.dateDone.getFullYear() === year &&
    e.dateDone.getMonth() === month &&
    e.area !== 'kickboxing'
  )

  const uniqueDays = new Set(
    gymEntries.map(e => 
      e.dateDone.toDateString()
    )
  )

  return uniqueDays.size
}

function getKickboxingVisitsForMonth(
  workoutHistory: WorkoutEntry[],
  year: number,
  month: number,
): number {
  const kickboxingEntries = workoutHistory.filter(e =>
    e.dateDone.getFullYear() === year &&
    e.dateDone.getMonth() === month &&
    e.area === 'kickboxing'
  )

  const uniqueDays = new Set(
    kickboxingEntries.map(e => 
      e.dateDone.toDateString()
    )
  )

  return uniqueDays.size
}

export function getLastMonthStats(
  workoutHistory: WorkoutEntry[]
): { gymVisits: number, kickboxingVisits: number, yearMonth: string } {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() - 1

  if (month < 0) {
    month = 11
    year =- 1
  }

  const gymVisits = getGymVisitsForMonth(workoutHistory, year, month)
  const kickboxingVisits = getKickboxingVisitsForMonth(workoutHistory, year, month)

  const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`
  return { gymVisits, kickboxingVisits, yearMonth }
}