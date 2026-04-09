import express from 'express'
import cors from 'cors'
import path from 'path'
import { existsSync } from 'fs'
import tokenRoutes from './routes/tokens'
import responseRoutes from './routes/responses'
import stateRoutes from './routes/state'
import authRoutes from './routes/auth'
import sideQuestRoutes from './routes/sidequests'
import adminRoutes from './routes/admin'
import demoRoutes from './routes/demo'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// ── API routes ─────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/tokens', tokenRoutes)
app.use('/api/responses', responseRoutes)
app.use('/api/state', stateRoutes)
app.use('/api/sidequests', sideQuestRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/demo', demoRoutes)

// ── Static client (production Docker build) ────────────────────────────────────
// The Dockerfile copies client/dist → /app/public
const publicDir = path.join(__dirname, '..', 'public')
if (existsSync(publicDir)) {
  app.use(express.static(publicDir))
  // SPA fallback — let React Router handle all non-API paths
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
