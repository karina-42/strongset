import { useState, useEffect, useRef } from "react";
import type { SleepEntry } from "../types";

interface BedtimeTrackerProps {
  sleepEntries: SleepEntry[];
  goalTime: string;
  onAddEntry:  (manualData?: { date: string; bedtime: string; metGoal: boolean }) => void;
  onSetGoalTime: (goalTime: string) => void;
}

export function BedtimeTracker({
  sleepEntries,
  goalTime,
  onAddEntry,
  onSetGoalTime,
}: BedtimeTrackerProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goalTime);

  //State for manual logging
  const [showManualLog, setShowManualLog] = useState(false);
  const [manualDate, setManualDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });

  const [manualTime, setManualTime] = useState("23:15");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setGoalInput(goalTime)
  }, [goalTime])

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // helper to check if goal was met
  function checkMetGoal(bedtime: string, goal: string) {
    return bedtime <= goal;
  }

  function handleManualSubmit() {
    // create ISO string for date at selected bedtime
    const entryDate = new Date(`${manualDate}T${manualTime}:00Z`).toISOString();
    
    onAddEntry({
      date: entryDate,
      bedtime: manualTime,
      metGoal: checkMetGoal(manualTime,goalTime)
    });

    setShowManualLog(false);
  }

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

  function minutesUntilWakeUp() {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const wakeUpTime = 6
    let minutesUntilWakeUp = 0

    const minutesFromMidnight = hours * 60 + minutes
    const minutesFromMidnightUntilWakeUpTime = wakeUpTime * 60
    
    if (minutesFromMidnight < minutesFromMidnightUntilWakeUpTime) {
      minutesUntilWakeUp = minutesFromMidnightUntilWakeUpTime - minutesFromMidnight
    } else {
      minutesUntilWakeUp = 1440 - minutesFromMidnight + minutesFromMidnightUntilWakeUpTime
    }

    return minutesUntilWakeUp
  }
 
  function handlePressStart() {
    longPressTimer.current = setTimeout(() => {
      onAddEntry()
    }, 500)
  }

  function handlePressEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const sortedEntries = [...sleepEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const mins = minutesUntilWakeUp()

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-3xl font-bold text-purple-700">Bedtime Tracker</h1>

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
        {/* time til morning */}
        <div className="text-white">
          {currentTime.getHours() >= 21 && (
            <p>🛏️ Sleep now for {Math.floor(mins / 60)}h {mins % 60}m of sleep</p>
          )}
        </div>
      </div>      
      
      {/* Bed Button */}
      <button 
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg active:bd-emerald-600 active:scale-95 transition-transform shadow-md cursor-pointer"
      >
        🌙 Phone down, Lights out
      </button>

      {/* Manual Entry Toggle */}
      <div className="text-center">
        <button 
          onClick={() => setShowManualLog(!showManualLog)}
          className="text-gray-400 text-xs hover:text-white transition-colors"
        >
          {showManualLog ? "Close Manual Log" : "Forgot to press last night?"}
        </button>
      </div>

      {/* Manual Entry Form */}
      {showManualLog && (
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 space-y-3">
          <h3 className="text-white text-sm font-bold">Log Missed Night</h3>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={manualDate} 
              onChange={(e) => setManualDate(e.target.value)}
              className="flex-1 bg-gray-700 text-white text-sm p-2 rounded-lg border border-gray-600"
            />
            <input 
              type="time" 
              value={manualTime} 
              onChange={(e) => setManualTime(e.target.value)}
              className="w-24 bg-gray-700 text-white text-sm p-2 rounded-lg border border-gray-600"
            />
          </div>
          <button 
            onClick={handleManualSubmit}
            className="w-full bg-purple-600 text-white py-2 rounded-xl text-sm font-bold active:bg-purple-700"
          >
            Add To History
          </button>
        </div>
      )}

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