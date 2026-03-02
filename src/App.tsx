import { useState, useEffect } from 'react'
import strongsetLogo from './assets/StrongSet_Logo.png'
import type { Exercise, WorkoutEntry } from './types'
import type { TodayEntryDisplay } from './types'
import type { DraftEntryInput } from './types'
import type { VideoWorkout } from './db/models/VideoWorkout'
import type { AppMode } from './types'
import type { VideoTab } from './types'
import type { DraftVideoWorkout } from './types'
import type { SleepEntry } from './types'
import { DraftEntryForm } from './components/DraftEntryForm'
import { MonthlyStatsHeader } from './components/MonthlyStatsHeader'
import { BedtimeStreakHeader } from './components/BedtimeWeeklyHeader'
import { TodayEntriesList } from './components/TodayEntriesList'
import { ExerciseBrowser } from './components/ExerciseBrowser'
import { HistoryMode } from './components/HistoryMode'
import { calculateMonthlyStats } from './utils/monthlyStats'
import { VideoForm } from './components/VideoForm'
import { SleepTracker } from './components/SleepTracker'
import { getVisitGradientClasses } from './utils/visitColors'
import './App.css'
import { getTabColors } from './utils/tabColors'
import { calculateSleepCount } from './utils/sleepUtils'

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
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [sleepGoalTime, setSleepGoalTime] = useState<string>("23:45")

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
      //Check which array it's in
      const isInToday = todayEntries.some(entry => entry.id === editingEntryId)

      if (isInToday) {
        //UPDATE todayEntries
        setTodayEntries(prev =>
          prev.map(entry =>
            entry.id === editingEntryId
            ? {...entry, ...input, exerciseId: exercise!.id, area: exercise!.area}
            : entry
          )
        )
        setEditingEntryId(null) // Exit edit mode
      } else { // Editing workoutHistory entry
        // UPDATE workoutHistory + database

        // Get original entry for dateDone
        const originalEntry = workoutHistory.find(entry => entry.id === editingEntryId)
        if (!originalEntry) return

        // Create updated entry object
        const updatedEntry = {
          id: editingEntryId,
          exerciseId: exercise!.id,
          weight: input.weight,
          numOfWeights: input.numOfWeights,
          reps: input.reps,
          sets: input.sets,
          restMin: input.restMin,
          restSec: input.restSec,
          note: input.note,
          dateDone: originalEntry.dateDone,
          area: exercise.area
        }

        // Update database
        await fetch(`${API_URL}/workouts/${editingEntryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEntry)
        })

        // Update state
        setWorkoutHistory(prev =>
          prev.map(entry =>
            entry.id === editingEntryId
            ? updatedEntry
            : entry
          )
        )
        setEditingEntryId(null)

        setMode("history")
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth'})
        }, 100)
      }
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

  useEffect(() => {
    fetch(`${API_URL}/sleep`)
    .then(r => r.json())
    .then((data: SleepEntry[]) =>
      setSleepEntries(
        data.map(e => ({
          ...e,
          date: new Date(e.date),
        }))
      )
    )
  }, [])

  // handle deleting an entry from Today's Entries
  const handleDeleteEntry = (entryId: string) => {
    setTodayEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  // function to edit a history entry for setting editingEntryId and load data into draft Input
  function handleEditHistoryEntry(editId: string) {
    const historyEntryToEdit = workoutHistory.find(entry => entry.id === editId)
    if (!historyEntryToEdit) return

    const exercise = exercises.find(ex => ex.id === historyEntryToEdit.exerciseId)
    if (!exercise) return 

    setEditingEntryId(editId)

    setDraftInput({
      exerciseName: exercise.name,
      area: historyEntryToEdit.area,
      weight: historyEntryToEdit.weight,
      numOfWeights: historyEntryToEdit.numOfWeights,
      reps: historyEntryToEdit.reps,
      sets: historyEntryToEdit.sets,
      restMin: historyEntryToEdit.restMin,
      restSec: historyEntryToEdit.restSec,
      note: historyEntryToEdit.note,
    })

    setMode("gym")
    setTimeout(() => {
      document.getElementById('exercise-form')?.scrollIntoView({ behavior: 'smooth'})
    }, 100)
  }

  async function handleDeleteHistoryEntry(entryId: string) {
    await fetch(`${API_URL}/workouts/${entryId}`, {
      method: "DELETE",
    })
    setWorkoutHistory(prev => prev.filter(entry => entry.id !== entryId))
  }

  // handle clearing input form
  const handleClearForm = () => {
    setDraftInput(prev => ({
      ...defaultInput,
      area: prev.area,
    }))
    setEditingEntryId(null)
  }

  // Handle adding a sleep entry
  async function handleAddSleepEntry() {
    const now = new Date()
    const hour = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const currentTime = `${hour}:${minutes}`

    const sleepEntry: SleepEntry = {
      id: crypto.randomUUID(),
      date: now,
      bedtime: currentTime,
      goalTime: sleepGoalTime,
      metGoal: currentTime <= sleepGoalTime,
    }

    setSleepEntries(prev => [...prev, sleepEntry])

    await fetch(`${API_URL}/sleep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sleepEntry),
    })
  }

