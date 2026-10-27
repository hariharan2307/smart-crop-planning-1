import assert from 'node:assert/strict'
import test from 'node:test'
import Farmer from './Farmer.js'

test('normalizes email and accepts a farmer with required profile fields', async () => {
  const farmer = new Farmer({
    fullName: '  Amina Khan  ',
    email: 'AMINA@example.com ',
    passwordHash: '$2b$12$examplehashedpasswordvalue',
    farmLocation: 'Ludhiana, Punjab',
    farmSizeAcres: 2.5,
    soilType: 'Loamy',
  })

  await farmer.validate()

  assert.equal(farmer.fullName, 'Amina Khan')
  assert.equal(farmer.email, 'amina@example.com')
  assert.equal(farmer.farmSizeAcres, 2.5)
  assert.equal(farmer.passwordHash, '$2b$12$examplehashedpasswordvalue')
})

test('accepts a phone number when email is not provided', async () => {
  const farmer = new Farmer({
    fullName: 'Amina Khan',
    phone: '+91 98765 43210',
    passwordHash: '$2b$12$examplehashedpasswordvalue',
    farmLocation: 'Ludhiana, Punjab',
  })

  await farmer.validate()
  assert.equal(farmer.phone, '+91 98765 43210')
})

test('requires a valid email or phone contact', async () => {
  const farmer = new Farmer({
    fullName: 'Amina Khan',
    passwordHash: '$2b$12$examplehashedpasswordvalue',
    farmLocation: 'Ludhiana, Punjab',
  })

  await assert.rejects(farmer.validate(), (error) => {
    assert.ok(error.errors.email)
    assert.ok(error.errors.phone)
    return true
  })
})

test('rejects unsupported soil types and non-positive farm size', async () => {
  const farmer = new Farmer({
    fullName: 'Amina Khan',
    email: 'amina@example.com',
    passwordHash: '$2b$12$examplehashedpasswordvalue',
    farmLocation: 'Ludhiana, Punjab',
    farmSizeAcres: 0,
    soilType: 'Unknown',
  })

  await assert.rejects(farmer.validate(), (error) => {
    assert.ok(error.errors.farmSizeAcres)
    assert.ok(error.errors.soilType)
    return true
  })
})

test('rejects a phone number without enough digits', async () => {
  const farmer = new Farmer({
    fullName: 'Amina Khan',
    phone: '-------',
    passwordHash: '$2b$12$examplehashedpasswordvalue',
    farmLocation: 'Ludhiana, Punjab',
  })

  await assert.rejects(farmer.validate(), (error) => {
    assert.ok(error.errors.phone)
    return true
  })
})
