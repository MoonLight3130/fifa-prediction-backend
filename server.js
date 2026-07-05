import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { connectDatabase } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import matchRoutes from './routes/matchRoutes.js'
import predictionRoutes from './routes/predictionRoutes.js'
import announcementRoutes from './routes/announcementRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import statsRoutes from './routes/statsRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

// ─── CORS ────────────────────────────────────────────────────────────────────
// Support multiple comma-separated origins e.g. "https://app.vercel.app,https://www.app.com"
const rawOrigins = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Render health checks, mobile apps)
      if (!origin) return callback(null, true)
      
      // Auto-allow any localhost port in development
      if (NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`CORS: origin '${origin}' not allowed`))
    },
    credentials: true,
  }),
)

// ─── Security & Utilities ────────────────────────────────────────────────────
app.use(helmet())

// Gzip compression — reduces response sizes by ~70%
app.use(compression())

// HTTP request logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(express.json({ limit: '1mb' }))

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FIFA Prediction API is running.',
    env: NODE_ENV,
  })
})

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/predictions', predictionRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/stats', statsRoutes)

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  })
})

// ─── Global Error Handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (NODE_ENV !== 'production') {
    console.error('Server error:', err.stack)
  } else {
    console.error('Server error:', err.message)
  }

  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message })
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Roll Number already registered.',
    })
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
  })
})

// ─── Start ───────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDatabase()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${NODE_ENV}]`)
    })
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error.message)
    process.exit(1)
  }
}

startServer()
