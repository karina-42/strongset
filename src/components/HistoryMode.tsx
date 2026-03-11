import type { WorkoutEntry, Exercise } from "../types"
import { useState } from "react";

interface HistoryModeProps {
  exercises: Exercise[];
  workoutHistory: WorkoutEntry[];
  onEdit: ( value: string) => void;
  onDelete: (value: string) => void;
}

export function HistoryMode({
  exercises,
  workoutHistory,
  onEdit,
  onDelete,
}: HistoryModeProps) {
  const [historyArea, setHistoryArea] = useState<Exercise['area'] | 'all'>('all')

  //filter history by area
  const filteredHistory = historyArea === 'all'
    ? workoutHistory
    : workoutHistory.filter(entry => entry.area === historyArea)
  
  //group by exercise for display
  const historyByExercise = filteredHistory.reduce((acc, entry) => {
  const exercise = exercises.find(e => e.id === entry.exerciseId)
  const exerciseName = exercise?.name ?? 'Unknown'

  if (!acc[exerciseName]) {
    acc[exerciseName] = []
  }
  acc[exerciseName].push(entry)
  return acc
}, {} as Record<string, WorkoutEntry[]>)

  return (
    <div className='p-4'>
      <h1 className="text-3xl font-bold text-purple-700">Workout History</h1>

      {/* Area filter */}
      <div className='flex gap-2 mt-4 mb-4 flex-wrap'>
        <button
          className={`px-4 py-2 rounded ${historyArea === 'all' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-700'}`}
          onClick={() => setHistoryArea('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded ${historyArea === 'upper' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-700'}`}
          onClick={() => setHistoryArea('upper')}
        >
          Upper
        </button>
        <button
          className={`px-4 py-2 rounded ${historyArea === 'lower' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-700'}`}
          onClick={() => setHistoryArea('lower')}
        >
          Lower
        </button>
        <button
          className={`px-4 py-2 rounded ${historyArea === 'full' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-700'}`}
          onClick={() => setHistoryArea('full')}
        >
          Full
        </button>
        <button
          className={`px-4 py-2 rounded ${historyArea === 'full' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-700'}`}
          onClick={() => setHistoryArea('kickboxing')}
        >
          Kickboxing
        </button>
      </div>

      {/* Display grouped by exercise */}
      <div className='space-y-4'>
        {Object.entries(historyByExercise)
          .map(([exerciseName, entries]) => {
            //sort entries first
          const sortedEntries = entries.sort((a, b) => b.dateDone.getTime() - a.dateDone.getTime())
          return [exerciseName, sortedEntries] as [string, WorkoutEntry[]]
          })
          //sort exercises by most recent entry
        .sort(([, a], [, b]) => b[0].dateDone.getTime() - a[0].dateDone.getTime())
        .map(([exerciseName, sortedEntries]) => (
          <div key={exerciseName} className='border p-3 rounded'>
            <h2 className='font-bold text-lg'>{exerciseName}</h2>
            <p className='text-sm text-gray-600'>
              Last done: {sortedEntries[0].dateDone.toLocaleDateString()}
            </p>
            <p className='text-sm text-gray-600'>
              Total sessions: {sortedEntries.length}
            </p>

            {/* Show last 3 sessions */}
            <div className='mt-2 space-y-1'>
              {sortedEntries.slice(0, 3).map(entry => (
                <div key={entry.id} className='text-sm bg-gray-50 p-2 rounded flex justify-between items-start gap-2'>
                  <div className="flex-1">
                    <span>{entry.dateDone.toLocaleDateString()}: </span>
                    {/* hide reps and sets if kickboxing */}
                    {entry.area !== "kickboxing" && (
                      <>
                        {entry.weight && <span>{entry.weight}kg x {entry.numOfWeights} </span>}
                        <span>{entry.sets} sets x {entry.reps} reps</span>
                      </>
                    )}  
                    {entry.note && <span className='text-gray-600'> - {entry.note}</span>}
                  </div>
                  {/* Edit and Delete buttons */}
                  <div className="flex gap-1 shrink-0">
                    <button
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded active:bg-blue-600 cursor-pointer"
                    onClick={() => {
                      onEdit(entry.id)
                    }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white text-sm rounded active:bg-red-600 ml-2 cursor-pointer"
                      onClick={() => {
                        if (confirm('Delete entry?')) {
                          onDelete(entry.id)
                        }
                      }}
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      }
    </div>
  </div>
  )
}