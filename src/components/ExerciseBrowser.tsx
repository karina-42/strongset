import { useState } from "react";
import type { Exercise } from "../types";
import { ExerciseList } from "./ExerciseList";
// diplays buttons, and list of filtered exercies
// needs exercise list
// creates a draft when an exercise is selected

interface ExerciseBrowserProps {
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
}

type Filter = "all" | "upper" | "lower" | "full"

export function ExerciseBrowser({
  exercises, 
  onSelectExercise
}:  ExerciseBrowserProps) {
  const [filter, setFilter] = useState<Filter>("all")
  const filteredExercises = exercises.filter(ex => {
    if (filter === "all") return true
    return ex.area === filter
  })

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h1 className="text-3xl font-bold text-blue-500">Exercise List</h1>
      {/* Buttons to filter exercises */}
      <button type='button' name='all' onClick={() => setFilter("all")}>All</button>
      <button type='button' name='upper' onClick={() => setFilter("upper")}>Upper</button>
      <button type='button' name='lower' onClick={() => setFilter("lower")}>Lower</button>
      <button type='button' name='full' onClick={() => setFilter("full")}>Full</button>
      <br />

      {/* Display  list of exercises */}
      <ExerciseList
      exercises={filteredExercises}
      onSelectExercise={onSelectExercise}
      />
    </div>
  )
}
