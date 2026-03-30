import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';
import { PasswordResetEmail } from './emails/PasswordReset';
import  { VerifyEmail } from "./emails/VerifyEmail";
import { ResendVerificationEmail } from './emails/resendVerification';
interface EmailParams {
    to: string;
    subject: string;
    react: React.ReactElement;
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'hello@mintd.uk';
export async function sendMail(params: EmailParams): Promise<void> {
    try {
        const { error, data } = await resend.emails.send({
            from: FROM,
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

export  async function sendPasswordResetEmail(
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
  } catch (error) {
    
  }
}
