import Prediction from '../models/Prediction.js'
import Match from '../models/Match.js'
import Settings from '../models/Settings.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * Check if a team name indicates an undecided/placeholder team
 */
function isUndecidedTeam(teamName) {
  if (!teamName) return true
  
  const undecidedPatterns = [
    /^Winner\s+[A-Z]+\d+$/i,  // Winner M89, Winner QF1
    /^Loser\s+[A-Z]+\d+$/i,   // Loser M101
    /^TBD$/i,                  // To Be Determined
    /^To\s+Be\s+Determined$/i, // To Be Determined
    /^Winner\s+of\s+/i,        // Winner of Match X
    /^Loser\s+of\s+/i,         // Loser of Match X
    /^-\s*$/i,                 // Just a dash
    /^\?\s*$/i,                // Just a question mark
  ]
  
  return undecidedPatterns.some(pattern => pattern.test(teamName.trim()))
}

/**
 * Check if a match has both teams finalized
 */
function isMatchFinalized(match) {
  return !isUndecidedTeam(match.homeTeam?.name) && !isUndecidedTeam(match.awayTeam?.name)
}

function isPredictionWindowOpen(match, settings) {
  if (settings.predictionsLocked) return false
  if (!match.predictionsOpen) return false
  if (match.resultPublished) return false
  if (['Finished', 'Cancelled'].includes(match.status)) return false
  // Enforce prediction deadline (kickoff - 10 minutes by default)
  if (match.predictionDeadline && new Date() > new Date(match.predictionDeadline)) {
    return false
  }
  // Fallback to kickoff time if deadline not set
  if (match.kickoffAt && new Date() > new Date(match.kickoffAt)) {
    return false
  }
  return true
}

export const getMyPredictions = asyncHandler(async (req, res) => {
  const predictions = await Prediction.find({ user: req.user._id })
    .populate('match')
    .sort({ createdAt: -1 })

  res.json({
    success: true,
    predictions: predictions.map((prediction) => prediction.toPublicJSON()),
  })
})

export const getPredictionForMatch = asyncHandler(async (req, res) => {
  const prediction = await Prediction.findOne({
    user: req.user._id,
    match: req.params.matchId,
  })

  res.json({
    success: true,
    prediction: prediction ? prediction.toPublicJSON() : null,
  })
})

export const getAllPredictions = asyncHandler(async (req, res) => {
  const predictions = await Prediction.find()
    .populate('match')
    .sort({ createdAt: -1 })

  res.json({
    success: true,
    predictions: predictions.map((prediction) => prediction.toPublicJSON()),
  })
})

export const upsertPrediction = asyncHandler(async (req, res) => {
  const settings = await Settings.getAppSettings()
  
  // 1. Validate User Exists
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: 'User not found.' })
  }

  // 2. Validate Match Exists
  const match = await Match.findById(req.body.matchId)
  if (!match) {
    return res.status(404).json({ success: false, message: 'Match not found.' })
  }

  // 3. Validate Match Status is "Upcoming"
  if (match.status !== 'Upcoming') {
    return res.status(400).json({
      success: false,
      message: 'Predictions are closed for this match.',
    })
  }

  // 4. Validate Both Teams are Confirmed (Finalized)
  if (isUndecidedTeam(match.homeTeam?.name) || isUndecidedTeam(match.awayTeam?.name)) {
    return res.status(400).json({
      success: false,
      message: 'This match is not yet finalized. Please wait until both teams are confirmed.',
    })
  }

  // 5. Validate Prediction Deadline has not Expired
  const now = new Date()
  const deadline = match.predictionDeadline ? new Date(match.predictionDeadline) : (match.kickoffAt ? new Date(match.kickoffAt) : null)
  const isDeadlinePassed = settings.predictionsLocked || !match.predictionsOpen || (deadline && now > deadline)
  
  if (isDeadlinePassed) {
    return res.status(400).json({
      success: false,
      message: 'Predictions are closed for this match.',
    })
  }

  // 6. Validate User has not already submitted a prediction for that match (prevent duplicate, allow edit if matching ID)
  const existing = await Prediction.findOne({ match: match._id, user: req.user._id })
  if (existing) {
    const isEdit = req.body.predictionId === existing._id.toString() || req.body.id === existing._id.toString()
    if (!isEdit) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a prediction for this match.',
      })
    }
  }

  const payload = {
    match: match._id,
    user: req.user._id,
    rollNumber: req.user.rollNumber,
    fullName: req.user.fullName,
    department: req.user.department,
    semester: req.user.semester,
    winner: req.body.winner,
    homeScore: req.body.homeScore,
    awayScore: req.body.awayScore,
  }

  const prediction = await Prediction.findOneAndUpdate(
    { match: match._id, user: req.user._id },
    payload,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )

  res.status(201).json({ success: true, prediction: prediction.toPublicJSON() })
})

export const deletePrediction = asyncHandler(async (req, res) => {
  const prediction = await Prediction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!prediction) {
    return res.status(404).json({ success: false, message: 'Prediction not found.' })
  }

  res.json({ success: true, message: 'Prediction deleted.' })
})

export const adminDeletePrediction = asyncHandler(async (req, res) => {
  const prediction = await Prediction.findByIdAndDelete(req.params.id)
  if (!prediction) {
    return res.status(404).json({ success: false, message: 'Prediction not found.' })
  }
  res.json({ success: true, message: 'Prediction deleted.' })
})

export const getOpenMatches = asyncHandler(async (req, res) => {
  const matches = await Match.find({
    resultPublished: false,
    status: { $in: ['Upcoming', 'Ongoing', 'Live'] },
  }).sort({ kickoffAt: 1, createdAt: 1 })

  res.json({ success: true, matches: matches.map((match) => match.toPublicJSON()) })
})
