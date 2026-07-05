import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { adminOnly } from '../middleware/adminMiddleware.js'
import {
  getPublishedAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js'

const router = express.Router()

router.get('/published', getPublishedAnnouncements)
router.get('/', protect, adminOnly, getAllAnnouncements)
router.post('/', protect, adminOnly, createAnnouncement)
router.put('/:id', protect, adminOnly, updateAnnouncement)
router.delete('/:id', protect, adminOnly, deleteAnnouncement)

export default router
