import type { WorkoutEntry } from "../types"

export function calculateMonthlyStats(
  workoutHistory: WorkoutEntry[],
  monthlyFee: number
) {
  // const now = new Date()
  // const currentMonth = now.getMonth()
  // const currentYear = now. getFullYear()
  // const entriesThisMonth = workoutHistory.filter(entry => {
  //   const date = entry.dateDone
  //   return (
  //     date.getMonth() === currentMonth &&
  //     date.getFullYear() === currentYear
  //   )
  // })
  // const uniqueDays = new Set(
  //   entriesThisMonth.map(entry =>
  //     entry.dateDone.toDateString()
  //   )
  // )
  // const visitCount = uniqueDays.size
  const visitCount = 0
  const costPerVisit = 
    visitCount > 0 
    ? Math.round(monthlyFee / visitCount)
    : null

  return {
    visitCount,
    costPerVisit
  }

}
