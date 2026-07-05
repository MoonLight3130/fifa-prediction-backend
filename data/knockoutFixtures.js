/**
 * FIFA World Cup 2026 knockout bracket (matches M89–M104).
 * Times from the official bracket are stored as IST (UTC+5:30).
 */

function ist(date, hour, minute) {
  const kickoffAt = new Date(`${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+05:30`)
  const predictionDeadline = new Date(kickoffAt.getTime() - 5 * 60 * 1000)
  return { kickoffAt, predictionDeadline }
}

function formatDisplay(date, hour, minute) {
  const d = new Date(`${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+05:30`)
  const dateStr = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  const timeStr = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
  return { date: dateStr, time: timeStr }
}

function match({
  matchCode,
  stage,
  stageLabel,
  group,
  date,
  hour,
  minute,
  homeTeam,
  awayTeam,
  venue = 'TBD',
  hostCity = 'USA / Mexico / Canada',
  status = 'Upcoming',
  homeScore = null,
  awayScore = null,
  resultPublished = false,
  predictionsOpen = true,
}) {
  const { kickoffAt, predictionDeadline } = ist(date, hour, minute)
  const { date: displayDate, time: displayTime } = formatDisplay(date, hour, minute)
  const finished = status === 'Finished'

  return {
    matchCode,
    stage,
    stageLabel,
    group,
    date: displayDate,
    time: displayTime,
    kickoffAt,
    predictionDeadline,
    predictionsOpen: finished ? false : predictionsOpen,
    homeTeam,
    awayTeam,
    venue,
    hostCity,
    status,
    homeScore,
    awayScore,
    resultPublished: finished ? true : resultPublished,
  }
}

