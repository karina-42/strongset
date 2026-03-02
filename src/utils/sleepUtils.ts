  import type { SleepEntry } from "../types";
  
  export function calculateStreak(sortedEntries: SleepEntry[], currentGoalTime: string) {
    let streak = 0;
    const today = new Date()
    for (const entry of sortedEntries) {
      if (entry.date.toLocaleDateString() === today.toLocaleDateString()) {
        continue        
      } else if (entry.metGoal && entry.goalTime === currentGoalTime) {
        streak++
      } else {
        break
      }
    } 
    return streak
  }