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
  const isGoodValue = costPerVisit && costPerVisit < (monthlyFee / 8) // 8+ visits = good
  const bgColor = visitCount === 0 ? 'bg-red-50 border-red-500' :
    isGoodValue ? 'bg-emerald-50 border-emerald-500' :
    'bg-yellow-50 border-yellow-500'
  return (
    <div className={`mx-3 mb-4 p-4 ${bgColor} rounded-lg`}>
      
      <p className="text-sm font-medium text-emerald-900">
        {visitCount >= 1 
          ? `This month: ${visitCount} visits; ￥${costPerVisit?.toLocaleString()} per visit` 
          : `No visits this month; you paid ￥${monthlyFee?.toLocaleString()} for nothing...`
        }
      </p>
    </div>
  )
}