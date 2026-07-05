import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Match from '../models/Match.js'
import Settings from '../models/Settings.js'
import Announcement from '../models/Announcement.js'

dotenv.config()

const sampleMatches = [
  {
    stage: 'group',
    stageLabel: 'Group Stage',
    group: 'Group C',
    date: '15 Jun 2026',
    time: '08:00 PM',
    kickoffAt: new Date('2026-06-15T14:30:00.000Z'),
    predictionDeadline: new Date('2026-06-15T14:25:00.000Z'),
    predictionsOpen: true,
    homeTeam: { name: 'Argentina', code: 'AR' },
    awayTeam: { name: 'Morocco', code: 'MA' },
    venue: 'Lusail Stadium',
    hostCity: 'Lusail, Qatar',
    status: 'Upcoming',
    homeScore: null,
    awayScore: null,
    resultPublished: false,
  },
  {
    stage: 'group',
    stageLabel: 'Group Stage',
    group: 'Group B',
    date: '15 Jun 2026',
    time: '03:00 PM',
    kickoffAt: new Date('2026-06-15T09:30:00.000Z'),
    predictionDeadline: new Date('2026-06-15T09:25:00.000Z'),
    predictionsOpen: false,
    homeTeam: { name: 'Spain', code: 'ES' },
    awayTeam: { name: 'Netherlands', code: 'NL' },
    venue: 'Al Bayt Stadium',
    hostCity: 'Al Khor, Qatar',
    status: 'Finished',
    homeScore: 2,
    awayScore: 0,
    resultPublished: true,
  },
  {
    stage: 'group',
    stageLabel: 'Group Stage',
    group: 'Group A',
    date: '14 Jun 2026',
    time: '06:00 PM',
    kickoffAt: new Date('2026-06-14T12:30:00.000Z'),
    predictionsOpen: true,
    homeTeam: { name: 'Mexico', code: 'MX' },
    awayTeam: { name: 'Canada', code: 'CA' },
    venue: 'Azteca Stadium',
    hostCity: 'Mexico City, Mexico',
    status: 'Upcoming',
    homeScore: null,
    awayScore: null,
    resultPublished: false,
  },
  {
    stage: 'final',
    stageLabel: 'Final',
    group: 'Final',
    date: '19 Jul 2026',
    time: '08:00 PM',
    kickoffAt: new Date('2026-07-19T14:30:00.000Z'),
    predictionsOpen: true,
    homeTeam: { name: 'Winner SF - 1', code: '' },
    awayTeam: { name: 'Winner SF - 2', code: '' },
    venue: 'MetLife Stadium',
    hostCity: 'New Jersey, USA',
    status: 'Upcoming',
    homeScore: null,
    awayScore: null,
    resultPublished: false,
  },
]

async function seedDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env')
    process.exit(1)
  }

  await mongoose.connect(uri)

  const existingMatches = await Match.countDocuments()
  if (existingMatches === 0) {
    await Match.insertMany(sampleMatches)
    console.log(`Seeded ${sampleMatches.length} matches`)
  } else {
    console.log(`Skipped matches seed (${existingMatches} already exist)`)
  }

  await Settings.getAppSettings()
  console.log('Settings initialized')

  const announcementCount = await Announcement.countDocuments()
  if (announcementCount === 0) {
    await Announcement.create({
      title: 'Welcome to FIFA Prediction League 2026',
      body: 'Register, submit your predictions before each match deadline, and climb the leaderboard!',
      priority: 'high',
      published: true,
    })
    console.log('Seeded welcome announcement')
  }

  await mongoose.disconnect()
  console.log('Database seed complete')
}

seedDatabase().catch((error) => {
  console.error(error)
  process.exit(1)
})
