import assert from 'node:assert/strict'
import test from 'node:test'
import CropPlan from './CropPlan.js'

const validPlan = (overrides = {}) => new CropPlan({
  farmer: '507f1f77bcf86cd799439011',
  cropName: 'Rice',
  season: 'Kharif',
  soilType: 'Loamy',
  landSizeAcres: 2,
  recommendation: {
    matchScore: 96,
    expectedYieldTonsPerHectare: 4.5,
    marketOutlook: 'Stable',
  },
  ...overrides,
})

test('validates a crop plan and applies the planned status by default', async () => {
  const plan = validPlan()

  await plan.validate()

  assert.equal(plan.status, 'Planned')
  assert.equal(plan.cropName, 'Rice')
  assert.equal(plan.recommendation.matchScore, 96)
})

test('rejects invalid crop plan fields and recommendation ranges', async () => {
  const plan = validPlan({
    cropName: 'Coffee',
    season: 'Spring',
    soilType: 'Unknown',
    landSizeAcres: 0,
    recommendation: {
      matchScore: 120,
      expectedYieldTonsPerHectare: -1,
      marketOutlook: 'Unclear',
    },
  })

  await assert.rejects(plan.validate(), (error) => {
    for (const path of [
      'cropName',
      'season',
      'soilType',
      'landSizeAcres',
      'recommendation.matchScore',
      'recommendation.expectedYieldTonsPerHectare',
      'recommendation.marketOutlook',
    ]) {
      assert.ok(error.errors[path], `Expected validation error for ${path}`)
    }

    return true
  })
})

test('requires the farmer reference and core planning fields', async () => {
  const plan = new CropPlan()

  await assert.rejects(plan.validate(), (error) => {
    assert.ok(error.errors.farmer)
    assert.ok(error.errors.cropName)
    assert.ok(error.errors.season)
    assert.ok(error.errors.soilType)
    assert.ok(error.errors.landSizeAcres)
    return true
  })
})
