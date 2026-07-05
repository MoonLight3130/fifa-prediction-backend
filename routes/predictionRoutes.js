import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { adminOnly } from '../middleware/adminMiddleware.js'
import {
  getMyPredictions,
  getPredictionForMatch,
  getAllPredictions,
  upsertPrediction,
  deletePrediction,
  adminDeletePrediction,
  getOpenMatches,
} from '../controllers/predictionController.js'

const router = express.Router()

router.get('/open-matches', getOpenMatches)
router.get('/mine', protect, getMyPredictions)
router.get('/match/:matchId', protect, getPredictionForMatch)
router.get('/', protect, adminOnly, getAllPredictions)
router.post('/', protect, upsertPrediction)
router.delete('/admin/:id', protect, adminOnly, adminDeletePrediction)
router.delete('/:id', protect, deletePrediction)

export default router