export const knockoutFixtures = [
  // Round of 16 — completed
  match({
    matchCode: 'M89',
    stage: 'round16',
    stageLabel: 'Round of 16',
    group: 'Match 89',
    date: '2026-07-05',
    hour: 0,
    minute: 30,
    homeTeam: { name: 'Paraguay', code: 'PY' },
    awayTeam: { name: 'France', code: 'FR' },
    status: 'Finished',
    homeScore: 0,
    awayScore: 1,
    predictionsOpen: false,
  }),
  match({
    matchCode: 'M90',
    stage: 'round16',
    stageLabel: 'Round of 16',
    group: 'Match 90',
    date: '2026-07-05',
    hour: 5,
    minute: 30,
    homeTeam: { name: 'Canada', code: 'CA' },
    awayTeam: { name: 'Morocco', code: 'MA' },
    status: 'Finished',
    homeScore: 0,
    awayScore: 3,
    predictionsOpen: false,
  }),

  // Round of 16 — upcoming
  match({
    matchCode: 'M91',
    stage: 'round16',
    stageLabel: 'Round of 16',
    group: 'Match 91',
    date: '2026-07-06',
    hour: 1,
    minute: 30,
    homeTeam: { name: 'Brazil', code: 'BR' },
    awayTeam: { name: 'Norway', code: 'NO' },
  }),
  match({
    matchCode: 'M92',
    stage: 'round16',
    stageLabel: 'Round of 16',
    group: 'Match 92',
    date: '2026-07-06',
    hour: 5,
    minute: 30,
    homeTeam: { name: 'Mexico', code: 'MX' },
    awayTeam: { name: 'England', code: 'ENG' },
  }),
  match({
    matchCode: 'M93',
    stage: 'round16',
    stageLabel: 'Round of 16',
    group: 'Match 93',
    date: '2026-07-07',
    hour: 0,
    minute: 30,
    homeTeam: { name: 'Portugal', code: 'PT' },
    awayTeam: { name: 'Spain', code: 'ES' },
  }),
  match({
    matchCode: 'M94',
    stage: 'round16',
    stageLabel: 'Round of 16',
    group: 'Match 94',
    date: '2026-07-07',
    hour: 5,
    minute: 30,
    homeTeam: { name: 'USA', code: 'US' },
    awayTeam: { name: 'Belgium', code: 'BE' },
  }),
  match({
    matchCode: 'M95',
    stage: 'round16',
    stageLabel: 'Round of 16',
    group: 'Match 95',
    date: '2026-07-07',
    hour: 21,
    minute: 30,
    homeTeam: { name: 'Argentina', code: 'AR' },
    awayTeam: { name: 'Egypt', code: 'EG' },
  }),
  match({
    matchCode: 'M96',
    stage: 'round16',
    stageLabel: 'Round of 16',
    group: 'Match 96',
    date: '2026-07-08',
    hour: 1,
    minute: 30,
    homeTeam: { name: 'Switzerland', code: 'CH' },
    awayTeam: { name: 'Colombia', code: 'CO' },
  }),

  // Quarter-finals
  match({
    matchCode: 'M97',
    stage: 'quarter',
    stageLabel: 'Quarter Finals',
    group: 'Match 97',
    date: '2026-07-10',
    hour: 1,
    minute: 30,
    homeTeam: { name: 'France', code: 'FR' },
    awayTeam: { name: 'Morocco', code: 'MA' },
  }),
  match({
    matchCode: 'M98',
    stage: 'quarter',
    stageLabel: 'Quarter Finals',
    group: 'Match 98',
    date: '2026-07-11',
    hour: 0,
    minute: 30,
    homeTeam: { name: 'Winner Match 93', code: '' },
    awayTeam: { name: 'Winner Match 94', code: '' },
  }),
  match({
    matchCode: 'M99',
    stage: 'quarter',
    stageLabel: 'Quarter Finals',
    group: 'Match 99',
    date: '2026-07-12',
    hour: 2,
    minute: 30,
    homeTeam: { name: 'Winner Match 91', code: '' },
    awayTeam: { name: 'Winner Match 92', code: '' },
  }),
  match({
    matchCode: 'M100',
    stage: 'quarter',
    stageLabel: 'Quarter Finals',
    group: 'Match 100',
    date: '2026-07-12',
    hour: 6,
    minute: 30,
    homeTeam: { name: 'Winner Match 95', code: '' },
    awayTeam: { name: 'Winner Match 96', code: '' },
  }),

  // Semi-finals
  match({
    matchCode: 'M101',
    stage: 'semi',
    stageLabel: 'Semi Finals',
    group: 'Match 101',
    date: '2026-07-15',
    hour: 0,
    minute: 30,
    homeTeam: { name: 'Winner Match 97', code: '' },
    awayTeam: { name: 'Winner Match 98', code: '' },
  }),
  match({
    matchCode: 'M102',
    stage: 'semi',
    stageLabel: 'Semi Finals',
    group: 'Match 102',
    date: '2026-07-16',
    hour: 0,
    minute: 30,
    homeTeam: { name: 'Winner Match 99', code: '' },
    awayTeam: { name: 'Winner Match 100', code: '' },
  }),

  // Third place & Final
  match({
    matchCode: 'M103',
    stage: 'third',
    stageLabel: 'Third Place Play-off',
    group: 'Match 103',
    date: '2026-07-19',
    hour: 2,
    minute: 30,
    homeTeam: { name: 'Runner-up Match 101', code: '' },
    awayTeam: { name: 'Runner-up Match 102', code: '' },
    venue: 'Hard Rock Stadium',
    hostCity: 'Miami, USA',
  }),
  match({
    matchCode: 'M104',
    stage: 'final',
    stageLabel: 'Final',
    group: 'Match 104',
    date: '2026-07-20',
    hour: 0,
    minute: 30,
    homeTeam: { name: 'Winner Match 101', code: '' },
    awayTeam: { name: 'Winner Match 102', code: '' },
    venue: 'MetLife Stadium',
    hostCity: 'New Jersey, USA',
  }),
]
