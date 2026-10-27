import mongoose from 'mongoose'

const farmerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required() {
        return !this.phone
      },
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
    },
    phone: {
      type: String,
      trim: true,
      required() {
        return !this.email
      },
      match: [/^\+?[0-9\s()-]{7,20}$/, 'Enter a valid phone number.'],
      validate: {
        validator(value) {
          const digitCount = value?.replace(/\D/g, '').length ?? 0
          return digitCount >= 7 && digitCount <= 15
        },
        message: 'Phone numbers must contain 7 to 15 digits.',
      },
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    farmLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    farmSizeAcres: {
      type: Number,
      min: 0.1,
    },
    soilType: {
      type: String,
      enum: ['Clay', 'Loamy', 'Sandy'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

farmerSchema.index({ email: 1 }, { unique: true, sparse: true })
farmerSchema.index({ phone: 1 }, { unique: true, sparse: true })

const Farmer = mongoose.models.Farmer ?? mongoose.model('Farmer', farmerSchema)

export default Farmer
