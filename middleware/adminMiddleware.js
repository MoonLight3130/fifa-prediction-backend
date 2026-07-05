import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * Restricts routes to admin users only.
 */
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.',
    })
  }
  next()
})
