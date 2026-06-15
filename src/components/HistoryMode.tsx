import type { WorkoutEntry, Exercise } from "../types"
import type { Equipment } from "../types";
import { useState } from "react";

interface HistoryModeProps {
  exercises: Exercise[];
  workoutHistory: WorkoutEntry[];
  onEdit: ( value: string) => void;
  onDelete: (value: string) => void;
  onUpdateExercise: (value: string, equipment?: Equipment, newName?: string) => void;
}

export function HistoryMode({
  exercises,
  workoutHistory,
  onEdit,
  onDelete,
  onUpdateExercise,
}: HistoryModeProps) {
  const [historyArea, setHistoryArea] = useState<Exercise['area'] | 'all'>('all')
  const [showEditExercises, setShowEditExercises] = useState(false)

  //filter history by area
  const filteredHistory = historyArea === 'all'
    ? workoutHistory
    : workoutHistory.filter(entry => entry.area === historyArea)
  
  // //group by exercise for display
  // const historyByExercise = filteredHistory.reduce((acc, entry) => {
  //   const exercise = exercises.find(e => e.id === entry.exerciseId)
  //   const exerciseName = exercise?.name ?? 'Unknown'

  //   if (!acc[exerciseName]) {
  //     acc[exerciseName] = []
  //   }
  //   acc[exerciseName].push(entry)
  //   return acc
  // }, {} as Record<string, WorkoutEntry[]>)

  //Group by day
  const historyByDay = filteredHistory.reduce((acc,entry) => {
    const exerciseDate = entry.dateDone.toLocaleDateString()

    if (!acc[exerciseDate]) {
      acc[exerciseDate] = []
    }
    acc[exerciseDate].push(entry)
    return acc
  }, {} as Record<string, WorkoutEntry[]>)

  return (
    <div className='p-4'>
      {/* Edit Exercises */}
      <button onClick={() => setShowEditExercises(prev => !prev)}>
        {showEditExercises ? "Hide" : "Edit Exercises"}
      </button>

      {showEditExercises && (
        <div className="space-y-2 mb-4">
          {exercises.map(exercise => (
            <div key={exercise.id} className="bg-gray-300 rounded-xl p3">
              <p className="font-semibold text-sm mb-2">{exercise.name}</p>
              <div className="flex flex-wrap gap-1">
                {(["balance ball", "band", "barbell", "bodyweight", "cable", "dumbbell", "kettlebell", "machine", "smith machine"] as const).map(eq =>(
                  <button
                    key={eq}
                    onClick={() => onUpdateExercise(exercise.id, eq, undefined)}
                    className={`px-2 py-1 rounded text-xs ${
                      exercise.equipment === eq
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  defaultValue={exercise.name}
                  onBlur={(e) => {
                    if (e.target.value !== exercise.name) {
                      onUpdateExercise(exercise.id, exercise.equipment, e.target.value)
                    }
                  }}
                  className="flex-1 border rounded-lg px-2 py-1 text-sm"
                />
              </div>
            </div>
          ))}
          
        </div>
      )}

      {/* history */}
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
          className={`px-4 py-2 rounded ${historyArea === 'kickboxing' ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-700'}`}
          onClick={() => setHistoryArea('kickboxing')}
        >
          Kickboxing
        </button>
      </div>

      {/* Group by date */}
      <div className='space-y-4'>
        {Object.entries(historyByDay)
          .map(([exerciseDate, entries]) => {
            //sort entries first
          const sortedEntries = entries.sort((a, b) => a.dateDone.getTime() - b.dateDone.getTime())
          return [exerciseDate, sortedEntries] as [string, WorkoutEntry[]]
          })
          //sort exercises by most recent entry
        .sort(([, a], [, b]) => b[0].dateDone.getTime() - a[0].dateDone.getTime())
        .map(([exerciseDate, sortedEntries]) => (
          <div key={exerciseDate} className='border p-3 rounded'>
            <h2 className='font-bold text-lg'>{new Date(exerciseDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</h2>
            
            {/* Show exercises done that day */}
            <div className='mt-2 space-y-1'>
              {sortedEntries.map(entry => {
                const exercise = exercises.find(e => e.id === entry.exerciseId)
                const exerciseName = exercise?.name ?? 'Unknown'
                const prevSessions = workoutHistory
                  .filter(e => e.exerciseId === entry.exerciseId && e.dateDone < entry.dateDone)
                  .sort((a, b) => b.dateDone.getTime() - a.dateDone.getTime())
                  .slice(0, 2)

                return (
                  <div key={entry.id} className='text-sm bg-gray-50 p-2 rounded space-y-1'>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <span className="font-semibold text-purple-700 calitalize">{exerciseName}: </span>
                        {/* hide reps and sets if kickboxing */}
                        {entry.area !== "kickboxing" && (
                          <>
                            {entry.isJustBar ? <span>Just the bar / </span> : entry.weight ? <span>{entry.weight}kg x ${entry.numOfWeights} / </span> : null}
                            {entry.bandColor && <span>Band: {entry.bandColor} / </span>}
                            {entry.cablePlate && <span>Plate: {entry.cablePlate} / </span>}
                            <span>{entry.reps} reps x {entry.sets} sets</span>                          
                          </>
                        )}
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
                    {/* Note */}
                    {entry.note && <div className='text-gray-600 pl-1'>- {entry.note}</div>}
                    {/* prev sessions */}
                      {prevSessions.map(prev => (
                        <div key={prev.id} className="text-xs text-gray-400 pl-1">
                          {prev.dateDone.toLocaleDateString()}: {prev.weight && `${prev.weight}kg x ${prev.numOfWeights} / `}{prev.reps}x{prev.sets}{prev.note && ` - ${prev.note}`}
                        </div>
                      ))}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      }
    </div>
  </div>
  )
}