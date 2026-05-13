import { useState, useMemo } from "react";
import type { WorkoutEntry, Exercise, CalendarNote } from "../types";

interface WorkoutCalendarProps {
  workoutHistory: WorkoutEntry[];
  exercises: Exercise[];
  calendarNotes: CalendarNote[];
  onAddNote: (date: string, text: string) => void
  onDeleteNote: (id: string) => void
}

export function WorkoutCalendar({ workoutHistory, exercises, calendarNotes, onAddNote, onDeleteNote }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [noteInput, setNoteInput] = useState('')

  const workoutsByDay = useMemo(() => {
    const map: Record<string, {
      entries: WorkoutEntry[];
      areas: Set<string>;
      hasKickboxing: boolean;
      kickboxingClass: string | null; 
    }> = {};

    for (const entry of workoutHistory) {
      const d = entry.dateDone;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const exercise = exercises.find(e => e.id === entry.exerciseId);
      const name = exercise?.name ?? '';

      if (!map[key]) {
        map[key] = {
          entries: [],
          areas: new Set(),
          hasKickboxing: false,
          kickboxingClass: null,
        };
      }

      // push entry to the list
      map[key].entries.push(entry);

      if (entry.area === 'kickboxing') {
        map[key].hasKickboxing = true;
        map[key].kickboxingClass = name.split(': ')[1] ?? null;
      } else {
        map[key].areas.add(entry.area);
      }
    }

    return map;
  }, [workoutHistory, exercises]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-purple-700">Calendar</h1>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="text-purple-500 font-bold text-xl px-3 py-1 active:scale-95"
        >
          ‹
        </button>
        <span className="font-semibold text-gray-700">
          {currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="text-purple-500 font-bold text-xl px-3 py-1 active:scale-95"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-semibold">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const key = day
            ? `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
            : '';
          const data = key ? workoutsByDay[key] : null;
          const today = new Date();
          const isToday = day?.getFullYear() === today.getFullYear() &&
            day?.getMonth() === today.getMonth() &&
            day?.getDate() === today.getDate();
          const isSelected = selectedDay !== null &&
            day?.getFullYear() === selectedDay.getFullYear() &&
            day?.getMonth() === selectedDay.getMonth() &&
            day?.getDate() === selectedDay.getDate();

          return (
            <div
              key={i}
              onClick={() => day && setSelectedDay(day)}
              className={`rounded-lg p-1 text-center min-h-[52px] ${
                !day ? ''
                 : isToday ? 'bg-emerald-100 cursor-pointer active:scale-95 ring-2 ring-emerald-400'
                 : isSelected ? 'bg-gray-200 cursor-pointer active:scale-95 ring-2 ring-purple-400'
                 : 'bg-gray-100 cursor-pointer active:scale-95'
              }`}
            >
              {day && (
                <>
                  <p className="text-xs text-gray-500">{day.getDate()}</p>
                  {/* Gym badges */}
                  <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
                    {data && (() => {
                      const hasUpper = data.areas.has('upper');
                      const hasLower = data.areas.has('lower');

                      if (hasUpper && hasLower) return <span>🟣</span>;
                      if (hasUpper) return <span>🔴💪</span>;
                      if (hasLower) return <span>🔵🦵</span>;
                    })()}

                    {data?.hasKickboxing && <span>🥊</span>}
                  </div>
                  {/* note preview */}
                  {(() => {
                    const dayNotes = calendarNotes.filter(n => n.date === key);
                    if (dayNotes.length === 0) return null;
                    const preview = dayNotes[0].text;
                    return (
                      <p className="text-xs text-purple-600 truncate mt-0.5">
                        {preview.length > 20 ? preview.slice(0, 20) + '...' : preview}
                      </p>
                    );
                  })()}
                </>
              )}
            </div>
          );
        })}
      </div>
      {/* Day detail popup */}
      {selectedDay && (() => {
        const key = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(2, '0')}-${String(selectedDay.getDate()).padStart(2, '0')}`;
        const data = workoutsByDay[key];

        return (
          <div className="bg-gray-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">
                {selectedDay.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 text-sm active:text-gray-600">X</button>
            </div>
            {!data ? (
              <p className="text-gray-400 text-sm">Rest day 💤</p>
            ) : (
              <div className="space-y-1">
                {data.entries
                  .sort((a, b) => new Date(a.dateDone).getTime() - new Date(b.dateDone).getTime())
                  .map((entry, i) => {
                    const exercise = exercises.find(e => e.id === entry.exerciseId);
                    return (
                      <div key={i} className="text-sm text-gray-600 flex justify-between">
                        <span>{exercise?.name ?? 'Unkown'}</span>
                        <span className="text-gray-400">{entry.dateDone.toLocaleString()}</span>
                      </div>
                    );
                  })}
              </div>
            )}
            {/* Notes */}
            <div className="space-y-2 mt-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</h3>

              {/* notes for today */}
              {calendarNotes
                .filter(n => n.date === key)
                .map(note => (
                  <div key={note.id} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-700">{note.text}</span>
                    <button onClick={() => onDeleteNote(note.id)} className="text-red-400 text-xs active:text-red-600">X</button>
                  </div>
                ))
              }
              {/* add new note */}
              <div className="flex gap-2">
                <input
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 bg-white rounded-lg px-3 py-2 text-sm border border-gray-200"
                />
                <button
                  onClick={() => {
                    if (!noteInput.trim()) return
                    onAddNote(key, noteInput)
                    setNoteInput('')
                  }}
                  className="bg-purple-500 text-white px-3 py-2 rounded-lg text-sm active:bg-purple-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}