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
    hashCryptoToken,
    hashPassword,
    verifyRefreshToken,
} from '../utils/Auth.utils';
import {
    sendPasswordResetEmail,
    sendResentVerificationEmail,
    sendVerificationEmail,
} from '../utils/Email.utils';
import { generateOTP, hashOTP, verifyOTP } from '../utils/otp.utils';
import { Kyc } from '../models/Kyc.model';
import { PasswordReset } from '../models/PasswordReset.model';

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
            return res
                .status(409)
                .json({ message: 'An account with this email already exists' });
        }

        // hash password
        const hashedPassword = await hashPassword(password);
        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const collector = await Collector.create({
            fName,
            lName,
            email,
            passwordHash: hashedPassword, // other fields are field in with the defaults for now
            emailVerificationCode: otpHash,
            emailVerificationCodeExpiry: otpExpiry,
        });
        console.log('collector', collector);

        // send verification email, fire-and-forget: a delivery failure must not
        // block account creation or redirect the user away from verify screen
        await sendVerificationEmail(
            collector.email,
            otp,
            collector.fName,
        ).catch((err) =>
            console.error(
                '[sendVerificationEmail] Error sending verification email:',
                err,
            ),
        );

        // TODO: Create custodial wallet here and update collector.walletId
        // don't generate and issue token immidiately after registartation do it after verifying email because we want to make sure the email is valid before allowing them to log in and access protected routes. we can generate and issue tokens after email verification in the verifyEmailHandler function.
        // generate tokens

        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: collector.id,
                email: collector.email,
                role: 'COLLECTOR',
                kycStatus: collector.kycStatus,
                emailVerified: collector.emailVerified,
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

        // check if email is verified
        if (!user.emailVerified) {
            res.status(401).json({
                message: 'Email is not verified, navigating to verify page',
                code: 'EMAIL_NOT_VERIFIED',
                email: user.email,
            });

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
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
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
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken,
            user,
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
    const clearOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
    };
    res.clearCookie('refreshToken', { ...clearOpts, path: '/' });
    // login/verify-email used to set this cookie with no explicit path,
    // which browsers default to the request's own directory (/auth) rather
    // than '/'. Clearing with no path here resolves to that same /auth
    // default for a POST to /auth/logout, so this also catches any
    // leftover cookie from before path:'/' was added to those two places.
    res.clearCookie('refreshToken', clearOpts);
    res.status(200).json({ message: 'Logout successful' });
}

/**
 * @function forgotPasswordHandler
 * @description Public endpoint. Accepts an email, generates a password reset
 * token, saves the HASH to the DB, and emails the RAW token to the user.
 */

export async function forgotPasswordHandler(
    req: Request,
    res: Response,
): Promise<void> {
    const { email } = req.body ?? {};

    if (typeof email !== 'string' || !email.trim() || email.length > 254) {
        res.status(400).json({ message: 'A valid email is required' });
        return;
    }

    const genericResponse = {
        message:
            "If an account exists with this email, you'll receive a password reset link shortly",
    };

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            res.status(200).json(genericResponse);
            return;
        }

        const frontendUrl = process.env.FRONTEND_URL?.split(',')[0].trim();

        if (!frontendUrl) {
            throw new Error('FRONTEND_URL is not configured');
        }
        // generate token, raw goes in email. hash goes in DB
        // send email with password reset link
        const rawToken = generateCryptoToken();
        const tokenHash = hashCryptoToken(rawToken);

        const resetUrl = new URL('/auth/reset-password', frontendUrl);
        resetUrl.searchParams.set('token', rawToken);

        // Replace any previous reset link for this user.
        await PasswordReset.updateOne(
            { user: user._id },
            {
                $set: {
                    tokenHash,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                },
            },
            { upsert: true, runValidators: true },
        );

        try {
            await sendPasswordResetEmail(
                user.fName,
                user.email,
                resetUrl.toString(),
            );
        } catch {
            await PasswordReset.deleteOne({ user: user._id, tokenHash });
            console.error('Password reset email delivery failed');
        }

        // keep the response generic  for existing and missing accounts
        res.status(200).json(genericResponse);
    } catch (error) {
        res.status(503).json({
            message: 'Could not request a reset link. Please try again.',
            code: 'EMAIL_SEND_FAILED',
        });
    }
}
/**
 * @function verifyEmailHandler
 * @description Accepts a 6-digit OTP from the user, hashes it,
 * compares against the stored hash, and marks email as verified.
 */
