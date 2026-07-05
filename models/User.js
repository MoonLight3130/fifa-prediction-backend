import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'AI', 'IT', 'MCA', 'MBA', 'Other']
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']
const ROLES = ['student', 'admin']
const STATUSES = ['Active', 'Inactive', 'Blocked']

const SALT_ROUNDS = 10

/**
 * User schema for the FIFA World Cup Prediction Platform.
 * Collection: users
 */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true,
      minlength: [3, 'Full Name must be at least 3 characters'],
      maxlength: [100, 'Full Name cannot exceed 100 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll Number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: {
        values: DEPARTMENTS,
        message: 'Department must be a valid department code',
      },
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: {
        values: SEMESTERS,
        message: 'Semester must be S1 through S8',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: 'Role must be student or admin',
      },
      default: 'student',
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Status must be Active, Inactive, or Blocked',
      },
      default: 'Active',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    predictionsSubmitted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    correctWinnerPredictions: {
      type: Number,
      default: 0,
      min: 0,
    },
    exactScorePredictions: {
      type: Number,
      default: 0,
      min: 0,
    },
    rank: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  },
)

// Indexes for faster queries
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })

/**
 * Hash password before saving when password is new or modified.
 * Plain-text passwords are never stored in the database.
 */
userSchema.pre('save', async function hashPasswordBeforeSave() {
  if (!this.isModified('password')) {
    return
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
})

/**
 * Compare a plain-text password with the stored bcrypt hash.
 *
 * @param {string} candidatePassword - Password entered by the user
 * @returns {Promise<boolean>} True when passwords match
 */
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

/**
 * Generate a signed JWT for the authenticated user.
 * Payload includes userId, rollNumber, and role.
 *
 * @returns {string} Signed JWT valid for 7 days
 */
userSchema.methods.generateToken = function generateToken() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the .env file.')
  }

  return jwt.sign(
    {
      userId: this._id,
      rollNumber: this.rollNumber,
      role: this.role,
    },
    secret,
    { expiresIn: '7d' },
  )
}

/**
 * Remove sensitive fields from JSON responses.
 */
userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject()
  delete user.password
  delete user.__v
  return user
}

const User = mongoose.model('User', userSchema)

export default User
