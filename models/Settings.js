import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'app',
    },
    tournamentName: {
      type: String,
      default: 'FIFA World Cup Prediction League',
      trim: true,
    },
    season: { type: String, default: '2026', trim: true },
    tournamentLogo: { type: String, default: '', trim: true },
    pointsExactScore: { type: Number, default: 20, min: 0 },
    pointsCorrectWinner: { type: Number, default: 10, min: 0 },
    pointsGoalDifference: { type: Number, default: 5, min: 0 },
    registrationOpen: { type: Boolean, default: true },
    predictionsLocked: { type: Boolean, default: false },
    siteName: { type: String, default: 'FIFA Prediction League', trim: true },
    collegeName: {
      type: String,
      default: 'MES Institute of Technology',
      trim: true,
    },
    contactEmail: { type: String, default: 'admin@mesit.edu', trim: true },
    maintenanceMode: { type: Boolean, default: false },
    announcementBanner: { type: String, default: '', trim: true },
    homepageBanner: { type: String, default: '', trim: true },
    themeAccent: { type: String, default: '#22c55e', trim: true },
  },
  {
    timestamps: true,
    collection: 'settings',
  },
)

settingsSchema.statics.getAppSettings = async function getAppSettings() {
  let settings = await this.findOne({ key: 'app' })
  if (!settings) {
    settings = await this.create({ key: 'app' })
  }
  return settings
}

const Settings = mongoose.model('Settings', settingsSchema)

export default Settings
