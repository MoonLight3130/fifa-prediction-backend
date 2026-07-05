import Announcement from '../models/Announcement.js'
import ActivityLog from '../models/ActivityLog.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getPublishedAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ published: true }).sort({ updatedAt: -1 })
  res.json({
    success: true,
    announcements: announcements.map((item) => item.toPublicJSON()),
  })
})

export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().sort({ updatedAt: -1 })
  res.json({
    success: true,
    announcements: announcements.map((item) => item.toPublicJSON()),
  })
})

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({
    ...req.body,
    createdBy: req.user._id,
  })
  await ActivityLog.log('Create Announcement', announcement.title, req.user)
  res.status(201).json({ success: true, announcement: announcement.toPublicJSON() })
})

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found.' })
  }
  await ActivityLog.log('Update Announcement', announcement.title, req.user)
  res.json({ success: true, announcement: announcement.toPublicJSON() })
})

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id)
  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found.' })
  }
  await ActivityLog.log('Delete Announcement', announcement.title, req.user)
  res.json({ success: true, message: 'Announcement deleted.' })
})
