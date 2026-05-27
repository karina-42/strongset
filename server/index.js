import "dotenv/config"
import express from "express"
import { MongoClient } from "mongodb"
import cors from "cors"
import { createClerkClient, verifyToken } from '@clerk/backend'

const app = express()
const port = process.env.PORT || 4000
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const db = client.db("workouts")
const videos = db.collection("videos")
const workouts = db.collection("workouts")
const exercises = db.collection("exercises")
const sleepEntries = db.collection("sleep")
const settings = db.collection("settings")
const calendarNotes = db.collection("calendarNotes")

async function requireAuth( req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token' })

    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
    req.userId = payload.sub
    next()
  } catch (err) {
    console.error('Auth error:', err.message)
    res.status(401).json({ error: 'Invalid token' })
  }
}

app.post("/videos", requireAuth, async (req, res) => {
  const video = {
    ...req.body,
    userId: req.userId,
    createdAt: new Date(),
  }

  await videos.insertOne(video)
  res.json({ ok: true })

})

app.post("/workouts", requireAuth, async (req, res) => {
  const workout = {
    ...req.body,
    userId: req.userId,
    createdAt: new Date(),
  }

  await workouts.insertOne(workout)
  res.json({ ok: true })
})

app.post("/exercises", requireAuth, async (req,res) => {
  await exercises.insertOne({ ...req.body, userId: req.userId })
  res.json({ ok: true })
})

app.post("/sleep", requireAuth, async (req, res) => {
  // save to sleep
  await sleepEntries.insertOne({ ...req.body, userId: req.userId })
  res.json({ success: true, entry: req.body })
})

app.post("/calendar-notes", requireAuth, async (req, res) => {
  const { date, text, id } = req.body;
  const note = {
    id,
    date,
    text,
    userId: req.userId,
    createdAt: new Date()
  };
  await calendarNotes.insertOne(note);
  res.json(note);
});

app.put("/workouts/:id", requireAuth, async (req, res) => {
  const { id } = req.params
  const updatedWorkout = req.body
  // Update in MongoDB
  await db.collection('workouts').updateOne(
    { id: id },
    { $set: updatedWorkout }
  )

  res.json({ success: true })
})

app.put("/exercises/:id", requireAuth, async (req, res) => {
  const { id } = req.params
  const { _id, ...updateData } = req.body
  await db.collection('exercises').updateOne(
    { id: id },
    { $set: updateData }
  )
  res.json({ success: true })
})

app.put("/settings", requireAuth, async (req, res) => {
  const updatedGoalTime = req.body
  // Update in MongoDB
  await db.collection('settings').updateOne(
    { userId: req.userId },
    { $set: updatedGoalTime },
    { upsert: true }
  )

  res.json({ success: true })
})

app.put("/videos/:id", requireAuth, async(req, res) => {
  const { id } = req.params
  const { _id, ...updateData } = req.body
  await videos.updateOne(
    { id: id },
    { $set: updateData }
  )
  res.json({ success: true })
})

app.get("/videos", requireAuth, async (req, res) => {
  const allVideos = await videos.find({ userId: req.userId }).toArray()
  res.json(allVideos)
})

app.get("/workouts", requireAuth, async (req, res) => {
  const all = await workouts.find({ userId: req.userId }).toArray()
  res.json(all)
})

app.get("/exercises", requireAuth, async (req, res) => {
  const all = await exercises.find({ userId: req.userId }).toArray()
  res.json(all)
})

app.get("/sleep", requireAuth, async (req, res) => {
  //fetch from sleep
  const all = await sleepEntries.find({ userId: req.userId }).toArray()
  res.json(all)
})

 app.get("/settings", requireAuth, async (req, res) => {
  //fetch bed time goal
  const bedGoalTime = await settings.find({ userId: req.userId }).toArray()
  res.json(bedGoalTime)
 })

 app.get("/calendar-notes", requireAuth, async (req, res) => {
  const notes = await db.collection('calendarNotes').find({ userId: req.userId }).toArray();
  res.json(notes);
 });

app.delete('/workouts/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  // Delete from MongoDB
  await db.collection('workouts').deleteOne({ id: id })
  res.json({ success: true })
})

app.delete("/videos/:id", requireAuth, async (req, res) => {
  const { id } = req.params
  await videos.deleteOne({ id: id})
  res.json({ success: true })
})

app.delete("/calendar-notes/:id", requireAuth, async (req, res) => {
  await db.collection('calendarNotes').deleteOne({ id: req.params.id });
  res.json({success: true});
});

app.listen(port, () => {
  console.log(`Server runnning on port ${port}`)
})