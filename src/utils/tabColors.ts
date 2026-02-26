export function getTabColors( tabName: string, currentMode: string) {
  let color = ""
  if (tabName === 'sleep' && currentMode === 'sleep') {
    color = 'bg-blue-600 text-white'
  } else if (tabName === currentMode) {
    color = 'bg-emerald-600 text-white'
  } else if (currentMode === 'sleep') {
    color = 'text-blue-300'
  } else {
    color = 'bg-transparent text-emerald-700'
  }

  return color
}