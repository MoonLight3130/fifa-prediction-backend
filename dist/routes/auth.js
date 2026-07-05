import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User, toPublicUser } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { normalizeRollNumber, validateLoginInput, validateRegisterInput, validateUpdateProfileInput, } from '../utils/validation.js';
import { requireAuth, signToken } from '../middleware/auth.js';
const router = Router();
/**
 * POST /api/auth/register
 * Creates a new user account in MongoDB Atlas.
 */
router.post('/register', async (req, res) => {
    try {
        const error = validateRegisterInput(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error });
            return;
        }
        const fullName = String(req.body.fullName).trim();
        const rollNumber = normalizeRollNumber(String(req.body.rollNumber));
        const department = String(req.body.department).trim();
        const semester = String(req.body.semester).trim();
        const password = String(req.body.password);
        const existing = await User.findOne({ rollNumber });
        if (existing) {
            res.status(409).json({ success: false, message: 'Roll Number already registered.' });
            return;
        }
        const passwordHash = await hashPassword(password);
        await User.create({
            userId: uuidv4(),
            fullName,
            rollNumber,
            department,
            semester,
            passwordHash,
            status: 'Active',
        });
        res.status(201).json({ success: true, message: 'Registration successful.' });
    }
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});
/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token.
 */
router.post('/login', async (req, res) => {
    try {
        const error = validateLoginInput(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error });
            return;
        }
        const rollNumber = normalizeRollNumber(String(req.body.rollNumber));
        const password = String(req.body.password);
        const user = await User.findOne({ rollNumber });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid Roll Number or Password.' });
            return;
        }
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ success: false, message: 'Invalid Roll Number or Password.' });
            return;
        }
        if (user.status.toLowerCase() !== 'active') {
            res.status(403).json({ success: false, message: 'This account is not active.' });
            return;
        }
        user.lastLogin = new Date();
        await user.save();
        const token = signToken({ userId: user.userId, rollNumber: user.rollNumber });
        res.json({
            success: true,
            token,
            user: toPublicUser(user),
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});
/**
 * GET /api/auth/me
 * Returns the currently authenticated user from JWT.
 */
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.auth.userId });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.json({ success: true, user: toPublicUser(user) });
    }
    catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching user.' });
    }
});
/**
 * GET /api/auth/user?rollNumber=MEK23CS024
 * Public lookup by roll number (for compatibility).
 */
router.get('/user', async (req, res) => {
    try {
        const rollNumber = normalizeRollNumber(String(req.query.rollNumber ?? ''));
        if (!rollNumber) {
            res.status(400).json({ success: false, message: 'Roll Number is required.' });
            return;
        }
        const user = await User.findOne({ rollNumber });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.json({ success: true, user: toPublicUser(user) });
    }
    catch (err) {
        console.error('Get user by roll error:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching user.' });
    }
});
/**
 * PATCH /api/auth/profile
 * Updates allowed profile fields for the authenticated user.
 */
router.patch('/profile', requireAuth, async (req, res) => {
    try {
        const error = validateUpdateProfileInput(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error });
            return;
        }
        const user = await User.findOne({ userId: req.auth.userId });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        if (req.body.fullName !== undefined) {
            user.fullName = String(req.body.fullName).trim();
        }
        if (req.body.department !== undefined) {
            user.department = String(req.body.department).trim();
        }
        if (req.body.semester !== undefined) {
            user.semester = String(req.body.semester).trim();
        }
        if (req.body.password !== undefined) {
            user.passwordHash = await hashPassword(String(req.body.password));
        }
        await user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully.',
            user: toPublicUser(user),
        });
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Server error while updating profile.' });
    }
});
export default router;
