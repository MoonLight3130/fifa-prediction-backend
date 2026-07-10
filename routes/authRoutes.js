import express from 'express'
import { body } from 'express-validator'
import { getMe, login, register, updateMe } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'AI', 'IT', 'MCA', 'MBA', 'Other']
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'FACULTY']

const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full Name is required.')
    .isLength({ min: 3, max: 100 })
    .withMessage('Full Name must be between 3 and 100 characters.'),
  body('rollNumber')
    .trim()
    .notEmpty()
    .withMessage('Roll Number is required.'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required.')
    .isIn(DEPARTMENTS)
    .withMessage('Invalid department code.'),
  body('semester')
    .trim()
    .notEmpty()
    .withMessage('Semester is required.')
    .isIn(SEMESTERS)
    .withMessage('Semester must be S1 through S8, or Faculty.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
]

const loginValidation = [
  body('rollNumber')
    .trim()
    .notEmpty()
    .withMessage('Roll Number is required.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
]

router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)
router.get('/me', protect, getMe)
router.put('/me', protect, updateMe)

export default router