export async function verifyEmailHandler(req: Request, res: Response) {
    try {
        const { email, otp } = req.body; // this will be the raw otp. email would also be like from the previous endpoint from the after the signup or from the auth store in zustand state
        if (!otp || !email) {
            res.status(400).json({
                message: 'Verification OTP and email are required',
            });
            return;
        }

        // find the user
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        }).select('+emailVerificationCode +emailVerificationCodeExpiry');
        if (!user) {
            res.status(400).json({
                message: 'Invalid verification code',
                code: 'INVALID_CODE',
            });
            return;
        }

        if (
            !user.emailVerificationCodeExpiry ||
            user.emailVerificationCodeExpiry < new Date()
        ) {
            res.status(400).json({
                message:
                    'Verification code has expired, please request a new one',
                code: 'EXPIRED_CODE',
            });
            return;
        }
        // hash the incoming otp and compare with the stored hash
        const isValid = verifyOTP(otp, user.emailVerificationCode!);
        if (!isValid) {
            res.status(400).json({
                message: 'Invalid verification code',
                code: 'INVALID_CODE',
            });
            return;
        }

        // CHECK IF ALREADY VERIFIED
        if (user.emailVerified) {
            res.status(400).json({ message: 'Email is already verified' });
            return; // if not, would fall through to the update
        }
        // update user's email verification status and delete the token and expiry
        // it is better to use $unset operator to remove the token and expiry fields from the document rather than setting them to null. because $unset will remove the fields from the document entirely, which can help prevent confusion and potential bugs down the line when checking for the existence of these fields and save space in the database.
        await User.findByIdAndUpdate(
            user.id,
            {
                emailVerified: true,
                $unset: {
                    emailVerificationCode: 1,
                    emailVerificationCodeExpiry: 1,
                },
            },
            { returnDocument: 'after' },
        );
        // generate token pair after successful verification. now they gain access to protected routes immediately after verifying their email without needing to log in again because we set the auth state in the frontend after this mutation succeeds
        const { accessToken, refreshToken } = generateTokenPair({
            userId: user.id,
            role: user.role as UserRole,
            email: user.email,
        });
        // set refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });
        // we need to send the access token back to the user
        res.status(200).json({
            message: 'Email verified successfully',
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                emailVerified: true,
                fName: user.fName,
                lName: user.lName,
            },
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            message: 'Internal server error',
            code: 'SERVER_ERROR',
        });
    }
}

/**
 * @function resetPasswordHandler
 * @description Public endpoint. Validates the reset token (from the email link),
 * updates the password, and invalidates the token so it can't be reused.
 *
 * Flow:
 *  1. User clicks link: /reset-password?token=<rawToken>
 *  2. Frontend POSTs { token, newPassword } to this endpoint
 *  3. We hash the token, find the user, check expiry, update password
 */
export async function resetPasswordHandler(req: Request, res: Response) {
    // get the email for the user object when called from inside the app - by an authenticated user
    const { token, newPassword } = req.body ?? {};

    if (
        typeof token !== 'string' ||
        !/^[a-f0-9]{64}$/.test(token)
        
    ) {
        res.status(400).json({
            message: 'Invalid or expired reset link',
            code: 'INVALID_TOKEN',
        });

        return;
    }

    if (
        typeof newPassword !== 'string' ||
        newPassword.length < 8 ||
        newPassword.length > 32
    ) {
        res.status(400).json({
            message: 'Password must be between 8 and 32 characters',
            code: 'INVALID_PASSWORD',
        });
        return;
    }

    try {
        // hash the incomning token
        const tokenHash = hashCryptoToken(token);

        // TTL cleanup may be delayed, so explicitly check expiry.
        const exists = await PasswordReset.exists({
            tokenHash,
            expiresAt: { $gt: new Date() },
        });

        if (!exists) {
            res.status(400).json({
                message: 'Invalid or expired reset link',
                code: 'INVALID_TOKEN',
            });
            return;
        }

        const passwordHash = await hashPassword(newPassword);

        // Recheck expiry after hashing.
        // Find-and-delete consumes the token atomically:
        // only one concurrent request can receive this record.

        const reset = await PasswordReset.findOneAndDelete({
            tokenHash,
            expiresAt: { $gt: new Date() },
        });

        if (!reset) {
            res.status(400).json({
                message: 'Invalid or expired reset link',
                code: 'INVALID_TOKEN',
            });
            return;
        }

        const result = await User.updateOne(
            { _id: reset.user },
            { $set: { passwordHash } },
            { runValidators: true },
        );

        if (result.matchedCount !== 1) {
            res.status(400).json({
                message: 'Invalid or expired reset link',
                code: 'INVALID_TOKEN',
            });
            return;
        }

        res.status(200).json({
            message:
                'Password reset successfully. Please sign in.',
        });
    } catch {
        console.error('Password reset failed');

        res.status(503).json({
            message:
                'Could not reset your password. Please request a new link.',
        });


    } 
}
/**
 * @function resendVerificationCodeHandler
 * @description Generates a fresh OTP, saves the hash to the DB,
 * and emails the raw code to the user.
 */
export async function resendVerificationCodeHandler(
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
                message:
                    'If an account exists with this email, a verification code has been sent',
            });
            return;
        }

        if (user.emailVerified) {
            res.status(200).json({ message: 'Email is already verified' });
            return;
        }

        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // save hashed token and expiry to user document
        user.emailVerificationCode = otpHash;
        user.emailVerificationCodeExpiry = otpExpiry;

        await user.save();

        // send verification email

        await sendResentVerificationEmail(user.fName, user.email, otp).catch(
            (err) =>
                console.error(
                    '[resendVerificationCodeHandler] email send failed:',
                    err.message,
                ),
        );
        res.status(200).json({
            message: 'Verification code sent successfully',
        });
    } catch (error) {
        console.error('Resend verification code error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
