interface BedtimeStreakHeaderProps {
  streak: number;
  goalTime: string
}

export function BedtimeStreakHeader({
  streak,
  goalTime
}: BedtimeStreakHeaderProps) {
  let message = ""
  let color = ""

  if (goalTime === "22:00") {
    color = "bg-emerald-200 text-emerald-400"
    message = `You've met the goal! Keep the ${streak} day streak going!`
  } else if (streak === 0) {
    message = "Your muscles won't grow without sleep! Go to bed!"
    color = "bg-red-200 text-red-400"
  } else if (streak >= 7) {
    message = `${streak} days! Time to update goal! (-15mins)`
    color = "bg-yellow-200 text-yellow-400"
  } else {
    message = `Bedtime streak: ${streak}`
    color = "bg-blue-200 text-blue-400"
  }

  return (
    <div className={`mx-3 mb-4 p-4 border border-l-4 ${color} rounded-lg`}>
      <p className="text-sm font-medium">
        {message}
      </p>
    </div>
  ) 
  
}