/***************************************************/
/***************************************************/
/***************************************************/
/***************************************************/
/***************************************************/
  // THE UI
  return (
    <div className={`min-h-screen ${mode === 'sleep' ? 'bg-blue-950' : 'bg-white'}`}>
      {/* header */}
      {/* logo */}
      <div className='flex items-center justify-between px-3 py-3'>
        <img src={strongsetLogo} className="h-16" alt="StrongSet"></img>
        {mode === 'gym' && (
          <div className='text-right'>
            {/* cost header */}
            <MonthlyStatsHeader
              monthlyFee={monthlyFee}
              monthlyStats={monthlyStats}
            ></MonthlyStatsHeader>
          </div>
        )}
        {mode === "sleep" && (
          <div className='text-right'>
            {/* Bedtime streak counter */}
            <BedtimeStreakHeader
              metCount={calculateSleepCount(sleepEntries, sleepGoalTime)}
              goalTime={sleepGoalTime}
            ></BedtimeStreakHeader>
          </div>
        )}
      </div>
      {/* Handle switching modes */}
      <div className={`flex gap-1 p-2 rounded-lg mb-4 mx-3 ${
        mode === 'sleep' ? 'bg-blue-900' : 'bg-gray-100'
        }`}>
        <button className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${
          // mode === "gym" ? "bg-emerald-600 text-white shadow-sm" : "bg-transparent text-emerald-700"
          getTabColors("gym", mode)
        }`} onClick={() => setMode("gym")}>
          Gym
        </button>
        <button className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${
          //mode === "history" ? "bg-emerald-600 text-white shadow-sm" : "bg-transparent text-emerald-700"
          getTabColors("history", mode)
        }`} onClick={() => setMode("history")}>
          History
        </button>
        <button className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${
          //mode === "sleep" ? "bg-emerald-600 text-white shadow-sm" : "bg-transparent text-emerald-700"
          getTabColors("sleep", mode)
        }`} onClick={() => setMode("sleep")}>
          Sleep
        </button>
        <button className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${
          //mode === "video" ? "bg-emerald-600 text-white shadow-sm" : "bg-transparent text-emerald-700"
          getTabColors("video", mode)
        }`} onClick={() => setMode("video")}>
          Video
        </button>
      </div>

      {/* Gym Mode */}
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
      <>
        <HistoryMode
        exercises={exercises}
        workoutHistory={workoutHistory}
        onEdit = {handleEditHistoryEntry}
        onDelete={handleDeleteHistoryEntry}
        />
      </>
      )}

      {/* Sleep Tracker */}
      {mode === "sleep" && (
        <>
          <SleepTracker
          sleepEntries={sleepEntries}
          goalTime={sleepGoalTime}
          onAddEntry={handleAddSleepEntry}
          onSetGoalTime={setSleepGoalTime}
          />
        </>
      )}

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
    </div>
  )
}

export default App
