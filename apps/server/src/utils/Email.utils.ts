import formData from "form-data"
import Mailgun from "mailgun.js";
interface EmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string; // Plain text fallback
}


export async function sendMailViaMailgun(params: EmailParams): Promise<void> {
    try {
       const apiKey = process.env.MAILGUN_API_KEY;
       const domain = process.env.MAILGUN_SANDBOX_DOMAIN;
       const mailgun = new Mailgun(formData);

       if (!apiKey || !domain) {
           throw new Error('Missing environment variables: apikey and domain');
       }

       const mg = mailgun.client({ username: 'api', key: apiKey });

       await mg.messages.create(domain, {
           from: process.env.EMAIL_FROM || 'no-reply@mintd.uk',
           to: params.to,
           subject: params.subject,
           text: params.text,
           html: params.html,
       });
        console.log(`[Email] sent to ${params.to} successfully`)
  
    } catch (error) {
        console.error(`[Email] failed to send:`, error)
        throw new Error("Failed to send email")
    }
   

}

// email templates
export function generateVerificationEmail(userFName: string, token: string): {subject: string, html: string, text: string} {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`


    return {
        subject: 'Verify your Mintd account',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Mintd, ${userFName}!</h2>
        <p>Thank you for signing up. Please verify your email address to get started.</p>
        <p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 2px;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours. If you didn't create a Mintd account, you can safely ignore this email.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          Or copy and paste this link into your browser:<br>
          ${verificationUrl}
        </p>
      </div>
    `,
        text: `
      Welcome to Mintd, ${userFName}!
      
      Thank you for signing up. Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This link will expire in 24 hours. If you didn't create a Mintd account, you can safely ignore this email.
    `,
    };

}

export function generatePasswordResetEmail(userFName: string, token: string): { subject: string, html: string, text: string } {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    return {
        subject: 'Reset your Mintd password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hi ${userFName},</p>
        <p>We received a request to reset your Mintd password. Click the button below to choose a new password:</p>
        <p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          Or copy and paste this link into your browser:<br>
          ${resetUrl}
        </p>
      </div>
    `,
        text: `
      Reset your password
      
      Hi ${userFName},
      
      We received a request to reset your Mintd password. Click the link below to choose a new password:
      
      ${resetUrl}
      
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    `,
    };
}

export  function generateResentVerificationEmail(userFName: string, token: string): { subject: string, html: string, text: string } {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`

    return {
        subject: "Verification email resent - verify your Mintd account",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verification link expired? Don't worry, we've resent it.</h2>
      <p>Hi ${userFName},</p>
      <p>It looks like your previous verification link expired. No problem! Please click the button below to verify your email address and get started with Mintd:</p>
      <p>
        <a href="${verificationUrl}" 
           style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 2px;">
          Verify Email
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 24 hours. If you didn't create a Mintd account, you can safely ignore this email.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 40px;">
        Or copy and paste this link into your browser:<br>
        ${verificationUrl}
      </p>
    </div>
    `,
        text: `
      Verification link expired? Don't worry, we've resent it.
      
      Hi ${userFName}!
      
      It looks like your previous verification link expired. No problem! Please click the link below to verify your email address and get started with Mintd:
      
      ${verificationUrl}
      
      This link will expire in 24 hours. If you didn't create a Mintd account, you can safely ignore this email.
    `,
    }
}