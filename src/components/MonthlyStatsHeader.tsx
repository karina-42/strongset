interface MonthlyStatsHeaderProps {
  monthlyFee: number,
  monthlyStats: MonthlyStats
}

type MonthlyStats = {
  visitCount: number
  costPerVisit: number | null
}

export function MonthlyStatsHeader({
  monthlyFee,
  monthlyStats
}: MonthlyStatsHeaderProps) {
  const {visitCount, costPerVisit} = monthlyStats
  return (
    <header>
      <h2>{visitCount >= 1 
        ? `This month: ${visitCount} visits, ￥${costPerVisit} per visit` 
        : `No visits this month, you paid ￥${monthlyFee} for nothing...`}</h2>
    </header>
  )
}