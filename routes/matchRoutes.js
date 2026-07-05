import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { adminOnly } from '../middleware/adminMiddleware.js'
import {
  getMatches,
  getNextMatch,
  getFixtureGroups,
  getMatchResults,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  publishMatchResult,
  recalculatePoints,
} from '../controllers/matchController.js'

const router = express.Router()

router.get('/next', getNextMatch)
router.get('/fixtures', getFixtureGroups)
router.get('/results', getMatchResults)
router.get('/', getMatches)
router.get('/:id', getMatchById)

router.post('/', protect, adminOnly, createMatch)
router.post('/recalculate', protect, adminOnly, recalculatePoints)
router.post('/:id/publish', protect, adminOnly, publishMatchResult)
router.put('/:id', protect, adminOnly, updateMatch)
router.delete('/:id', protect, adminOnly, deleteMatch)

export default router
