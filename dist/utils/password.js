import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 10;
/**
 * Hashes a plain-text password for secure storage.
 */
export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}
/**
 * Compares a plain-text password with a stored bcrypt hash.
 */
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
