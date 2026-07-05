import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
app.use(cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
}));
app.use(express.json());
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'FIFA auth API is running.' });
});
app.use('/api/auth', authRoutes);
async function start() {
    await connectDatabase();
    app.listen(PORT, () => {
        console.log(`Auth server running on http://localhost:${PORT}`);
    });
}
start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
