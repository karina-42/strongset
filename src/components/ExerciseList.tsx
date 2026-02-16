import type { Exercise } from "../types";

interface ExerciseListProps {
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void
}

export function ExerciseList({
  exercises,
  onSelectExercise,
}: ExerciseListProps) {
  return (
    <ul className="space-y-2">
      {/* iterate through exercise database and display */}
      {exercises.map((exercise) => (
        <li key = {exercise.id}>
          <div className="p-2 bg-gray-50 capitalize rounded transition active:bg-purple-100 active:text-purple-700 cursor-pointer" onClick={() => onSelectExercise(exercise)}>{exercise.name}</div>
        </li>
      ))}
    </ul>
  )
}