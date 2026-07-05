import mongoose from 'mongoose'

const TEAM_SCHEMA = {
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, uppercase: true, default: '' },
}

const MATCH_STATUSES = ['Upcoming', 'Ongoing', 'Live', 'Finished', 'Delayed', 'Cancelled']
const STAGES = ['group', 'round16', 'quarter', 'semi', 'third', 'final']

const matchSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: STAGES,
      required: true,
    },
    stageLabel: { type: String, required: true, trim: true },
    group: { type: String, trim: true, default: '' },
    matchCode: { type: String, trim: true, uppercase: true, default: '', index: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    kickoffAt: { type: Date, default: null },
    predictionDeadline: { type: Date, default: null },
    predictionsOpen: { type: Boolean, default: true },
    homeTeam: TEAM_SCHEMA,
    awayTeam: TEAM_SCHEMA,
    venue: { type: String, trim: true, default: '' },
    hostCity: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: MATCH_STATUSES,
      default: 'Upcoming',
    },
    homeScore: { type: Number, default: null },
    awayScore: { type: Number, default: null },
    resultPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'matches',
  },
)

matchSchema.index({ status: 1, kickoffAt: 1 })
matchSchema.index({ stage: 1 })
matchSchema.index({ resultPublished: 1 })

// Auto-calculate prediction deadline as kickoff - 10 minutes if not set
matchSchema.pre('save', function autoCalculatePredictionDeadline() {
  if (this.kickoffAt && !this.predictionDeadline) {
    const deadline = new Date(this.kickoffAt)
    deadline.setMinutes(deadline.getMinutes() - 10)
    this.predictionDeadline = deadline
  }
})

matchSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    stage: this.stage,
    stageLabel: this.stageLabel,
    group: this.group,
    matchCode: this.matchCode,
    date: this.date,
    time: this.time,
    kickoffAt: this.kickoffAt,
    predictionDeadline: this.predictionDeadline,
    predictionsOpen: this.predictionsOpen,
    homeTeam: this.homeTeam,
    awayTeam: this.awayTeam,
    venue: this.venue,
    hostCity: this.hostCity,
    status: this.status,
    homeScore: this.homeScore,
    awayScore: this.awayScore,
    resultPublished: this.resultPublished,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

const Match = mongoose.model('Match', matchSchema)

export default Match
