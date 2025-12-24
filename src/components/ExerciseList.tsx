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
    <ul>
      {/* iterate through exercise database and display */}
      {exercises.map((exercise) => (
        <li key = {exercise.id}>
          <div onClick={() => onSelectExercise(exercise)}>{exercise.name}</div>{" "} ({exercise.area})
        </li>
      ))}
    </ul>
  )
}