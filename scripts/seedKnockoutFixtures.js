import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Match from '../models/Match.js'
import { knockoutFixtures } from '../data/knockoutFixtures.js'

dotenv.config()

async function seedKnockoutFixtures() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env')
    process.exit(1)
  }

  await mongoose.connect(uri)

  let created = 0
  let updated = 0

  for (const fixture of knockoutFixtures) {
    const existing = await Match.findOne({ matchCode: fixture.matchCode })
    if (existing) {
      await Match.updateOne({ matchCode: fixture.matchCode }, { $set: fixture })
      updated += 1
    } else {
      await Match.create(fixture)
      created += 1
    }
  }

  await mongoose.disconnect()
  console.log(`Knockout fixtures seeded: ${created} created, ${updated} updated (${knockoutFixtures.length} total)`)
}

seedKnockoutFixtures().catch((error) => {
  console.error(error)
  process.exit(1)
})
