/**
 * Calculate prediction points from configured scoring rules.
 */
export function calculatePoints(
  predictedWinner,
  predictedHome,
  predictedAway,
  actualHome,
  actualAway,
  settings,
) {
  const actualWinner =
    actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw'
  const exactScore = predictedHome === actualHome && predictedAway === actualAway
  const correctWinner = predictedWinner === actualWinner
  const goalDiff = predictedHome - predictedAway
  const actualDiff = actualHome - actualAway
  const correctGoalDiff = goalDiff === actualDiff

  if (exactScore) {
    return { points: settings.pointsExactScore, label: 'Exact Score' }
  }
  if (correctWinner) {
    return { points: settings.pointsCorrectWinner, label: 'Correct Winner' }
  }
  if (correctGoalDiff) {
    return { points: settings.pointsGoalDifference, label: 'Correct Goal Difference' }
  }
  return { points: 0, label: 'No Points' }
}

/**
 * Score all predictions for a published match and refresh user leaderboard stats.
 */
export async function scoreMatchAndRecalculate(matchId, settings) {
  const Match = (await import('../models/Match.js')).default
  const Prediction = (await import('../models/Prediction.js')).default
  const User = (await import('../models/User.js')).default

  const match = await Match.findById(matchId)
  if (!match || !match.resultPublished || match.homeScore === null || match.awayScore === null) {
    return
  }

  const predictions = await Prediction.find({ match: matchId })

  for (const prediction of predictions) {
    const outcome = calculatePoints(
      prediction.winner,
      prediction.homeScore,
      prediction.awayScore,
      match.homeScore,
      match.awayScore,
      settings,
    )
    prediction.pointsEarned = outcome.points
    prediction.pointsLabel = outcome.label
    await prediction.save()
  }

  await recalculateAllUserStats(User, Prediction)
}

/**
 * Rebuild totals and ranks for every active student from scored predictions.
 */
export async function recalculateAllUserStats(User, Prediction) {
  const students = await User.find({ role: 'student' })
  const allPredictions = await Prediction.find().populate('match')

  const statsByUser = new Map()

  for (const student of students) {
    statsByUser.set(student._id.toString(), {
      user: student,
      totalPoints: 0,
      correctWinners: 0,
      exactScores: 0,
      predictionsSubmitted: 0,
      earliestPrediction: null,
    })
  }

  for (const prediction of allPredictions) {
    const userId = prediction.user.toString()
    const bucket = statsByUser.get(userId)
    if (!bucket) continue

    bucket.predictionsSubmitted += 1
    bucket.totalPoints += prediction.pointsEarned ?? 0
    if (prediction.pointsEarned >= 10) bucket.correctWinners += 1
    if (prediction.pointsLabel === 'Exact Score') bucket.exactScores += 1
    
    // Track earliest prediction timestamp for tie-breaker
    if (!bucket.earliestPrediction || prediction.createdAt < bucket.earliestPrediction) {
      bucket.earliestPrediction = prediction.createdAt
    }
  }

  const ranked = Array.from(statsByUser.values()).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores
    // Tie-breaker: earliest prediction timestamp wins
    if (a.earliestPrediction && b.earliestPrediction) {
      return a.earliestPrediction - b.earliestPrediction
    }
    // Fallback to roll number if no predictions
    return a.user.rollNumber.localeCompare(b.user.rollNumber)
  })

  for (let index = 0; index < ranked.length; index += 1) {
    const entry = ranked[index]
    entry.user.totalPoints = entry.totalPoints
    entry.user.correctWinnerPredictions = entry.correctWinners
    entry.user.exactScorePredictions = entry.exactScores
    entry.user.predictionsSubmitted = entry.predictionsSubmitted
    entry.user.rank = index + 1
    await entry.user.save()
  }
}

export async function recalculateLeaderboard() {
  const User = (await import('../models/User.js')).default
  const Prediction = (await import('../models/Prediction.js')).default
  await recalculateAllUserStats(User, Prediction)
}
