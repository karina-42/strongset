import { getVisitGradientClasses } from "../utils/visitColors"
interface MonthlyStatsHeaderProps {
  monthlyFee: number,
  monthlyStats: MonthlyStats
}

type MonthlyStats = {
  gymVisitCount: number
  kickboxingVisitCount: number
  costPerVisit: number | null
}

export function MonthlyStatsHeader({
  monthlyFee,
  monthlyStats
}: MonthlyStatsHeaderProps) {
  const {gymVisitCount, kickboxingVisitCount, costPerVisit} = monthlyStats

  return (
    <div className="relative mx-3 mb-4 rounded-lg overflow-hidden">
      {/* progress indicator */}
      <div className="absolute left-0 top-0 right-0 h-2 flex flex-row">
        <div className="flex-1 bg-red-500"/>
        <div className="flex-1 bg-orange-500"/>
        <div className="flex-1 bg-yellow-500"/>
        <div className="flex-1 bg-lime-500"/>
        <div className="flex-1 bg-green-500"/>
        <div className="flex-1 bg-emerald-500"/>
      </div>
      {/* main content */}
      <div className={`pt-4 p-4 border border-3 ${getVisitGradientClasses(gymVisitCount+kickboxingVisitCount)} rounded-lg`}>
        <p className="text-sm font-medium">
          {gymVisitCount >= 12 && '🏆 '}
          {gymVisitCount >= 1 || kickboxingVisitCount >=1
            ? `This month: ${gymVisitCount} gym, ${kickboxingVisitCount} kickboxing; ￥${costPerVisit?.toLocaleString()} per visit`
            : `No visits this month; you paid ￥${monthlyFee?.toLocaleString()} for nothing...`
          }
        </p>
      </div>
    </div>
  )
}