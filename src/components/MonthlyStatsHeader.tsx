import { getVisitGradientClasses } from "../utils/visitColors"
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
    <div className={`mx-3 mb-4 p-4 border-l-4 ${getVisitGradientClasses(visitCount)} rounded-lg`}>
      <p className="text-sm font-medium">
        {visitCount >= 12 && '🏆 '}
        {visitCount >= 1 
          ? `This month: ${visitCount} visits; ￥${costPerVisit?.toLocaleString()} per visit` 
          : `No visits this month; you paid ￥${monthlyFee?.toLocaleString()} for nothing...`
        }
      </p>
    </div>
  )
}