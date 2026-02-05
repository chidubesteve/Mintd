import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface TokenPayload {
    userId: string;
    role: 'COLLECTOR' | 'ADMIN';
    email: string;
}

const SALT_ROUNDS = 12;

/**
 *
 * @param plaintext password to be hashed
 * @returns
 */
export async function hashPassword(plaintext: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(plaintext, salt);
}

export async function comparePassword(
    plaintext: string,
    hash: string,
): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
}


function getAccessSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
    return secret;
}

function getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
    return secret;
}

export function generateTokenPair(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(payload, getAccessSecret(), {
        expiresIn: '15m',
    });
    const refreshToken = jwt.sign(payload, getRefreshSecret(), {
        expiresIn: '7d',
    });
    return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, getAccessSecret()) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, getRefreshSecret()) as TokenPayload;
}