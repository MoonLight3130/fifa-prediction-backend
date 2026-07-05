import mongoose from 'mongoose'

const WINNERS = ['home', 'draw', 'away']

const predictionSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rollNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    department: { type: String, trim: true, default: '' },
    semester: { type: String, trim: true, default: '' },
    winner: {
      type: String,
      enum: WINNERS,
      required: true,
    },
    homeScore: { type: Number, required: true, min: 0 },
    awayScore: { type: Number, required: true, min: 0 },
    pointsEarned: { type: Number, default: 0, min: 0 },
    pointsLabel: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'predictions',
  },
)

predictionSchema.index({ match: 1, user: 1 }, { unique: true })

predictionSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    matchId: this.match?._id?.toString() ?? this.match?.toString(),
    rollNumber: this.rollNumber,
    fullName: this.fullName,
    department: this.department,
    semester: this.semester,
    winner: this.winner,
    homeScore: this.homeScore,
    awayScore: this.awayScore,
    pointsEarned: this.pointsEarned,
    pointsLabel: this.pointsLabel,
    submittedAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

const Prediction = mongoose.model('Prediction', predictionSchema)

export default Prediction
