import { randomUUID } from 'crypto';
import type { CookieOptions, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import { AuthSession } from '../models/AuthSession.model';
import type {
    BaseUserType,
    CollectorType,
    UserRole,
} from '../models/User.model';
import {
    generateTokenPair,
    getTokenExpirationDate,
    hashCryptoToken,
} from '../utils/Auth.utils';

type UserDocument = HydratedDocument<BaseUserType>;

function cookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    };
}

export function setRefreshCookie(res: Response, token: string): void {
    res.set('Cache-Control', 'no-store');
    res.cookie('refreshToken', token, {
        ...cookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export function clearRefreshCookie(res: Response): void {
    res.set('Cache-Control', 'no-store');
    res.clearCookie('refreshToken', cookieOptions());
}

export function publicUser(user: UserDocument) {
    return {
        id: user.id,
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        role: user.role as UserRole,
        emailVerified: user.emailVerified,
        ...(user.role === 'COLLECTOR'
            ? { kycStatus: user.get('kycStatus') as CollectorType['kycStatus'] }
            : {}),
    };
}

export async function createLoginSession(user: UserDocument) {
    const sessionId = randomUUID();

    const tokens = generateTokenPair({
        userId: user.id,
        role: user.role as UserRole,
        email: user.email,
        sessionId,
        authVersion: user.authVersion ?? 0,
    });

    // Persist before returning credentials to the browser.
    await AuthSession.create({
        _id: sessionId,
        user: user._id,
        refreshHash: hashCryptoToken(tokens.refreshToken),
        expiresAt: getTokenExpirationDate(tokens.refreshToken),
    });

    return tokens;
}
