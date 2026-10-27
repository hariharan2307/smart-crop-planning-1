import mongoose from 'mongoose'

export async function connectDatabase(uri = process.env.MONGO_URI) {
  if (!uri) {
    throw new Error('MONGO_URI is required to connect to MongoDB.')
  }

  await mongoose.connect(uri)
  return mongoose.connection
}
