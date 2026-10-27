import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { crops } from './data/crops.js'
import CropPlan from './models/CropPlan.js'
import Farmer from './models/Farmer.js'
import { createAuthenticate } from './middleware/authenticate.js'

const planStatuses = ['Planned', 'In progress', 'Completed', 'Cancelled']

function createToken(farmerId, secret) {
  return jwt.sign({}, secret, { subject: farmerId.toString(), expiresIn: '7d' })
}

function publicFarmer(farmer) {
  return {
    id: farmer._id,
    fullName: farmer.fullName,
    email: farmer.email,
    phone: farmer.phone,
    farmLocation: farmer.farmLocation,
    farmSizeAcres: farmer.farmSizeAcres,
    soilType: farmer.soilType,
  }
}

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next)
  }
}

export function createApp({
  farmerModel = Farmer,
  cropPlanModel = CropPlan,
  jwtSecret = process.env.JWT_SECRET,
  clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
} = {}) {
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.')
  }

  const app = express()
  const authenticate = createAuthenticate(jwtSecret)

  app.disable('x-powered-by')
  app.use(cors({ origin: clientOrigin }))
  app.use(express.json({ limit: '20kb' }))

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    })
  })

  app.get('/api/crops', (request, response) => {
    const { season, soilType } = request.query
    const validSeasons = ['Kharif', 'Rabi', 'Zaid']
    const validSoilTypes = ['Clay', 'Loamy', 'Sandy']

    if (season !== undefined && !validSeasons.includes(season)) {
      return response.status(400).json({ error: `Season must be one of: ${validSeasons.join(', ')}.` })
    }
    if (soilType !== undefined && !validSoilTypes.includes(soilType)) {
      return response.status(400).json({ error: `Soil type must be one of: ${validSoilTypes.join(', ')}.` })
    }

    const results = crops.filter((crop) => (
      (!season || crop.seasons.includes(season))
      && (!soilType || crop.soilTypes.includes(soilType))
    ))

    return response.json({ count: results.length, crops: results })
  })

  app.post('/api/crop-recommendations', (request, response) => {
    const { season, soilType, landSizeAcres } = request.body ?? {}
    const validSeasons = ['Kharif', 'Rabi', 'Zaid']
    const validSoilTypes = ['Clay', 'Loamy', 'Sandy']

    if (!validSeasons.includes(season)) {
      return response.status(400).json({ error: `Season must be one of: ${validSeasons.join(', ')}.` })
    }
    if (!validSoilTypes.includes(soilType)) {
      return response.status(400).json({ error: `Soil type must be one of: ${validSoilTypes.join(', ')}.` })
    }
    if (
      typeof landSizeAcres !== 'number'
      || !Number.isFinite(landSizeAcres)
      || landSizeAcres < 0.1
      || landSizeAcres > 500
    ) {
      return response.status(400).json({ error: 'Field size must be a number between 0.1 and 500 acres.' })
    }

    const recommendations = crops
      .filter((crop) => crop.seasons.includes(season) && crop.soilTypes.includes(soilType))
      .map((crop) => ({
        ...crop,
        estimatedYieldTons: Number(
          (crop.expectedYieldTonsPerHectare * landSizeAcres * 0.404686).toFixed(2),
        ),
      }))
      .sort((first, second) => second.matchScore - first.matchScore)

    return response.json({
      count: recommendations.length,
      input: { season, soilType, landSizeAcres },
      recommendations,
      dataNote: 'Yield estimates are illustrative and can vary with local conditions and farm practices.',
    })
  })

  app.post('/api/auth/register', asyncRoute(async (request, response) => {
    const { fullName, email, phone, password, farmLocation, farmSizeAcres, soilType } = request.body ?? {}

    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return response.status(400).json({ error: 'Password must be between 8 and 128 characters.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const farmer = await farmerModel.create({
      fullName,
      email,
      phone,
      passwordHash,
      farmLocation,
      farmSizeAcres,
      soilType,
    })

    return response.status(201).json({
      farmer: publicFarmer(farmer),
      token: createToken(farmer._id, jwtSecret),
    })
  }))

  app.post('/api/auth/login', asyncRoute(async (request, response) => {
    const { identifier, password } = request.body ?? {}
    if (typeof identifier !== 'string' || typeof password !== 'string') {
      return response.status(400).json({ error: 'Email or phone and password are required.' })
    }

    const normalizedIdentifier = identifier.trim()
    const query = normalizedIdentifier.includes('@')
      ? { email: normalizedIdentifier.toLowerCase() }
      : { phone: normalizedIdentifier }
    const farmer = await farmerModel.findOne(query).select('+passwordHash')

    if (!farmer || !(await bcrypt.compare(password, farmer.passwordHash))) {
      return response.status(401).json({ error: 'Invalid email or phone, or password.' })
    }

    return response.json({
      farmer: publicFarmer(farmer),
      token: createToken(farmer._id, jwtSecret),
    })
  }))

  app.get('/api/farmers/me', authenticate, asyncRoute(async (request, response) => {
    const farmer = await farmerModel.findById(request.farmerId).select('-passwordHash')
    if (!farmer) {
      return response.status(404).json({ error: 'Farmer account was not found.' })
    }

    return response.json({ farmer: publicFarmer(farmer) })
  }))

  app.get('/api/crop-plans', authenticate, asyncRoute(async (request, response) => {
    const plans = await cropPlanModel
      .find({ farmer: request.farmerId })
      .sort({ createdAt: -1 })
      .lean()

    return response.json({ plans })
  }))

  app.get('/api/crop-plans/:id', authenticate, asyncRoute(async (request, response) => {
    const { id } = request.params
    if (!mongoose.isValidObjectId(id)) {
      return response.status(400).json({ error: 'Crop plan ID is invalid.' })
    }

    const plan = await cropPlanModel.findOne({ _id: id, farmer: request.farmerId }).lean()
    if (!plan) {
      return response.status(404).json({ error: 'Crop plan was not found.' })
    }

    return response.json({ plan })
  }))

  app.post('/api/crop-plans', authenticate, asyncRoute(async (request, response) => {
    const { cropName, season, soilType, landSizeAcres, recommendation, notes } = request.body ?? {}
    const plan = await cropPlanModel.create({
      farmer: request.farmerId,
      cropName,
      season,
      soilType,
      landSizeAcres,
      recommendation,
      notes,
    })

    return response.status(201).json({ plan })
  }))

  app.patch('/api/crop-plans/:id/status', authenticate, asyncRoute(async (request, response) => {
    const { id } = request.params
    const { status } = request.body ?? {}

    if (!mongoose.isValidObjectId(id)) {
      return response.status(400).json({ error: 'Crop plan ID is invalid.' })
    }
    if (!planStatuses.includes(status)) {
      return response.status(400).json({ error: `Status must be one of: ${planStatuses.join(', ')}.` })
    }

    const plan = await cropPlanModel.findOneAndUpdate(
      { _id: id, farmer: request.farmerId },
      { $set: { status } },
      { new: true, runValidators: true },
    )
    if (!plan) {
      return response.status(404).json({ error: 'Crop plan was not found.' })
    }

    return response.json({ plan })
  }))

  app.delete('/api/crop-plans/:id', authenticate, asyncRoute(async (request, response) => {
    const { id } = request.params
    if (!mongoose.isValidObjectId(id)) {
      return response.status(400).json({ error: 'Crop plan ID is invalid.' })
    }

    const plan = await cropPlanModel.findOneAndDelete({ _id: id, farmer: request.farmerId })
    if (!plan) {
      return response.status(404).json({ error: 'Crop plan was not found.' })
    }

    return response.status(204).end()
  }))

  app.use((_request, response) => {
    response.status(404).json({ error: 'API route was not found.' })
  })

  app.use((error, _request, response, _next) => {
    if (error?.code === 11000) {
      return response.status(409).json({ error: 'An account already exists with that email or phone.' })
    }
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      return response.status(400).json({ error: error.message })
    }
    if (error instanceof SyntaxError && 'body' in error) {
      return response.status(400).json({ error: 'Request body must contain valid JSON.' })
    }

    console.error('API request failed:', error)
    return response.status(500).json({ error: 'An unexpected server error occurred.' })
  })

  return app
}
