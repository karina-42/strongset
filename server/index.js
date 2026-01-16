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

app.post("/videos", async (req, res) => {
  const video = {
    ...req.body,
    createdAt: new Date(),
  }

  await videos.insertOne(video)
  res.json({ ok: true })
})

app.get("/videos", async (req, res) => {
  const allVideos = await videos.find().toArray()
  res.json(allVideos)
})

app.listen(4000, () => {
  console.log("Server runnning on http://localhost:4000")
})