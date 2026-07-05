import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * Protects private routes by validating the JWT Bearer token.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token missing.',
    })
  }

  try {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the .env file.')
    }

    const decoded = jwt.verify(token, secret)
    const userId = decoded.userId ?? decoded.id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not found.',
      })
    }

    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}.`,
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
    })
  }
})
