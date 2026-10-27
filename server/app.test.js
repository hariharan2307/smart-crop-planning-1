import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import test from 'node:test'
import request from 'supertest'
import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'

const jwtSecret = 'test-secret-with-more-than-thirty-two-characters'
const farmerId = '507f1f77bcf86cd799439011'
const planId = '507f1f77bcf86cd799439012'

function createTestApp({ farmerOverrides = {} } = {}) {
  const calls = {
    farmerCreate: [],
    farmerFindOne: [],
    farmerFindById: [],
    cropPlanFind: [],
    cropPlanFindOne: [],
    cropPlanCreate: [],
    cropPlanUpdate: [],
    cropPlanDelete: [],
  }
  const farmer = {
    _id: farmerId,
    fullName: 'Amina Khan',
    email: 'amina@example.com',
    phone: undefined,
    farmLocation: 'Ludhiana, Punjab',
    farmSizeAcres: 2,
    soilType: 'Loamy',
    passwordHash: '$2b$04$K9NlDZubDc4OaUFuFv2cG.2gjFV6jiWhcjOyZPY9tI3emUnf2FruC',
    ...farmerOverrides,
  }
  const farmerModel = {
    create: async (data) => {
      calls.farmerCreate.push(data)
      return { ...data, _id: farmerId }
    },
    findOne: (query) => {
      calls.farmerFindOne.push(query)
      return { select: async () => farmer }
    },
    findById: (id) => {
      calls.farmerFindById.push(id)
      return { select: async () => farmer }
    },
  }
  const cropPlanModel = {
    find: (query) => {
      calls.cropPlanFind.push(query)
      return {
        sort: () => ({ lean: async () => [{ _id: planId, cropName: 'Rice' }] }),
      }
    },
    findOne: (query) => {
      calls.cropPlanFindOne.push(query)
      return {
        lean: async () => query._id === planId
          ? { _id: planId, cropName: 'Rice', farmer: query.farmer }
          : null,
      }
    },
    create: async (data) => {
      calls.cropPlanCreate.push(data)
      return { ...data, _id: planId }
    },
    findOneAndUpdate: async (...args) => {
      calls.cropPlanUpdate.push(args)
      return { _id: planId, status: args[1].$set.status }
    },
    findOneAndDelete: async (query) => {
      calls.cropPlanDelete.push(query)
      return { _id: planId }
    },
  }

  const app = createApp({ farmerModel, cropPlanModel, jwtSecret })
  const token = jwt.sign({}, jwtSecret, { subject: farmerId, expiresIn: '1h' })
  return { app, calls, farmer, token }
}

test('registers farmers in MongoDB using a password hash and returns a JWT', async () => {
  const { app, calls } = createTestApp()
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      fullName: 'Amina Khan',
      email: 'amina@example.com',
      password: 'secure-password',
      farmLocation: 'Ludhiana, Punjab',
      farmSizeAcres: 2,
      soilType: 'Loamy',
    })

  assert.equal(response.status, 201)
  assert.equal(calls.farmerCreate.length, 1)
  assert.notEqual(calls.farmerCreate[0].passwordHash, 'secure-password')
  assert.equal(await bcrypt.compare('secure-password', calls.farmerCreate[0].passwordHash), true)
  assert.equal(response.body.farmer.id, farmerId)
  assert.equal(typeof response.body.token, 'string')
  assert.equal('passwordHash' in response.body.farmer, false)
})

test('rejects short passwords before writing a farmer record', async () => {
  const { app, calls } = createTestApp()
  const response = await request(app)
    .post('/api/auth/register')
    .send({ password: 'short' })

  assert.equal(response.status, 400)
  assert.equal(calls.farmerCreate.length, 0)
})

test('rejects registration requests without a JSON body', async () => {
  const { app, calls } = createTestApp()
  const response = await request(app).post('/api/auth/register')

  assert.equal(response.status, 400)
  assert.equal(calls.farmerCreate.length, 0)
})

test('logs in with a phone identifier and checks the stored password hash', async () => {
  const passwordHash = await bcrypt.hash('secure-password', 4)
  const { app, calls } = createTestApp({ farmerOverrides: { passwordHash } })
  const response = await request(app)
    .post('/api/auth/login')
    .send({ identifier: '+91 98765 43210', password: 'secure-password' })

  assert.deepEqual(calls.farmerFindOne, [{ phone: '+91 98765 43210' }])
  assert.equal(response.status, 200)
  assert.equal(response.body.farmer.id, farmerId)
  assert.equal(typeof response.body.token, 'string')
})

test('requires authentication before reading crop plans', async () => {
  const { app, calls } = createTestApp()
  const response = await request(app).get('/api/crop-plans')

  assert.equal(response.status, 401)
  assert.equal(calls.cropPlanFind.length, 0)
})

