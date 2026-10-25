import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/Auth.utils';
import jwt from 'jsonwebtoken';
import { AuthSession } from '../models/AuthSession.model';
import { User } from '../models/User.model';

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

/**
 * @function authMiddleware
 * @description Middleware to check if the user is authenticated
 * @param req 
 * @param res 
 * @param next 
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({
            message: 'Missing or invalid authorization header',
        });
        return;
    }

    try {
        const payload = verifyAccessToken(header.slice(7));

        const [session, user] = await Promise.all([
            AuthSession.exists({
                _id: payload.sessionId,
                user: payload.userId,
                expiresAt: { $gt: new Date() },
            }),
            User.findById(payload.userId).select(
                'email role emailVerified authVersion',
            ),
        ]);

        if (
            !session ||
            !user ||
            !user.emailVerified ||
            (user.authVersion ?? 0) !== payload.authVersion
        ) {
            throw new jwt.JsonWebTokenError('Revoked login');
        }

        req.user = {
            ...payload,
            // Use the current role rather than a potentially older JWT role.
            role: user.role as TokenPayload['role'],
            email: user.email,
        };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid or expired session' });
            return;
        }

        res.status(503).json({
            message: 'Could not validate your session. Please try again.',
        });
        return;
    }

    next();
}


export  function requireRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }


    }
}