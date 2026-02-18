import type { Exercise, WorkoutEntry } from "../types";

interface ExerciseListProps {
  exercises: Exercise[];
  workoutHistory: WorkoutEntry[];
  onSelectExercise: (exercise: Exercise) => void
}

export function ExerciseList({
  exercises,
  workoutHistory,
  onSelectExercise,
}: ExerciseListProps) {
  return (
    <ul className="space-y-2">
      {/* iterate through exercise database and display */}
      {exercises.map((exercise) => {
        const lastWorkout = workoutHistory
          .filter(entry => entry.exerciseId === exercise.id)
          .sort((a, b) => b.dateDone.getTime() - a.dateDone.getTime())[0]

        return (
          <li key = {exercise.id}>
            <div 
              className="p-2 bg-gray-50 capitalize rounded transition active:bg-purple-100 active:text-purple-700 cursor-pointer" 
              onClick={() => onSelectExercise(exercise)}
              >
                <span className="font-medium">{exercise.name}</span>
                {lastWorkout && (
                  <span className="text-sm text-gray-600 ml-2">
                    {lastWorkout.weight && `${lastWorkout.weight}kg x ${lastWorkout.numOfWeights} + `}
                    {lastWorkout.sets} x {lastWorkout.reps}
                  </span>
                )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}