test('reads only the authenticated farmer crop plans from MongoDB', async () => {
  const { app, calls, token } = createTestApp()
  const response = await request(app)
    .get('/api/crop-plans')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(response.status, 200)
  assert.deepEqual(calls.cropPlanFind, [{ farmer: farmerId }])
  assert.equal(response.body.plans[0].cropName, 'Rice')
})

test('lists crop catalogue entries and filters by season and soil type', async () => {
  const { app } = createTestApp()
  const response = await request(app).get('/api/crops?season=Kharif&soilType=Loamy')

  assert.equal(response.status, 200)
  assert.equal(response.body.count, 3)
  assert.deepEqual(response.body.crops.map((crop) => crop.name), ['Rice', 'Maize', 'Millet'])
})

test('rejects invalid crop catalogue filters', async () => {
  const { app } = createTestApp()
  const response = await request(app).get('/api/crops?season=Spring')

  assert.equal(response.status, 400)
  assert.match(response.body.error, /Season must be one of/)
})

test('reads an individual crop plan scoped to the authenticated farmer', async () => {
  const { app, calls, token } = createTestApp()
  const response = await request(app)
    .get(`/api/crop-plans/${planId}`)
    .set('Authorization', `Bearer ${token}`)

  assert.equal(response.status, 200)
  assert.deepEqual(calls.cropPlanFindOne, [{ _id: planId, farmer: farmerId }])
  assert.equal(response.body.plan.cropName, 'Rice')
})

test('does not disclose a crop plan that is not owned by the authenticated farmer', async () => {
  const { app, calls, token } = createTestApp()
  const response = await request(app)
    .get('/api/crop-plans/507f1f77bcf86cd799439099')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(response.status, 404)
  assert.deepEqual(calls.cropPlanFindOne, [{
    _id: '507f1f77bcf86cd799439099',
    farmer: farmerId,
  }])
})

test('rejects an invalid crop plan ID before querying MongoDB', async () => {
  const { app, calls, token } = createTestApp()
  const response = await request(app)
    .get('/api/crop-plans/not-an-id')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(response.status, 400)
  assert.equal(calls.cropPlanFindOne.length, 0)
})

test('writes a crop plan scoped to the authenticated farmer', async () => {
  const { app, calls, token } = createTestApp()
  const response = await request(app)
    .post('/api/crop-plans')
    .set('Authorization', `Bearer ${token}`)
    .send({
      cropName: 'Rice',
      season: 'Kharif',
      soilType: 'Loamy',
      landSizeAcres: 2,
    })

  assert.equal(response.status, 201)
  assert.equal(calls.cropPlanCreate.length, 1)
  assert.equal(calls.cropPlanCreate[0].farmer, farmerId)
  assert.equal(response.body.plan.cropName, 'Rice')
})

test('updates and deletes crop plans only within the authenticated farmer scope', async () => {
  const { app, calls, token } = createTestApp()
  const statusResponse = await request(app)
    .patch(`/api/crop-plans/${planId}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'Completed' })

  const deleteResponse = await request(app)
    .delete(`/api/crop-plans/${planId}`)
    .set('Authorization', `Bearer ${token}`)

  assert.equal(statusResponse.status, 200)
  assert.deepEqual(calls.cropPlanUpdate[0][0], { _id: planId, farmer: farmerId })
  assert.deepEqual(calls.cropPlanUpdate[0][1], { $set: { status: 'Completed' } })
  assert.equal(deleteResponse.status, 204)
  assert.deepEqual(calls.cropPlanDelete[0], { _id: planId, farmer: farmerId })
})

test('rejects invalid plan identifiers and status values', async () => {
  const { app, calls, token } = createTestApp()
  const invalidIdResponse = await request(app)
    .delete('/api/crop-plans/not-an-id')
    .set('Authorization', `Bearer ${token}`)
  const invalidStatusResponse = await request(app)
    .patch(`/api/crop-plans/${planId}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'Archived' })

  assert.equal(invalidIdResponse.status, 400)
  assert.equal(invalidStatusResponse.status, 400)
  assert.equal(calls.cropPlanDelete.length, 0)
  assert.equal(calls.cropPlanUpdate.length, 0)
})

test('reads the authenticated farmer profile without returning the password hash', async () => {
  const { app, calls, token } = createTestApp()
  const response = await request(app)
    .get('/api/farmers/me')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(response.status, 200)
  assert.deepEqual(calls.farmerFindById, [farmerId])
  assert.equal(response.body.farmer.email, 'amina@example.com')
  assert.equal('passwordHash' in response.body.farmer, false)
})

test('requires a MongoDB URI rather than silently skipping database setup', async () => {
  await assert.rejects(
    connectDatabase(''),
    { message: 'MONGO_URI is required to connect to MongoDB.' },
  )
})
