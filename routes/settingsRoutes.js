import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { adminOnly } from '../middleware/adminMiddleware.js'
import { getSettings, updateSettings } from '../controllers/settingsController.js'

const router = express.Router()

router.get('/', getSettings)
router.put('/', protect, adminOnly, updateSettings)

export default router
