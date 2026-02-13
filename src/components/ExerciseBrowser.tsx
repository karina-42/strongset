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
  const getButtonClass = (buttonFilter: Filter) => {
    const isActive = filter === buttonFilter
    return `px-4 py-2 rounded ${isActive ? 'bg-red-500 text-white' : 'bg-red-600 text-gray-700'}`
  }
  const filteredExercises = exercises.filter(ex => {
    if (filter === "all") return true
    return ex.area === filter
  }).sort((a,b) => a.name.localeCompare(b.name))

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h1 className="text-3xl font-bold text-orange-500">Exercise List</h1>
      {/* Buttons to filter exercises */}
      <button type='button' name='all' className={getButtonClass("all")} onClick={() => setFilter("all")}>All</button>
      <button type='button' name='upper' className={getButtonClass("upper")} onClick={() => setFilter("upper")}>Upper</button>
      <button type='button' name='lower' className={getButtonClass("lower")} onClick={() => setFilter("lower")}>Lower</button>
      <button type='button' name='full' className={getButtonClass("full")} onClick={() => setFilter("full")}>Full</button>
      <br />

      {/* Display  list of exercises */}
      <ExerciseList
      exercises={filteredExercises}
      onSelectExercise={onSelectExercise}
      />
    </div>
  )
}
