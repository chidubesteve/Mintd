import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface TokenPayload {
    userId: string;
    role: 'COLLECTOR' | 'ADMIN';
    email: string;
    sessionId: string; // Unique identifier for the session, used to invalidate tokens if needed
    authVersion: number; // Incremented when a password reset invalidates every existing login
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
    const accessToken = jwt.sign(
        { ...payload, kind: 'access' },
        getAccessSecret(),
        { algorithm: 'HS256', expiresIn: '15m', jwtid: crypto.randomUUID() },
    );

    const refreshToken = jwt.sign(
        { ...payload, kind: 'refresh' },
        getRefreshSecret(),
        { algorithm: 'HS256', expiresIn: '7d', jwtid: crypto.randomUUID() },
    );

    return { accessToken, refreshToken };
}

function verifyToken(
    token: string,
    secret: string,
    kind: 'access' | 'refresh',
): TokenPayload {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });

    if (
        typeof decoded === 'string' ||
        decoded.kind !== kind ||
        typeof decoded.userId !== 'string' ||
        !/^[a-f0-9]{24}$/i.test(decoded.userId) ||
        typeof decoded.sessionId !== 'string' ||
        decoded.sessionId.length !== 36 ||
        typeof decoded.authVersion !== 'number' ||
        !Number.isSafeInteger(decoded.authVersion) ||
        decoded.authVersion < 0 ||
        !['COLLECTOR', 'ADMIN'].includes(decoded.role) ||
        typeof decoded.email !== 'string' ||
        typeof decoded.exp !== 'number'
    ) {
        throw new jwt.JsonWebTokenError('Invalid token claims');
    }

    // Return only application claims, not exp/iat/jti.
    return {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        sessionId: decoded.sessionId,
        authVersion: decoded.authVersion,
    };
}

export function verifyAccessToken(token: string): TokenPayload {
    return verifyToken(token, getAccessSecret(), 'access');
}

export function verifyRefreshToken(token: string): TokenPayload {
    return verifyToken(token, getRefreshSecret(), 'refresh');
}

export function generateCryptoToken(): string {
    const rawToken = crypto.randomBytes(32).toString('hex'); // 64 characters
    return rawToken;
}

export function hashCryptoToken(token: string): string {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return tokenHash;
}

export function getTokenExpirationDate(token: string): Date {
    const decoded = jwt.decode(token) as { exp: number };
    if (!decoded || !decoded.exp) {
        throw new Error('Invalid token: missing exp claim');
    }
    return new Date(decoded.exp * 1000); // convert to milliseconds
}

