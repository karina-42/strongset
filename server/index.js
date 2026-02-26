import "dotenv/config"
import express from "express"
import { MongoClient } from "mongodb"
import cors from "cors"

const app = express()
const port = process.env.PORT || 4000
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()

const db = client.db("workouts")
const videos = db.collection("videos")
const workouts = db.collection("workouts")
const exercises = db.collection("exercises")
const sleepEntries = db.collection("sleep")

app.post("/videos", async (req, res) => {
  const video = {
    ...req.body,
    createdAt: new Date(),
  }

  await videos.insertOne(video)
  res.json({ ok: true })

})

app.post("/workouts", async (req, res) => {
  const workout = {
    ...req.body,
    createdAt: new Date(),
  }

  await workouts.insertOne(workout)
  res.json({ ok: true })
})

app.post("/exercises", async (req,res) => {
  await exercises.insertOne(req.body)
  res.json({ ok: true })
})

app.post("/sleep", async (req, res) => {
  // save to sleep
  await sleepEntries.insertOne(req.body)
  res.json({ success: true, entry: req.body })
})

app.put("/workouts/:id", async (req, res) => {
  const { id } = req.params
  const updatedWorkout = req.body
  // Update in MongoDB
  await db.collection('workouts').updateOne(
    { id: id },
    { $set: updatedWorkout }
  )

  res.json({ success: true })
})

app.get("/videos", async (req, res) => {
  const allVideos = await videos.find().toArray()
  res.json(allVideos)
})

app.get("/workouts", async (req, res) => {
  const all = await workouts.find().toArray()
  res.json(all)
})

app.get("/exercises", async (req, res) => {
  const all = await exercises.find().toArray()
  res.json(all)
})

app.get("/sleep", async (req, res) => {
  //fetch from sleep
  const all = await sleepEntries.find().toArray()
  res.json(all)
})

app.delete('/workouts/:id', async (req, res) => {
  const { id } = req.params
  // Delete from MongoDB
  await db.collection('workouts').deleteOne({ id: id })
  res.json({ success: true })
})

app.listen(port, () => {
  console.log(`Server runnning on port ${port}`)
})