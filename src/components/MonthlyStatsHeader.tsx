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
  
  const getGradientClasses = () => {
    if (visitCount === 0) {
      return 'bg-red-100 border-red-500 text-red-900 border'
    }
    if (visitCount >= 12) {
      return 'bg-gradient-to-r from-emerald-200 to-emerald-300 border-emerald-600 text-emerald-900 border'
    }

    const colors = [
      'bg-red-100 border-red-500 text-red-900',
      'bg-orange-100 border-orange-500 text-orange-900',
      'bg-yellow-100 border-yellow-500 text-yellow-900',
      'bg-lime-100 border-lime-500 text-lime-900',
      'bg-green-100 border-green-500 text-green-900',
    ]

    const index = Math.min(Math.floor((visitCount -1) / 2), colors.length -1)
    return colors[index]
  }

  // const isGoodValue = costPerVisit && costPerVisit < (monthlyFee / 8) // 8+ visits = good
  // const bgColor = visitCount === 0 ? 'bg-red-300 border-red-500 border' :
    // isGoodValue ? 'bg-emerald-500 border-emerald-900 border' :
    // 'bg-yellow-300 border-yellow-500 border'
  return (
    <div className={`mx-3 mb-4 p-4 border-l-4 ${getGradientClasses()} rounded-lg`}>
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