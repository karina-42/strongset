import type { WorkoutEntry } from "../types"

export function calculateMonthlyStats(
  workoutHistory: WorkoutEntry[],
  monthlyFee: number
) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now. getFullYear()
  const entriesThisMonth = workoutHistory.filter(entry => {
    const date = entry.dateDone
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    )
  })
  const gymEntriesThisMonth = entriesThisMonth.filter(e => e.area !== "kickboxing")
  const kickboxingEntriesThisMonth = entriesThisMonth.filter(e => e.area === "kickboxing")

  const gymUniqueDays = new Set(
    gymEntriesThisMonth.map(entry =>
      entry.dateDone.toDateString()
    )
  )
  const kickboxingUniqueDays = new Set(
    kickboxingEntriesThisMonth.map(entry =>
      entry.dateDone.toDateString()
    )
  )

  const gymVisitCount = gymUniqueDays.size
  const kickboxingVisitCount = kickboxingUniqueDays.size
  const totalVisits = gymVisitCount + kickboxingVisitCount
  
  const costPerVisit = 
    totalVisits > 0 
    ? Math.round(monthlyFee / totalVisits)
    : null

  const gymGoal = 12;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const expectedGymVisits = Math.floor((dayOfMonth / daysInMonth) * gymGoal);
  const gymVisitsAheadOfPace = gymVisitCount - expectedGymVisits;
  const hasMetGymGoal = gymVisitCount >= gymGoal;

  return {
    gymVisitCount,
    kickboxingVisitCount,
    costPerVisit,
    expectedGymVisits,
    gymVisitsAheadOfPace,
    hasMetGymGoal
  }

}
