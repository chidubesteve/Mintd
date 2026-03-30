// src/utils/otp.ts
import crypto from 'crypto';

// Generates a cryptographically random 6-digit code
export function generateOTP(): string {
    // crypto.randomInt is safer than Math.random() — uniform distribution
    return crypto.randomInt(100000, 999999).toString();
}

// We hash before storing so even if DB is breached, codes are useless
export function hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

export function verifyOTP(rawInput: string, storedHash: string): boolean {
    return hashOTP(rawInput) === storedHash;
}
