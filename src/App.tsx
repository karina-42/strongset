import { useState, useEffect } from 'react'
//import strongsetLogo from './assets/StrongSet_Logo.png'
import type { Exercise, WorkoutEntry } from './types'
import type { TodayEntryDisplay } from './types'
import type { DraftEntryInput } from './types'
import { DraftEntryForm } from './components/DraftEntryForm'
import { MonthlyStatsHeader } from './components/MonthlyStatsHeader'
import { TodayEntriesList } from './components/TodayEntriesList'
import { ExerciseBrowser } from './components/ExerciseBrowser'
import { calculateMonthlyStats } from './utils/monthlyStats'
import './App.css'

// LOCAL STORAGE
const HISTORY_STORAGE_KEY = "workoutHistory"
const EXERCISES_STORAGE_KEY = "exercises"

// Load and save  workout history
function loadWorkoutHistory(): WorkoutEntry[] {
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return parsed.map((entry: { dateDone: string | number | Date }) => ({
      ...entry,
      dateDone: new Date(entry.dateDone),
    }))
  } catch {
    return []
  }
}

function saveWorkoutHistory(history: WorkoutEntry[]) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
}

// Load and save exercises
function loadExercises(): Exercise[] {
 const raw = localStorage.getItem(EXERCISES_STORAGE_KEY)
 if (!raw) return []

 try {
  const parsed = JSON.parse(raw)
  return parsed
 }
 catch {
  return []
 }
}

function saveExercises(exercise: Exercise[]) {
  localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(exercise))
}

// Default entries for the input form
const defaultInput:DraftEntryInput = {
  exerciseName: "",
  area: "full",
  weight: null,
  numOfWeights: null,
  reps: 15,
  sets: 3,
  restMin: 1,
  restSec: 30,
  note: ""
}

// The APP
function App() {
  // States
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutEntry[]>(loadWorkoutHistory)
  const [todayEntries, setTodayEntries] = useState<WorkoutEntry[]>([])
  const [exercises, setExercises] = useState<Exercise[]>(loadExercises)
  const [draftInput, setDraftInput] = useState<DraftEntryInput>(defaultInput)

  // To display the last done date
  const lastDoneDate = (() => {
    const exercise = exercises.find(
      e => e.name.toLowerCase() === draftInput.exerciseName.toLowerCase()
    )
    if (!exercise) return null

    return workoutHistory
      .filter(e => e.exerciseId === exercise.id)
      .sort((a, b) => b.dateDone.getTime() - a.dateDone.getTime())
      .at(0)?.dateDone ?? null
    })()

  // To see how much each visit is costing
  const monthlyFee = 8580;
  const monthlyStats = calculateMonthlyStats(workoutHistory, monthlyFee) 

  // Function to convert a draft entry input to a workout entry
  function handleSubmitDraft(input: DraftEntryInput) {
    // return if no name is inputed
    if (!input.exerciseName.trim()) return

    // get whitespace out from front and back of name
    const normalizedName = input.exerciseName.trim()

    // search to see if an exercise with the same name is already saved
    let exercise = exercises.find(
      e => e.name.toLowerCase() === normalizedName.toLowerCase()
    )

    // if no exercise is saved, create a new one
    if (!exercise) {
      const newExercise: Exercise = {
        id: normalizedName.split(" ").join("-").toLowerCase(),
        name: normalizedName,
        area: input.area
      }

      setExercises(prev => [...prev, newExercise])
      exercise = newExercise
    }

    // Create that day's workout entry
    const newEntry: WorkoutEntry = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      weight: input.weight,
      numOfWeights: input.numOfWeights,
      reps: input.reps,
      sets: input.sets,
      restMin: input.restMin,
      restSec: input.restSec,
      note: input.note,
      dateDone: new Date()
    }

    // add it to day's entries
    setTodayEntries(prev => [...prev, newEntry])

    // reset the form
    setDraftInput( prev => ({
      ...defaultInput,
      area: prev.area,
    }))
  }

  function finishWorkout() {
    if (todayEntries.length === 0) return

    setWorkoutHistory(workoutHistory => [...workoutHistory, ...todayEntries])
    setTodayEntries([])
  }

  // Function to create a draft Exercise with default 
  // values, this displays in the form for updating the 
  // record, probably delete later, or keep for a template
  //  to create new exercises 
  function handleSelectedExercise(targetExercise: Exercise) {
    const lastEntry = workoutHistory
    .filter(entry => entry.exerciseId === targetExercise.id)
    .sort((a,b) => b.dateDone.getTime() - a.dateDone.getTime())
    .at(0)

    if (!lastEntry) {
      setDraftInput({
        ...defaultInput,
        exerciseName: targetExercise.name      
      })
      return
    }

    setDraftInput({
      exerciseName: targetExercise.name,
      area: targetExercise.area,
      weight: lastEntry.weight,
      numOfWeights: lastEntry.numOfWeights,
      reps: lastEntry.reps,
      sets: lastEntry.sets,
      restMin: lastEntry.restMin,
      restSec: lastEntry.restSec,
      note: lastEntry.note,
    })
  }

  useEffect(() => {
    saveWorkoutHistory(workoutHistory)
  }, [workoutHistory])

  useEffect(() => {
    saveExercises(exercises)
  }, [exercises])

  // todayEntriesList display helper
  const todayEntriesForDisplay: TodayEntryDisplay[] = todayEntries.map(entry => {
    const exercise = exercises.find(e => e.id === entry.exerciseId)

    return {
      ...entry,
      exerciseName: exercise?.name ?? "Unknown exercise",
    }
  })

/***************************************************/
/***************************************************/
  // THE IU
  return (
    <>
      {/* header */}
      {/* <div>
        <img src={strongsetLogo} className="logo strongset" alt="StrongSet logo"></img>
      </div> */}

      {/* cost header */}
      <MonthlyStatsHeader
      monthlyFee={monthlyFee}
      monthlyStats={monthlyStats}
      />

      {/* exercise browser, button filters and list */}
      <ExerciseBrowser
      exercises={exercises}
      onSelectExercise={handleSelectedExercise}
      />
<br></br>

      {/* Form to edit data of selected exercise to input 
      today */}
      <DraftEntryForm
        value={draftInput}
        lastDoneDate={lastDoneDate}
        onChange={setDraftInput}
        onSubmit={() => {
          handleSubmitDraft(draftInput)
        }}
      />

      <div>
        {/* Display a list of today's logged exercises */}
        <h1>Today's Entries</h1>
        <TodayEntriesList entries={todayEntriesForDisplay} />
<br></br>
        <button onClick={finishWorkout}>Finish Workout</button>
      </div>
    </>
  )
}

 //todo 
 // feature for saving Youtube videos with tags and notes

// Key needs:

// URL (YouTube link)

// Free-text notes (why you liked/disliked it)

//  tags/keywords (“mobility”, “wrists”, “low impact”)

// Used outside the normal “exercise → sets/reps” flow
// also saves and shows on claendar that will be added later
export default App
