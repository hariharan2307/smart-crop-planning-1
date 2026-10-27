import 'dotenv/config'
import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'

const port = Number(process.env.PORT ?? 5000)

try {
  await connectDatabase()
  const app = createApp()
  app.listen(port, () => {
    console.log(`Smart Crop Planning API listening on port ${port}.`)
  })
} catch (error) {
  console.error('Unable to start Smart Crop Planning API:', error.message)
  process.exitCode = 1
}
