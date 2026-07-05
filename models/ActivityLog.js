import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    adminRollNumber: { type: String, required: true, uppercase: true, trim: true },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'activity_logs',
  },
)

activityLogSchema.index({ createdAt: -1 })

activityLogSchema.statics.log = async function log(action, details, admin) {
  return this.create({
    action,
    details,
    adminRollNumber: admin.rollNumber,
    adminId: admin._id,
  })
}

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)

export default ActivityLog
