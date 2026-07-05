import jwt from 'jsonwebtoken';
/**
 * Signs a JWT for an authenticated user session.
 */
export function signToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not configured.');
    return jwt.sign(payload, secret, { expiresIn: '7d' });
}
/**
 * Verifies a JWT and returns the decoded payload.
 */
export function verifyToken(token) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not configured.');
    return jwt.verify(token, secret);
}
/**
 * Express middleware that requires a valid Bearer token.
 */
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
    }
    try {
        const token = header.slice(7);
        req.auth = verifyToken(token);
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
}
