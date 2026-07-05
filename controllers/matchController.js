import Match from '../models/Match.js'
import Settings from '../models/Settings.js'
import ActivityLog from '../models/ActivityLog.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { groupMatchesByStage } from '../utils/formatters.js'
import { scoreMatchAndRecalculate, recalculateLeaderboard } from '../services/scoringService.js'

export const getMatches = asyncHandler(async (req, res) => {
  const { status, stage, open } = req.query
  const filter = {}

  if (status) filter.status = status
  if (stage) filter.stage = stage
  if (open === 'true') {
    filter.predictionsOpen = true
    filter.status = { $in: ['Upcoming', 'Ongoing', 'Live'] }
    filter.resultPublished = false
  }

  const matches = await Match.find(filter).sort({ kickoffAt: 1, createdAt: 1 })
  res.json({ success: true, matches: matches.map((match) => match.toPublicJSON()) })
})

export const getNextMatch = asyncHandler(async (req, res) => {
  const now = new Date()
  const match =
    (await Match.findOne({
      status: { $in: ['Upcoming', 'Ongoing', 'Live'] },
      kickoffAt: { $gte: now },
    }).sort({ kickoffAt: 1 })) ||
    (await Match.findOne({ status: { $in: ['Upcoming', 'Ongoing', 'Live'] } }).sort({
      kickoffAt: 1,
      createdAt: 1,
    }))

  res.json({ success: true, match: match ? match.toPublicJSON() : null })
})

export const getFixtureGroups = asyncHandler(async (req, res) => {
  const matches = await Match.find().sort({ kickoffAt: 1, createdAt: 1 })
  const groups = groupMatchesByStage(matches.map((match) => match.toPublicJSON()))
  res.json({ success: true, groups })
})

export const getMatchResults = asyncHandler(async (req, res) => {
  const matches = await Match.find({ resultPublished: true }).sort({ kickoffAt: -1, createdAt: -1 })
  const results = matches.map((match) => ({
    matchId: match._id.toString(),
    stage: match.stage === 'group' ? 'group' : 'knockout',
    stageLabel: match.stageLabel,
    group: match.group,
    date: match.date,
    time: match.time,
    home: match.homeTeam,
    away: match.awayTeam,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    venue: match.venue,
    hostCity: match.hostCity,
  }))
  res.json({ success: true, results })
})

export const getMatchById = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id)
  if (!match) {
    return res.status(404).json({ success: false, message: 'Match not found.' })
  }
  res.json({ success: true, match: match.toPublicJSON() })
})

export const createMatch = asyncHandler(async (req, res) => {
  const match = await Match.create(req.body)
  await ActivityLog.log('Create Match', `${match.homeTeam.name} vs ${match.awayTeam.name}`, req.user)
  res.status(201).json({ success: true, match: match.toPublicJSON() })
})

export const updateMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id)
  if (!match) {
    return res.status(404).json({ success: false, message: 'Match not found.' })
  }

  const wasPublished = match.resultPublished
  const scoresChanged =
    (req.body.homeScore !== undefined && req.body.homeScore !== match.homeScore) ||
    (req.body.awayScore !== undefined && req.body.awayScore !== match.awayScore)

  Object.assign(match, req.body)
  await match.save()

  // Auto-recalculate if scores were edited on a published match
  if (wasPublished && scoresChanged) {
    const settings = await Settings.getAppSettings()
    await scoreMatchAndRecalculate(match._id, settings)
    await ActivityLog.log('Auto Recalculate', `Recalculated after score edit for ${match._id}`, req.user)
  }

  await ActivityLog.log('Update Match', `Updated match ${match._id}`, req.user)
  res.json({ success: true, match: match.toPublicJSON() })
})

export const deleteMatch = asyncHandler(async (req, res) => {
  const match = await Match.findByIdAndDelete(req.params.id)
  if (!match) {
    return res.status(404).json({ success: false, message: 'Match not found.' })
  }
  await ActivityLog.log('Delete Match', `Deleted match ${req.params.id}`, req.user)
  res.json({ success: true, message: 'Match deleted.' })
})

export const publishMatchResult = asyncHandler(async (req, res) => {
  const settings = await Settings.getAppSettings()
  const match = await Match.findById(req.params.id)

  if (!match) {
    return res.status(404).json({ success: false, message: 'Match not found.' })
  }
  if (match.resultPublished) {
    return res.status(400).json({ success: false, message: 'Result already published. Use update match to edit scores.' })
  }
  if (match.homeScore === null || match.awayScore === null) {
    return res.status(400).json({ success: false, message: 'Set scores before publishing.' })
  }

  match.status = 'Finished'
  match.resultPublished = true
  match.predictionsOpen = false
  await match.save()

  await scoreMatchAndRecalculate(match._id, settings)
  await ActivityLog.log('Publish Result', `Published result for ${match._id}`, req.user)

  res.json({ success: true, match: match.toPublicJSON() })
})

export const recalculatePoints = asyncHandler(async (req, res) => {
  const settings = await Settings.getAppSettings()
  const published = await Match.find({ resultPublished: true })

  for (const match of published) {
    await scoreMatchAndRecalculate(match._id, settings)
  }

  await recalculateLeaderboard()
  await ActivityLog.log('Recalculate Leaderboard', 'Manual leaderboard recalculation', req.user)
  res.json({ success: true, message: 'Leaderboard recalculated.' })
})
