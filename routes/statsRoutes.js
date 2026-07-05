import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { adminOnly } from '../middleware/adminMiddleware.js'
import {
  getLeaderboard,
  findByRollNumber,
  getHomeStats,
  getActivityLog,
  getParticipants,
  updateParticipant,
  deleteParticipant,
  getAdminDashboard,
} from '../controllers/statsController.js'

const router = express.Router()

router.get('/home', getHomeStats)
router.get('/leaderboard', getLeaderboard)
router.get('/leaderboard/:rollNumber', findByRollNumber)

router.get('/admin/dashboard', protect, adminOnly, getAdminDashboard)
router.get('/admin/activity', protect, adminOnly, getActivityLog)
router.get('/admin/participants', protect, adminOnly, getParticipants)
router.put('/admin/participants/:rollNumber', protect, adminOnly, updateParticipant)
router.delete('/admin/participants/:rollNumber', protect, adminOnly, deleteParticipant)

export default router
