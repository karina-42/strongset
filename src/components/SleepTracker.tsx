import { useState, useEffect } from "react";
import type { SleepEntry } from "../types";

interface SleepTrackerProps {
  sleepEntries: SleepEntry[];
  goalTime: string;
  onAddEntry:  () => void;
  onSetGoalTime: (goalTime: string) => void;
}

export function SleepTracker({
  sleepEntries,
  goalTime,
  onAddEntry,
  onSetGoalTime,
}: SleepTrackerProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goalTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  function convertTime(time: string) {
    const [hour, minutes] = time.split(":");
    let numHour = parseInt(hour);
    let meridian = "";
    if (numHour === 24 || numHour === 0) {
      numHour = 12;
      meridian = "AM";
    } else if (numHour > 12) {
      numHour -= 12;
      meridian = "PM";
    } else if (numHour === 12) {
      meridian = "PM";
    } else {
      meridian = "AM";
    }
    return `${numHour}:${minutes} ${meridian}`;
  }
  
  const sortedEntries = [...sleepEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-3xl font-bold text-purple-700">Sleep Tracker</h1>

      {/* Clock and Goal Card */}
      <div className="bg-gray-900 rounded-2xl p-6 text-center shadow-lg">
        <p className="text-5xl font-bold text-white tracking-tight">
          {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit"})}
        </p>
        <p className="text-gray-400">
          {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <div>
          {editingGoal ? (
            <>
              <input
                type="time"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm border border-gray-600"
              />
              <button
                onClick={() => {
                  onSetGoalTime(goalInput);
                  setEditingGoal(false);
                }}
                className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-semibold active:bg-emerald-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingGoal(false)}
                  className="bg-gray-600 text-white px-3 py-1 rounded-lg text-sm active:bg-gray-700"
                >
                  Cancel
                </button>
              </>
          ) : (
            <>
              <span className="text-gray-300 text-sm">
                Goal: <span className="text-emerald-400 font-semibold">{convertTime(goalTime)}</span>
              </span>
              <button
                onClick={() => setEditingGoal(true)}
                className="text-gray-500 text-xs underline active:text-gray-300"
              >
                Change
              </button>
            </>
          )}
        </div>
      </div>      
      
      {/* Bed Button */}
      <button 
        onClick={onAddEntry}
        className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg active:bd-emerald-600 active:scale-95 transition-transform shadow-md cursor-pointer"
      >
        🌙 I'm going to bed
      </button>

      {/* History, Recent Nights */}
      <div className="bg-blue-900 rounded-2xl p-4 shadow-sm space-y-2">
        <h2 className="font-semibold text-gray-400 text-sm uppercase tracking-wide mb-3">Recent Nights</h2>
        {sortedEntries.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No entries yet - hit that button tonight!</p>
        )}
        {sortedEntries.map((entry) => (
          <div 
            key={entry.id}
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              entry.metGoal ? "bg-emerald-900 border border-emerald-700" : "bg-red-900 border border-red-700"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-white">
                {new Date(entry.date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric"})}
              </p>
              <p className="text-xs text-gray-400">
                Goal: {convertTime(entry.goalTime)}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${entry.metGoal ? "text-emerald-600" : "text-red-600"}`}>
                {convertTime(entry.bedtime)}
              </p>
              <p className="text-sm">{entry.metGoal ? "✅ Met" : "❌ Missed"}</p>
            </div>
          </div> 
        ))}
      </div>
    </div>
  );
}