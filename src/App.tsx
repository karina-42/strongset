import { useState, useEffect } from 'react'
import strongsetLogo from './assets/StrongSet_Logo.png'
import type { Exercise, WorkoutEntry } from './types'
import type { TodayEntryDisplay } from './types'
import type { DraftEntryInput } from './types'
import type { VideoWorkout } from './db/models/VideoWorkout'
import type { AppMode } from './types'
import type { VideoTab } from './types'
import type { DraftVideoWorkout } from './types'
import { DraftEntryForm } from './components/DraftEntryForm'
import { MonthlyStatsHeader } from './components/MonthlyStatsHeader'
import { TodayEntriesList } from './components/TodayEntriesList'
import { ExerciseBrowser } from './components/ExerciseBrowser'
import { calculateMonthlyStats } from './utils/monthlyStats'
import { VideoForm } from './components/VideoForm'
import { getVisitGradientClasses } from './utils/visitColors'
import './App.css'

const STORAGE_KEY = "strongset-today-entries"
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

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

// Default entries for video workout form
const defaultVideoForm: DraftVideoWorkout = {
  title: "",
  url: "",
  tags: [],
  note: "",
  area: "full",
  repeatFlag: "neutral",
}

// The APP
function App() {
  // States
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutEntry[]>([]);
  const [todayEntries, setTodayEntries] = useState<WorkoutEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    return JSON.parse(saved).map((e: WorkoutEntry) => ({
      ...e,
      dateDone: new Date(e.dateDone)
    }))
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [draftInput, setDraftInput] = useState<DraftEntryInput>(defaultInput);
  const [videoWorkouts, setVideoWorkouts] = useState<VideoWorkout[]>([]);
  const [draftVideoWorkout, setDraftVideoWorkout] = useState<DraftVideoWorkout>(defaultVideoForm);
  const [mode, setMode] = useState<AppMode>("gym");
  const [videoTab, setVideoTab] = useState<VideoTab>("list");
  const [historyArea, setHistoryArea] = useState<Exercise['area'] | 'all'>('all')
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  

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
  const monthlyFee = 8965;
  const monthlyStats = calculateMonthlyStats(workoutHistory, monthlyFee) 

  // Function to convert a draft entry input to a workout entry
  async function handleSubmitDraft(input: DraftEntryInput) {
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

      await fetch(`${API_URL}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExercise),
      })

      setExercises(prev => [...prev, newExercise])
      exercise = newExercise
    }

    //check if editing or adding new
if (editingEntryId) {
  //UPDATE existing entry
  setTodayEntries(prev =>
    prev.map(entry =>
      entry.id === editingEntryId
      ? {...entry, ...input, exerciseId: exercise!.id, area: exercise!.area}
      : entry
    )
  )
  setEditingEntryId(null) // Exit edit mode
} else {
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
      dateDone: new Date(),
      area: exercise.area
    }
    // add it to day's entries
    setTodayEntries(prev => [...prev, newEntry])
}

    // reset the form
    setDraftInput( prev => ({
      ...defaultInput,
      area: prev.area,
    }))
  }

    // Function to handle submitting a workout video form to save
  async function handleSubmitWorkoutVideo(input: DraftVideoWorkout) {
    if (!input.url.trim()) return
    
    const newVideo: VideoWorkout = {
      id: crypto.randomUUID(),
      title: input.title,
      url: input.url,
      thumbnailUrl: input.thumbnailUrl,
      tags: input.tags,
      note: input.note,
      area: input.area,
      repeatFlag: input.repeatFlag,
      createdAt: new Date()
    }

     
    await fetch(`${API_URL}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVideo),
    })

    setVideoWorkouts(prev => [...prev, newVideo])

    // reset the form
    setDraftVideoWorkout( prev => ({
      ...defaultVideoForm,
      area: prev.area,
    }))
  }

  // for fetching metadata
  async function fetchYoutubeMetadata(
  url: string
  ): Promise<{ title: string; thumbnailUrl: string }> {
    const endpoint = 
      "https://www.youtube.com/oembed?format=json&url=" +
      encodeURIComponent(url)

    const res = await fetch(endpoint)

    if (!res.ok) {
      throw new Error("Failed to fetch YouTube metadata")
    }

    const data = await res.json()
    
    return {
      title: data.title,
      thumbnailUrl: data.thumbnail_url,
    }
  }

  async function finishWorkout() {
    if (todayEntries.length === 0) return

    // send all to backend
    await Promise.all(
      todayEntries.map(entry =>
        fetch(`${API_URL}/workouts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        })
      )
    )

    setWorkoutHistory(prev => [...prev, ...todayEntries])
    setTodayEntries([])
    localStorage.removeItem(STORAGE_KEY) //clear after saving
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

    // scroll to form
    document.getElementById('exercise-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  // function for setting editingEntryId and load data into draft Input
  function handleEditEntry(editId: string) {
    const entryToEdit = todayEntries.find(entry => entry.id === editId)
    if (!entryToEdit) return

    const exercise = exercises.find(ex => ex.id === entryToEdit.exerciseId)
    if (!exercise) return 

    setEditingEntryId(editId)

    setDraftInput({
      exerciseName: exercise.name,
      area: entryToEdit.area,
      weight: entryToEdit.weight,
      numOfWeights: entryToEdit.numOfWeights,
      reps: entryToEdit.reps,
      sets: entryToEdit.sets,
      restMin: entryToEdit.restMin,
      restSec: entryToEdit.restSec,
      note: entryToEdit.note,
    })
  }

  //filter history by area
  const filteredHistory = historyArea === 'all'
    ? workoutHistory
    : workoutHistory.filter(entry => entry.area === historyArea)

  //group by exercise for display
const historyByExercise = filteredHistory.reduce((acc, entry) => {
  const exercise = exercises.find(e => e.id === entry.exerciseId)
  const exerciseName = exercise?.name ?? 'Unknown'

  if (!acc[exerciseName]) {
    acc[exerciseName] = []
  }
  acc[exerciseName].push(entry)
  return acc
}, {} as Record<string, WorkoutEntry[]>)

  useEffect(() => {
    fetch(`${API_URL}/workouts`)
    .then(r => r.json())
    .then((data: WorkoutEntry[]) =>
      setWorkoutHistory(
        data.map(e => ({
          ...e,
          dateDone: new Date(e.dateDone),
        }))
      )
    )
  }, [])

  const { url, title } = draftVideoWorkout

  useEffect(() => {
    fetch(`${API_URL}/videos`)
    .then(res => res.json())
    .then(data => setVideoWorkouts(data))
    .catch(console.error)
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/exercises`)
    .then(r => r.json())
    .then(setExercises)
  }, [])

  useEffect(() => {
    if (!url.trim()) return
    if (title) return

    let cancelled = false

    async function loadMetadata() {
      const data = await fetchYoutubeMetadata(url)
      if (cancelled) return

      setDraftVideoWorkout(prev => ({
        ...prev,
        title: data.title,
        thumbnailUrl: data.thumbnailUrl
      }))    
    }

    loadMetadata()

    return () => {
      cancelled = true
    }
  }, [url, title])

  //save to localStorage whenever todayEntries changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todayEntries))
  }, [todayEntries])

  // todayEntriesList display helper
  const todayEntriesForDisplay: TodayEntryDisplay[] = todayEntries.map(entry => {
    const exercise = exercises.find(e => e.id === entry.exerciseId)

    return {
      ...entry,
      exerciseName: exercise?.name ?? "Unknown exercise",
    }
  })

  // handle deleting an entry from Today's Entries
  const handleDeleteEntry = (entryId: string) => {
    setTodayEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  // handle clearing input form
  const handleClearForm = () => {
    setDraftInput(prev => ({
      ...defaultInput,
      area: prev.area,
    }))
    setEditingEntryId(null)
  }

/***************************************************/
/***************************************************/
  // THE UI
  return (
    <>
      {/* header */}
            {/* logo */}
      <div className='flex items-center justify-between px-3 py-3'>
        <img src={strongsetLogo} className="h-16" alt="StrongSet"></img>
        {mode === 'gym' && (
          <div className='text-sm text-right'>
            {/* cost header */}
            <MonthlyStatsHeader
              monthlyFee={monthlyFee}
              monthlyStats={monthlyStats}
            ></MonthlyStatsHeader>
          </div>
        )}
      </div>
      {/* Handle switching modes */}
      <div className='flex gap-1 p-2 bg-gray-100 rounded-lg mb-4 mx-3'>
        <button className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${
          mode === "gym" ? "bg-emerald-600 text-white shadow-sm" : "bg-transparent text-emerald-700"
        }`} onClick={() => setMode("gym")}>
          Gym
        </button>
        <button className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${
          mode === "history" ? "bg-emerald-600 text-white shadow-sm" : "bg-transparent text-emerald-700"
        }`} onClick={() => setMode("history")}>
          History
        </button>
        <button className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${
          mode === "video" ? "bg-emerald-600 text-white shadow-sm" : "bg-transparent text-emerald-700"
        }`} onClick={() => setMode("video")}>
          Video
        </button>
      </div>

      {mode === "gym" && (
        <>
          {/* exercise browser, button filters and list */}
          <ExerciseBrowser
            exercises={exercises}
            workoutHistory={workoutHistory}
            onSelectExercise={handleSelectedExercise}
          />
          <div className='mt-6'>
          {/* Form to edit data of selected exercise to input today */}
            <DraftEntryForm
              value={draftInput}
              lastDoneDate={lastDoneDate}
              isEditing = {editingEntryId !== null}
              onClear={handleClearForm}
              onChange={setDraftInput}
              onSubmit={() => {
                handleSubmitDraft(draftInput)
              }}
            /></div>

          <div className='mt-6'>
          {/* Display a list of today's logged exercises */}
            <TodayEntriesList 
              entries={todayEntriesForDisplay}
              onEdit = {handleEditEntry} 
              onDelete={handleDeleteEntry}
            />
          </div>
          
          {/* Finish workout button */}
          <div className={`mt-12 p-4 mx-3 mb-6 rounded-lg border-l-4 ${getVisitGradientClasses(monthlyStats.visitCount)}`}>
            <button
              className={`w-full py-3 ${
                monthlyStats.visitCount >= 12
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900'
                : 'bg-red-600 text-white'
              } rounded-xl font-semibold active:scale-95 shadow-lg cursor-pointer`} 
              onClick={() => {
                if (confirm('Ready to be done?')) {
                finishWorkout()
                }
              }}
            >
             ✓ Finish Workout
            </button>
          </div>
        </>
      )}

      {/* History Mode */}
      {mode === "history" && (
        <div className='p-4'>
          <h1>Workout History</h1>

          {/* Area filter */}
          <div className='flex gap-2 mb-4 flex-wrap'>
            <button
              className={`px-3 py-2 rounded ${historyArea === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setHistoryArea('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-2 rounded ${historyArea === 'upper' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setHistoryArea('upper')}
            >
              Upper
            </button>
            <button
              className={`px-3 py-2 rounded ${historyArea === 'lower' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setHistoryArea('lower')}
            >
              Lower
            </button>
            <button
              className={`px-3 py-2 rounded ${historyArea === 'full' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setHistoryArea('full')}
            >
              Full
            </button>
          </div>

          {/* Display grouped by exercise */}
          <div className='space-y-4'>
            {Object.entries(historyByExercise)
              .map(([exerciseName, entries]) => {
                //sort entries first
              const sortedEntries = entries.sort((a, b) => b.dateDone.getTime() - a.dateDone.getTime())
              return [exerciseName, sortedEntries] as [string, WorkoutEntry[]]
              })
              //sort exercises by most recent entry
            .sort(([, a], [, b]) => b[0].dateDone.getTime() - a[0].dateDone.getTime())
            .map(([exerciseName, sortedEntries]) => (
              <div key={exerciseName} className='border p-3 rounded'>
                <h2 className='font-bold text-lg'>{exerciseName}</h2>
                <p className='text-sm text-gray-600'>
                  Last done: {sortedEntries[0].dateDone.toLocaleDateString()}
                </p>
                <p className='text-sm text-gray-600'>
                  Total sessions: {sortedEntries.length}
                </p>

                {/* Show last 3 sessions */}
                <div className='mt-2 space-y-1'>
                  {sortedEntries.slice(0, 3).map(entry => (
                    <div key={entry.id} className='text-sm bg-gray-50 p-2 rounded'>
                      <span>{entry.dateDone.toLocaleDateString()}: </span>
                      {entry.weight && <span>{entry.weight}kg x {entry.numOfWeights} </span>}
                      <span>{entry.sets} sets x {entry.reps} reps</span>
                      {entry.note && <span className='text-gray-600'> - {entry.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      </div>
      )
    }

      {/* Video tab */}
      {mode === "video" && (
        <div className='p-4 space-y-4'>
          {/* Tabs */}
          <div className='flex gap-2 flex-wrap'>
            <button className={`px-3 py-2 rounded ${
              videoTab === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setVideoTab("list")}>
              List
            </button>

            <button className={`px-3 py-2 rounded ${
              videoTab === "add" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setVideoTab("add")}>
              Add
            </button>

            <button className={`px-3 py-2 rounded ${
              videoTab === "search" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setVideoTab("search")}>
              Search
            </button>

            <button className={`px-3 py-2 rounded ${
              videoTab === "edit" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setVideoTab("edit")}>
              Edit
            </button>
          </div>

          {/* Tab Content */}
          <div className='mt-4'>
          {videoTab === "list" && (
            <ul>
              {videoWorkouts.map(video => (
                <li key={video.id}>
                  <img src={video.thumbnailUrl} className='w-32 rounded' />
                  <a href={video.url} target='_blank' rel='noopener noreferrer'>Click to go</a>
                  <p>{video.title || "Untitled video"}</p>
                  <p>Tags: {video.tags.join(", ")}</p>
                  {video.note && <p>{video.note}</p>}
                </li>
              ))}
            </ul>
          )}
          {videoTab === "add" && (
            <VideoForm
              value={draftVideoWorkout}
              onChange={setDraftVideoWorkout}
              onSubmit={() => handleSubmitWorkoutVideo(draftVideoWorkout)}
              />
          )}
          {videoTab === "search" && <div> Search UI goes here</div>}
          {videoTab === "edit" && <div> Edit video UI goes here</div>}
          </div>
        </div>
      )}
    </>
  )
}

export default App
