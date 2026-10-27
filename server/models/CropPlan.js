import mongoose from 'mongoose'

const recommendationSchema = new mongoose.Schema(
  {
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    expectedYieldTonsPerHectare: {
      type: Number,
      min: 0,
    },
    marketOutlook: {
      type: String,
      enum: ['Rising', 'Stable', 'Declining'],
    },
    expectedHarvestDate: Date,
  },
  { _id: false },
)

const cropPlanSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
      enum: ['Rice', 'Maize', 'Wheat', 'Millet', 'Chickpea'],
    },
    season: {
      type: String,
      required: true,
      enum: ['Kharif', 'Rabi', 'Zaid'],
    },
    soilType: {
      type: String,
      required: true,
      enum: ['Clay', 'Loamy', 'Sandy'],
    },
    landSizeAcres: {
      type: Number,
      required: true,
      min: 0.1,
    },
    status: {
      type: String,
      enum: ['Planned', 'In progress', 'Completed', 'Cancelled'],
      default: 'Planned',
    },
    recommendation: {
      type: recommendationSchema,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

cropPlanSchema.index({ farmer: 1, createdAt: -1 })

const CropPlan = mongoose.models.CropPlan ?? mongoose.model('CropPlan', cropPlanSchema)

export default CropPlan
