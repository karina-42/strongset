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
          <div className="p-2 capitalize rounded transition active:bg-orange-50" onClick={() => onSelectExercise(exercise)}>{exercise.name}</div>
        </li>
      ))}
    </ul>
  )
}