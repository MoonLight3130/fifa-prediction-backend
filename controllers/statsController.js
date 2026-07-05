import User from '../models/User.js'
import Match from '../models/Match.js'
import Prediction from '../models/Prediction.js'
import Announcement from '../models/Announcement.js'
import ActivityLog from '../models/ActivityLog.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { formatLeaderboardEntry, formatUser } from '../utils/formatters.js'
import { recalculateLeaderboard } from '../services/scoringService.js'

export const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 0
  let query = User.find({ role: 'student', status: 'Active' }).sort({
    totalPoints: -1,
    exactScorePredictions: -1,
    correctWinnerPredictions: -1,
    rollNumber: 1,
  })

  if (limit > 0) query = query.limit(limit)

  const users = await query
  res.json({
    success: true,
    lastUpdated: new Date().toISOString(),
    entries: users.map((user, index) => formatLeaderboardEntry(user, index)),
  })
})

export const findByRollNumber = asyncHandler(async (req, res) => {
  const rollNumber = req.params.rollNumber.trim().toUpperCase()
  const user = await User.findOne({ rollNumber, role: 'student' })

  if (!user) {
    return res.status(404).json({ success: false, message: 'Participant not found.' })
  }

  // Calculate live rank by counting how many active students have more points
  const higherRanked = await User.countDocuments({
    role: 'student',
    status: 'Active',
    $or: [
      { totalPoints: { $gt: user.totalPoints } },
      { totalPoints: user.totalPoints, exactScorePredictions: { $gt: user.exactScorePredictions } },
      { totalPoints: user.totalPoints, exactScorePredictions: user.exactScorePredictions, correctWinnerPredictions: { $gt: user.correctWinnerPredictions } },
    ],
  })
  const liveIndex = higherRanked // 0-based position

  res.json({ success: true, entry: formatLeaderboardEntry(user, liveIndex) })
})

export const getHomeStats = asyncHandler(async (req, res) => {
  const [totalMatches, liveMatches, totalPredictions, totalParticipants, topEntries, announcements] =
    await Promise.all([
      Match.countDocuments(),
      Match.countDocuments({ status: { $in: ['Live', 'Ongoing'] } }),
      Prediction.countDocuments(),
      User.countDocuments({ role: 'student', status: 'Active' }),
      User.find({ role: 'student', status: 'Active' })
        .sort({ totalPoints: -1, exactScorePredictions: -1, correctWinnerPredictions: -1, rollNumber: 1 })
        .limit(10),
      Announcement.find({ published: true }).sort({ updatedAt: -1 }).limit(3),
    ])

  res.json({
    success: true,
    stats: {
      totalMatches,
      liveMatches,
      totalPredictions,
      totalParticipants,
    },
    topEntries: topEntries.map((user, index) => formatLeaderboardEntry(user, index)),
    announcements: announcements.map((item) => item.toPublicJSON()),
  })
})

export const getActivityLog = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(200)
  res.json({
    success: true,
    logs: logs.map((log) => ({
      id: log._id,
      action: log.action,
      details: log.details,
      adminRollNumber: log.adminRollNumber,
      timestamp: log.createdAt,
    })),
  })
})

export const getParticipants = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'student' }).sort({ rank: 1, totalPoints: -1 })
  res.json({
    success: true,
    participants: users.map((user) => formatUser(user)),
  })
})

export const updateParticipant = asyncHandler(async (req, res) => {
  const user = await User.findOne({ rollNumber: req.params.rollNumber.toUpperCase(), role: 'student' })
  if (!user) {
    return res.status(404).json({ success: false, message: 'Participant not found.' })
  }

  const allowed = [
    'totalPoints',
    'rank',
    'status',
    'correctWinnerPredictions',
    'exactScorePredictions',
    'predictionsSubmitted',
  ]

  for (const field of allowed) {
    if (req.body[field] !== undefined) user[field] = req.body[field]
  }

  await user.save()
  await ActivityLog.log('Edit Participant', `${user.rollNumber} updated`, req.user)
  res.json({ success: true, participant: formatUser(user) })
})

export const deleteParticipant = asyncHandler(async (req, res) => {
  const rollNumber = req.params.rollNumber.toUpperCase()
  const user = await User.findOne({ rollNumber, role: 'student' })

  if (!user) {
    return res.status(404).json({ success: false, message: 'Participant not found.' })
  }

  // Cascade delete: remove all predictions for this user
  await Prediction.deleteMany({ user: user._id })
  
  user.status = 'Blocked'
  user.totalPoints = 0
  user.rank = 0
  user.predictionsSubmitted = 0
  user.correctWinnerPredictions = 0
  user.exactScorePredictions = 0
  await user.save()
  await recalculateLeaderboard()
  await ActivityLog.log('Remove Participant', `Removed ${rollNumber} from league and deleted ${await Prediction.countDocuments({ user: user._id })} predictions`, req.user)

  res.json({ success: true, message: 'Participant removed.' })
})

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [matches, predictions, participants, announcements, recentActivity] = await Promise.all([
    Match.find().sort({ kickoffAt: 1 }).limit(20),
    Prediction.countDocuments(),
    User.countDocuments({ role: 'student' }),
    Announcement.countDocuments({ published: true }),
    ActivityLog.find().sort({ createdAt: -1 }).limit(8),
  ])

  const statusCounts = matches.reduce((acc, match) => {
    acc[match.status] = (acc[match.status] ?? 0) + 1
    return acc
  }, {})

  res.json({
    success: true,
    stats: {
      totalMatches: matches.length,
      liveMatches: matches.filter((match) => ['Live', 'Ongoing'].includes(match.status)).length,
      totalPredictions: predictions,
      totalParticipants: participants,
      publishedAnnouncements: announcements,
      statusChart: Object.entries(statusCounts).map(([label, value]) => ({ label, value })),
      recentMatches: matches.slice(0, 5).map((match) => match.toPublicJSON()),
      recentActivity: recentActivity.map((log) => ({
        id: log._id,
        action: log.action,
        details: log.details,
        adminRollNumber: log.adminRollNumber,
        timestamp: log.createdAt,
      })),
    },
  })
})
