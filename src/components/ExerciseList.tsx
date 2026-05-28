import type { Equipment, Exercise, WorkoutEntry } from "../types";
import { useState, useRef } from "react";

interface ExerciseListProps {
  exercises: Exercise[];
  workoutHistory: WorkoutEntry[];
  onSelectExercise: (exercise: Exercise) => void
  onEditExercise: (exercise: Exercise) => void
  onDeleteExercise: (id: string) => void
}

export function ExerciseList({
  exercises,
  workoutHistory,
  onSelectExercise,
  onEditExercise,
  onDeleteExercise
}: ExerciseListProps) {
  const [editExercise, setEditExercise] = useState<Exercise | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handlePressStart(exercise: Exercise) {
    longPressTimer.current = setTimeout(() => {
      setEditExercise(exercise)
    }, 500)
  }

  function handlePressEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }
  
  
  return (
    <ul className="space-y-2">
      {/* iterate through exercise database and display */}
      {exercises.map((exercise) => {
        const lastWorkout = workoutHistory
          .filter(entry => entry.exerciseId === exercise.id)
          .sort((a, b) => b.dateDone.getTime() - a.dateDone.getTime())[0]

        return (
          <li key = {exercise.id}>
            {editExercise?.id === exercise.id ? (
              <div className="p-2 bg-purple-50 rounded space-y-2">
                <input
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={editExercise.name}
                  onChange={e => setEditExercise({ ...editExercise, name: e.target.value })}
                />
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={editExercise.area}
                  onChange={e => setEditExercise({ ...editExercise, area: e.target.value as Exercise['area'] })}
                >
                  <option value="upper">Upper</option>
                  <option value="lower">Lower</option>
                  <option value="full">Full</option>
                  <option value="kickboxing">Kickboxing</option>
                </select>
                <select 
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={editExercise.equipment ?? ''}
                  onChange={e => setEditExercise({ ...editExercise, equipment: e.target.value as Equipment})}
                >
                  <option value="">No equipment</option>
                  {(['balance ball', 'band', 'barbell', 'bodyweight', 'cable', 'dumbbell', 'kettlebell', 'machine', 'smith machine'] as const).map(eq => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => { onEditExercise(editExercise); setEditExercise(null) }} className="bg-emerald-500 text-white px-3 py-1 rounded text-sm cursor-pointer">Save</button>
                  <button onClick={() => setEditExercise(null)} className="bg-gray-300 px-3 py-1 rounded text-sm cursor-pointer">Cancel</button>
                  <button onClick={() => onDeleteExercise(exercise.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm cursor-pointer">Delete</button>
                </div>
              </div>
            ) : (
              <div 
                className="p-2 bg-gray-50 capitalize rounded transition active:bg-purple-100 active:text-purple-700 cursor-pointer" 
                onClick={() => onSelectExercise(exercise)}
                onMouseDown={() => onSelectExercise(exercise)}
                onMouseUp={handlePressEnd}
                onTouchStart={() => handlePressStart(exercise)}
                onTouchEnd={handlePressEnd}
              >         
                <span className="font-medium">{exercise.name}</span>
                {lastWorkout && (
                  <span className="text-sm text-gray-600 ml-2">
                    {lastWorkout.weight && `${lastWorkout.weight}kg x ${lastWorkout.numOfWeights} / `}
                    {lastWorkout.reps} X {lastWorkout.sets}
                  </span>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}