interface BedtimeWeeklyHeaderProps {
  metCount: number;
  goalTime: string
}

export function BedtimeWeeklyHeader({
  metCount,
  goalTime
}: BedtimeWeeklyHeaderProps) {
  let message = ""
  let color = ""

  if (goalTime === "22:00") {
    color = "bg-emerald-900 text-emerald-300"
    message = `You've met the goal! Keep sleeping early 5 days a week!🌙`
  } else if (metCount  <= 2) {
    message = `${metCount}/7. Your muscles won't grow without sleep! Go to bed!`
    color = "bg-red-900 text-red-300"
  } else if (metCount >= 5) {
    message = `${metCount}/7 this week! Time to update goal! (-15mins)`
    color = "bg-yellow-900 text-yellow-300"
  } else {
    message = `${metCount}/7 so far 💪 Keep going!`
    color = "bg-blue-800 text-blue-200"
  }

  return (
    <div className={`mx-3 mb-4 p-4 border border-l-4 ${color} rounded-lg`}>
      <p className="text-sm font-medium">
        {message}
      </p>
    </div>
  ) 
  
}