import { useState, useEffect } from 'react'
//import strongsetLogo from './assets/StrongSet_Logo.png'
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
import './App.css'

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
  const [todayEntries, setTodayEntries] = useState<WorkoutEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [draftInput, setDraftInput] = useState<DraftEntryInput>(defaultInput);
  const [videoWorkouts, setVideoWorkouts] = useState<VideoWorkout[]>([]);
  const [draftVideoWorkout, setDraftVideoWorkout] = useState<DraftVideoWorkout>(defaultVideoForm);
  const [mode, setMode] = useState<AppMode>("gym");
  const [videoTab, setVideoTab] = useState<VideoTab>("list");

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

      await fetch("http://localhost:4000/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExercise),
      })

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
      dateDone: new Date(),
      area: exercise.area
    }

    // add it to day's entries
    setTodayEntries(prev => [...prev, newEntry])

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

     
    await fetch("http://localhost:4000/videos", {
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

  async function finishWorkout() {
    if (todayEntries.length === 0) return

    // send all to backend
    await Promise.all(
      todayEntries.map(entry =>
        fetch("http://localhost:4000/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        })
      )
    )

    setWorkoutHistory(prev => [...prev, ...todayEntries])
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

  useEffect(() => {
    fetch("http://localhost:4000/workouts")
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
    fetch("http://localhost:4000/videos")
    .then(res => res.json())
    .then(data => setVideoWorkouts(data))
    .catch(console.error)
  }, [])

  useEffect(() => {
    fetch("http://localhost:4000/exercises")
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
      {/* Handle switching modes */}
      <div className='px-3 gap-2 mb-4'>
        <button className={`px-3 py-2 rounded ${
          mode === "gym" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`} onClick={() => setMode("gym")}>
          Gym
        </button>
        <button className={`px-3 py-2 rounded ${
          mode === "video" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`} onClick={() => setMode("video")}>
          Video
        </button>
      </div>

      {/* header */}
      {/* <div>
        <img src={strongsetLogo} className="logo strongset" alt="StrongSet logo"></img>
      </div> */}
      {mode === "gym" && (
        <>
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
    </>
  )
}

export default App
