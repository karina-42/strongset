  import type { SleepEntry } from "../types";
  
  export function calculateSleepCount(entries: SleepEntry[], currentGoalTime: string) {
    const today = new Date()

    // Most recent Sunday
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - today.getDay())
    sunday.setHours(0, 0, 0, 0)

    let metCount = 0;
    for (const entry of entries) {
      const entryDate = new Date(entry.date)
      if (entryDate >= sunday &&
        entryDate.toLocaleDateString() !== today.toLocaleDateString() &&
        entry.metGoal &&
        entry.goalTime === currentGoalTime) {
      metCount++
      }
    } 
    return metCount
  }