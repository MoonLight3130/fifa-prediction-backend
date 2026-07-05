export function formatUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    rollNumber: user.rollNumber,
    department: user.department,
    semester: user.semester,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    phone: user.phone,
    email: user.email,
    predictionsSubmitted: user.predictionsSubmitted,
    totalPoints: user.totalPoints,
    correctWinnerPredictions: user.correctWinnerPredictions,
    exactScorePredictions: user.exactScorePredictions,
    rank: user.rank,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export function formatLeaderboardEntry(user, index) {
  return {
    rank: index + 1,
    rollNumber: user.rollNumber,
    name: user.fullName,
    totalPoints: user.totalPoints,
    correctWinners: user.correctWinnerPredictions,
    exactScores: user.exactScorePredictions,
    predictionsSubmitted: user.predictionsSubmitted,
    department: user.department,
    semester: user.semester,
    status: user.status,
  }
}

export function formatSettings(settings) {
  return {
    tournamentName: settings.tournamentName,
    season: settings.season,
    tournamentLogo: settings.tournamentLogo,
    pointsExactScore: settings.pointsExactScore,
    pointsCorrectWinner: settings.pointsCorrectWinner,
    pointsGoalDifference: settings.pointsGoalDifference,
    registrationOpen: settings.registrationOpen,
    predictionsLocked: settings.predictionsLocked,
    siteName: settings.siteName,
    collegeName: settings.collegeName,
    contactEmail: settings.contactEmail,
    maintenanceMode: settings.maintenanceMode,
    announcementBanner: settings.announcementBanner,
    homepageBanner: settings.homepageBanner,
    themeAccent: settings.themeAccent,
    updatedAt: settings.updatedAt,
  }
}

export function mapFixtureStatus(status) {
  if (status === 'Live' || status === 'Ongoing') return 'live'
  if (status === 'Finished') return 'finished'
  return 'upcoming'
}

export function groupMatchesByStage(matches) {
  const stageMeta = {
    group: { stage: 'group', title: 'Group Stage', icon: 'groups', viewLink: 'View Groups' },
    round16: { stage: 'round16', title: 'Round of 16', icon: 'knockout', viewLink: 'View Stage' },
    quarter: { stage: 'quarter', title: 'Quarter Finals', icon: 'knockout', viewLink: 'View Stage' },
    semi: { stage: 'semi', title: 'Semi Finals', icon: 'knockout', viewLink: 'View Stage' },
    third: { stage: 'third', title: 'Third Place Play-off', icon: 'knockout', viewLink: 'View Stage' },
    final: { stage: 'final', title: 'Final', icon: 'trophy', viewLink: 'View Stage' },
  }

  const order = ['group', 'round16', 'quarter', 'semi', 'third', 'final']

  return order
    .map((stage) => {
      const fixtures = matches
        .filter((match) => match.stage === stage)
        .map((match) => ({
          id: match.id,
          matchCode: match.matchCode,
          stage: match.stage,
          group: match.group,
          date: match.date,
          time: match.time,
          home: match.homeTeam,
          away: match.awayTeam,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          status: mapFixtureStatus(match.status),
          venue: match.venue,
          hostCity: match.hostCity,
          kickoffAt: match.kickoffAt,
          predictionsOpen: match.predictionsOpen,
        }))

      if (fixtures.length === 0) return null
      return { ...stageMeta[stage], fixtures }
    })
    .filter(Boolean)
}
