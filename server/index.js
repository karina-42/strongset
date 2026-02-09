import "dotenv/config"
import express from "express"
import { MongoClient } from "mongodb"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()

const db = client.db("workouts")
const videos = db.collection("videos")
const workouts = db.collection("workouts")
const exercises = db.collection("exercises")

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

app.listen(4000, () => {
  console.log("Server runnning on http://localhost:4000")
})