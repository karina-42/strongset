import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!

if (!uri) {
  throw new Error("MONGODB_URI is not defined")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error: I dont know 
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    // @ts-expect-error: I dont know2
    globalThis._mongoClientPromise = client.connect()
  }
  // @ts-expect-error: I dont know3
  clientPromise = globalThis._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise