import { useState } from "react";
import type { Exercise, WorkoutEntry } from "../types";
import { ExerciseList } from "./ExerciseList";
// diplays buttons, and list of filtered exercies
// needs exercise list
// creates a draft when an exercise is selected

interface ExerciseBrowserProps {
  exercises: Exercise[];
  workoutHistory: WorkoutEntry[];
  onSelectExercise: (exercise: Exercise) => void;
}

type Filter = "all" | "upper" | "lower" | "full"



export function ExerciseBrowser({
  exercises, 
  workoutHistory,
  onSelectExercise
}:  ExerciseBrowserProps) {
  const [filter, setFilter] = useState<Filter>("all")
  const getButtonClass = (buttonFilter: Filter) => {
    const isActive = filter === buttonFilter
    return `px-4 py-2 rounded ${isActive ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-700'}`
  }
  const filteredExercises = exercises.filter(ex => {
    if (filter === "all") return true
    return ex.area === filter
  }).sort((a,b) => a.name.localeCompare(b.name))

  return (
    <div className="bg-gray-100 rounded-xl p-4 shadow-sm space-y-4" id="exercise-browser">
      <h1 className="text-3xl font-bold text-purple-700">Exercise List</h1>
      
      {/* Buttons to filter exercises */}
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div className="flex gap-2">
          <button type='button' name='all' className={getButtonClass("all")} onClick={() => setFilter("all")}>All</button>
          <button type='button' name='upper' className={getButtonClass("upper")} onClick={() => setFilter("upper")}>Upper</button>
          <button type='button' name='lower' className={getButtonClass("lower")} onClick={() => setFilter("lower")}>Lower</button>
          <button type='button' name='full' className={getButtonClass("full")} onClick={() => setFilter("full")}>Full</button>
        </div>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded active:bg-purple-600 text-sm"
          onClick={() => document.getElementById('exercise-form')?.scrollIntoView({ behavior: 'smooth'})}
        >
          ↓ Add new
        </button>
      </div>

      {/* Display  list of exercises */}
      <ExerciseList
      exercises={filteredExercises}
      workoutHistory={workoutHistory}
      onSelectExercise={onSelectExercise}
      />
    </div>
  )
}
