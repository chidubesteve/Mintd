import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';
import { PasswordResetEmail } from './emails/PasswordReset';
import { VerifyEmail } from './emails/VerifyEmail';
import { ResendVerificationEmail } from './emails/resendVerification';
import { NewPendingReviewWatch } from './emails/NewPendingReviewWatch';
interface EmailParams {
    to: string;
    subject: string;
    react: React.ReactElement;
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'hello@mintd.uk';
export async function sendMail(params: EmailParams): Promise<void> {
    try {
        const cleanFromAddress = FROM.includes('<') ? FROM : `Mintd <${FROM}>`;

        const { error, data } = await resend.emails.send({
            from: cleanFromAddress,
            to: params.to,
            subject: params.subject,
            react: params.react,
        });

        if (error) {
            throw new Error(error.message);
        }

        console.log('[Email] sent:', data);
    } catch (error) {
        console.error('[Email] failed:', error);
        throw error;
    }
}

// email templates
export async function sendVerificationEmail(
    to: string,
    otp: string,
    userFName: string,
): Promise<void> {
    await sendMail({
        to,
        subject: 'Mintd - Verify your email',
        react: VerifyEmail({ userFName, otp }),
    });
}

export async function sendPasswordResetEmail(
    userFName: string,
    to: string,
    resetUrl: string,
): Promise<void> {
    try {
        await sendMail({
            to,
            subject: 'Mintd - Reset your password',
            react: PasswordResetEmail({ userFName, resetUrl }),
        });
    } catch (error) {
        console.error('[Email] failed:', error);
        throw error;
    }
}

export async function sendResentVerificationEmail(
    userFName: string,
    to: string,
    otp: string,
): Promise<void> {
    try {
        await sendMail({
            to,
            subject: 'Your new Mintd verification code',
            react: ResendVerificationEmail({ userFName, otp }),
        });
    } catch (error) {}
}

// Notifies the admin when a watch registration needs manual review (custom
// brand, or brand/model/reference not found in our catalogue). Failure here
// should never block registration itself, so callers should treat this as
// best-effort and not let it fail the request.
export async function sendNewPendingReviewEmail(params: {
    ownerEmail: string;
    brand: string;
    model: string;
    reference?: string;
    assetId: string;
    reason: string;
}): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.error('[Email] ADMIN_EMAIL not set, skipping pending-review notification');
        return;
    }
    await sendMail({
        to: adminEmail,
        subject: `New watch pending review: ${params.brand} ${params.model}`,
        react: NewPendingReviewWatch(params),
    });
}
