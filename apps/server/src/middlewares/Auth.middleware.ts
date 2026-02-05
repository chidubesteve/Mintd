import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/Auth.utils';


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
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({
            message: 'Missing or invalid authorization header',
        });
    }

    const token = header!.split(' ')[1];

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
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