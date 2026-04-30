export function getPaceGradientClasses (ahead: number, hasMetGymGoal: boolean) {
    if (hasMetGymGoal) {
      return 'bg-gradient-to-r from-emerald-200 to-emerald-300 border-emerald-600 text-emerald-900'
    }
    if (ahead >= 4) {
      return 'bg-green-400 border-green-600 text-green-900'
    }    
    if (ahead >= 2) {
      return 'bg-green-300 border-green-500 text-green-900'
    }    
     if (ahead === 1) {
      return 'bg-green-200 border-green-500 text-green-900'
    }   
    if (ahead === 0) {
      return 'bg-green-100 border-green-500 text-green-900'
    }
    if (ahead === -1) {
      return 'bg-lime-100 border-lime-500 text-lime-900'
    }
    if (ahead === -2) {
      return 'bg-yellow-100 border-yellow-500 text-yellow-900'
    }  
    if (ahead === -3) {
      return 'bg-orange-100 border-orange-500 text-orange-900'
    }    

    //const index = Math.min(Math.floor((ahead -1) / 2), colors.length -1)
    return 'bg-red-100 border-red-500 text-red-900'
  }
