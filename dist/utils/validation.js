const MIN_PASSWORD_LENGTH = 6;
const MIN_FULL_NAME_LENGTH = 3;
/**
 * Normalizes roll numbers to uppercase trimmed strings.
 */
export function normalizeRollNumber(rollNumber) {
    return rollNumber.trim().toUpperCase();
}
/**
 * Validates registration payload fields.
 */
export function validateRegisterInput(data) {
    const fullName = String(data.fullName ?? '').trim();
    const rollNumber = normalizeRollNumber(String(data.rollNumber ?? ''));
    const department = String(data.department ?? '').trim();
    const semester = String(data.semester ?? '').trim();
    const password = String(data.password ?? '');
    if (!fullName)
        return 'Full Name is required.';
    if (fullName.length < MIN_FULL_NAME_LENGTH)
        return 'Full Name must be at least 3 characters.';
    if (!rollNumber)
        return 'Roll Number is required.';
    if (!department)
        return 'Department is required.';
    if (!semester)
        return 'Semester is required.';
    if (!password)
        return 'Password is required.';
    if (password.length < MIN_PASSWORD_LENGTH)
        return 'Password must be at least 6 characters.';
    return null;
}
/**
 * Validates login payload fields.
 */
export function validateLoginInput(data) {
    if (!normalizeRollNumber(String(data.rollNumber ?? '')))
        return 'Roll Number is required.';
    if (!String(data.password ?? ''))
        return 'Password is required.';
    return null;
}
/**
 * Validates profile update payload fields.
 */
export function validateUpdateProfileInput(data) {
    if (!normalizeRollNumber(String(data.rollNumber ?? '')))
        return 'Roll Number is required.';
    const hasField = data.fullName !== undefined ||
        data.department !== undefined ||
        data.semester !== undefined ||
        data.password !== undefined;
    if (!hasField)
        return 'At least one profile field must be provided for update.';
    if (data.fullName !== undefined) {
        const fullName = String(data.fullName).trim();
        if (!fullName)
            return 'Full Name cannot be empty.';
        if (fullName.length < MIN_FULL_NAME_LENGTH)
            return 'Full Name must be at least 3 characters.';
    }
    if (data.department !== undefined && !String(data.department).trim()) {
        return 'Department cannot be empty.';
    }
    if (data.semester !== undefined && !String(data.semester).trim()) {
        return 'Semester cannot be empty.';
    }
    if (data.password !== undefined) {
        const password = String(data.password);
        if (!password)
            return 'Password cannot be empty.';
        if (password.length < MIN_PASSWORD_LENGTH)
            return 'Password must be at least 6 characters.';
    }
    return null;
}
