export function getVisitGradientClasses (visitCount: number) {
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
