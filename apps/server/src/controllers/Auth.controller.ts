import { Request, Response } from 'express';
import {
    BaseUserType,
    Collector,
    CollectorType,
    User,
    UserRole,
} from '../models/User.model';
import {
    comparePassword,
    generateCryptoToken,
    generateTokenPair,
    getTokenExpirationDate,
    hashCryptoToken,
    hashPassword,
    verifyRefreshToken,
} from '../utils/Auth.utils';
import { generateResentVerificationEmail, generateVerificationEmail, sendMailViaMailgun } from '../utils/Email.utils';

export const getAppUrl = () => {
    return process.env.NODE_ENV === 'production'
        ? process.env.APP_URL
        : `http://localhost:${process.env.PORT}`;
};

/**
 * @file Auth controller - this is where we handle everything user authentication related
 */
/**
 * @function signup - create a new user -
 * @param req express request - req.body - username, email, password
 * @param res express response
 * @public
 * @returns 201 - created user object
 * @desciption public endpoint that Creates a Collector account and a custodial wallet. Wallet creation is a separate service call — we'll wire that in once
 the wallet service exists. For now, the user is created and the wallet step is a TODO in the flow.
 */
export async function signupHandler(req: Request, res: Response) {
    try {
        const { fName, lName, email, password } = req.body;
        if (!fName || !lName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (8 > password.length || password.length > 32) {
            return res
                .status(400)
                .json({
                    message: 'Password must be between 8 and 32 characters',
                });
        }

        // check if user already exists
        // we check the base user model and not the collector model. because email uniqueness is across all user types
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists' });
        }

        // hash password
        const hashedPassword = await hashPassword(password);

        const collector = await Collector.create({
            fName,
            lName,
            email,
            passwordHash: hashedPassword, // other fields are field in with the defaults for now
        });
        console.log('collector', collector);

        // send verification email

        // generate token
        const rawToken = generateCryptoToken();
        const hashedToken = hashCryptoToken(rawToken);
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // save hashed token and expiry to user document
        collector.emailVerificationToken = hashedToken;
        collector.emailVerificationTokenExpiry = tokenExpiry;
        await collector.save();

        // send email with rawToken
        const { subject, html, text } = generateVerificationEmail(
            collector.fName,
            rawToken,
        );
        await sendMailViaMailgun({
            to: collector.email,
            subject,
            html,
            text,
        });

        // TODO: Create custodial wallet here and update collector.walletId

        // generate tokens
        const { accessToken, refreshToken } = generateTokenPair({
            userId: collector.id,
            role: 'COLLECTOR',
            email: collector.email,
        });

        // sent response
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            message: 'Account created successfully',
            accessToken,
            user: {
                id: collector.id,
                email: collector.email,
                role: 'COLLECTOR',
                kycStatus: collector.kycStatus,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * @function login - user login works for both Collectors and Admins
 * @param req
 * @param res
 * @public
 * @returns
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const passwordMatch = await comparePassword(
            password,
            user.passwordHash,
        );
        if (!passwordMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // generate tokens
        const { accessToken, refreshToken } = generateTokenPair({
            userId: user.id,
            role: user.role as UserRole,
            email: user.email,
        });

        // token rotation - reissue refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Return role-appropriate user shape.
        // Collectors get their kycStatus — they need it to know whether
        // they can proceed to watch registration.
        // Admins just get the basics.
        const userData =
            user.role === 'COLLECTOR'
                ? {
                      id: user.id,
                      fName: user.fName,
                      lName: user.lName,
                      email: user.email,
                      role: user.role,
                      kycStatus: (user as unknown as CollectorType).kycStatus,
                  }
                : {
                      id: user._id.toString(),
                      fName: user.fName,
                      lName: user.lName,
                      email: user.email,
                      role: user.role,
                  };

        res.status(200).json({
            message: 'Login successful',
            accessToken,
            user: userData,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function RefreshToken(req: Request, res: Response): Promise<void> {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token not found' });
            return;
        }

        // verify refresh token
        const payload = verifyRefreshToken(refreshToken);

        // check if user exists
        const user = await User.findById(payload.userId);
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        // issue new tokens(pair)
        const { accessToken, refreshToken: newRefreshToken } =
            generateTokenPair({
                userId: user.id,
                role: user.role as UserRole,
                email: user.email,
            });

        //overwrite the cookie with the new refresh token

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken,
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
}

/**
 * @function logout
 * @description Clears the refresh token cookie.
 */
export async function logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
    });
    res.status(200).json({ message: 'Logout successful' });
}

export async function forgotPasswordHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            res.status(404).json({
                message:
                    "if an account exists with this email, we'd send you a password reset link",
            });
        }
    } catch (error) {}
}

export async function verifyEmailHandler(req: Request, res: Response) {
    try {
        const { token } = req.query; // this will be the raw token
        if (!token) {
            res.status(400).json({ message: 'Verification token is required' });
            return;
        }

        // hash the raw token
        const hashedToken = hashCryptoToken(token.toString());
        // find the user with the matching token and check if it's not expired
        const user = await User.findOne({
            emailVerificationTokenHash: hashedToken,
        }).select('+emailVerificationTokenHash +emailVerificationTokenExpiry');
        if (!user) {
            res.status(400).json({
                message: 'Invalid or expired verification token',
                code: 'INVALID_TOKEN',
            });
            return;
        }
        const tokenExpiry = getTokenExpirationDate(token.toString());
        if (tokenExpiry < new Date()) {
            res.status(400).json({
                message:
                    'Verification token has expired, please request a new one',
                code: 'EXPIRED_TOKEN',
            });
            return;
        }

        // CHECK IF ALREADY VERIFIED
        if (user.emailVerified) {
            res.status(400).json({ message: 'Email is already verified' });
        }
        // update user's email verification status and delete the token and expiry
        // it is better to use $unset operator to remove the token and expiry fields from the document rather than setting them to null. because $unset will remove the fields from the document entirely, which can help prevent confusion and potential bugs down the line when checking for the existence of these fields and save space in the database.
        await User.findByIdAndUpdate(
            user.id,
            {
                emailVerified: true,
                $unset: {
                    emailVerificationTokenHash: 1,
                    emailVerificationTokenExpiry: 1,
                },
            },
            { new: true },
        );
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function resetPasswordHandler(req: Request, res: Response) {}
/**
 * 
 * @param req 
 * @param res 
 * @returns  a promise
 * @description User's verification link expired or was lost. Generate new token and resend. Can be called by authenticated users or by email (for unverified accounts).
 */
export async function resendVerificationLinkHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            // best practice is to not reveal whether the email exists in the system or not to prevent user enumeration attacks
            res.status(200).json({
                message: "If an account exists with this email, a verification link has been sent"
            });
        } else {
                if (user && user.emailVerified) {
                    res.status(200).json({
                        message: 'Email is already verified',
                    });
                    return;
                }

                // generate new verification token
                const rawToken = generateCryptoToken();
                const hashedToken = hashCryptoToken(rawToken);
                const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now

                // save hashed token and expiry to user document
                user.emailVerificationToken = hashedToken;
                user.emailVerificationTokenExpiry = tokenExpiry;
                await user.save();

                // send verification email

                const { subject, html, text } =
                     generateResentVerificationEmail(
                        user!.fName,
                        rawToken,
                );
            await sendMailViaMailgun({
                to: user!.email,
                subject,
                html,
                text,
            });
                res.status(200).json({
                    message: 'Verification email sent successfully',
                });
        }

    
    } catch (error) {
        console.error('Resend verification link error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
