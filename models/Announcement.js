import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['normal', 'high'],
      default: 'normal',
    },
    published: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'announcements',
  },
)

announcementSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    title: this.title,
    body: this.body,
    priority: this.priority,
    published: this.published,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

const Announcement = mongoose.model('Announcement', announcementSchema)

export default Announcement
