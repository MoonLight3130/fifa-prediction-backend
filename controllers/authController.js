import { validationResult } from 'express-validator'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { recalculateLeaderboard } from '../services/scoringService.js'

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'AI', 'IT', 'MCA', 'MBA', 'Other']
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'FACULTY']

/** Development-only admin credentials */
const DEV_ADMIN_ROLL = 'MEK23CS024'
const DEV_ADMIN_PASSWORD = 'pass123'

/**
 * Formats a user document for safe API responses.
 */
function formatUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    rollNumber: user.rollNumber,
    department: user.department,
    semester: user.semester,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    phone: user.phone,
    email: user.email,
    predictionsSubmitted: user.predictionsSubmitted,
    totalPoints: user.totalPoints,
    correctWinnerPredictions: user.correctWinnerPredictions,
    exactScorePredictions: user.exactScorePredictions,
    rank: user.rank,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

/**
 * POST /api/auth/register
 * Registers a new student account.
 */
export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    })
  }

  const fullName = req.body.fullName.trim()
  const rollNumber = req.body.rollNumber.trim().toUpperCase()
  const departmentInput = req.body.department.trim()
  const semester = req.body.semester.trim().toUpperCase()
  const password = req.body.password

  const department = DEPARTMENTS.find(
    (value) => value.toUpperCase() === departmentInput.toUpperCase(),
  )

  if (!department) {
    return res.status(400).json({
      success: false,
      message: 'Invalid department. Use a valid department code.',
    })
  }

  if (!SEMESTERS.includes(semester)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid semester. Use S1 through S8, or Faculty.',
    })
  }

  const existingUser = await User.findOne({ rollNumber })

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Roll Number already registered.',
    })
  }

  await User.create({
    fullName,
    rollNumber,
    department,
    semester,
    password,
    role: 'student',
    status: 'Active',
  })

  await recalculateLeaderboard()

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
  })
})

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token.
 */
export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    })
  }

  const rollNumber = req.body.rollNumber.trim().toUpperCase()
  const password = req.body.password

  const user = await User.findOne({ rollNumber }).select('+password')

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Roll Number or Password.',
    })
  }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Roll Number or Password.',
    })
  }

  if (user.status !== 'Active') {
    return res.status(403).json({
      success: false,
      message: `Account is ${user.status}. Contact support.`,
    })
  }

  // Development-only: promote configured admin account
  if (rollNumber === DEV_ADMIN_ROLL && password === DEV_ADMIN_PASSWORD && user.role !== 'admin') {
    user.role = 'admin'
  }

  user.lastLogin = new Date()
  await user.save()

  const token = user.generateToken()

  return res.status(200).json({
    success: true,
    token,
    user: formatUser(user),
  })
})

/**
 * GET /api/auth/me
 * Returns the currently authenticated user profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    user: formatUser(req.user),
  })
})

/**
 * PUT /api/auth/me
 * Updates the currently authenticated user's profile.
 */
export const updateMe = asyncHandler(async (req, res) => {
  const { fullName } = req.body

  if (!fullName || fullName.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Full Name cannot be empty.',
    })
  }

  req.user.fullName = fullName.trim()
  await req.user.save()

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: formatUser(req.user),
  })
})
