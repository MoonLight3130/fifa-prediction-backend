import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    lastLogin: { type: Date, default: null },
    status: { type: String, default: 'Active' },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
userSchema.index({ rollNumber: 1 });
export const User = mongoose.model('User', userSchema);
/**
 * Returns a safe user object without sensitive fields.
 */
export function toPublicUser(user) {
    return {
        userId: user.userId,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        department: user.department,
        semester: user.semester,
        status: user.status,
    };
}
