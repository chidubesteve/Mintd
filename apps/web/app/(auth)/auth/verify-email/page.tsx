'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/Auth.store';
import {
    useResendVerification,
    useVerifyEmail,
} from '@/hooks/mutations/useAuthMutations';
import { AxiosError } from 'axios';
import iconDark from '@/public/logo-mixed.webp';
import iconLight from '@/public/logo-mixed-green.webp';
import { toast } from 'sonner';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
    const { resolvedTheme } = useTheme();
    const iconSrc = resolvedTheme === 'light' ? iconDark : iconLight;
    const router = useRouter();
    const searchParams = useSearchParams();
    const source = searchParams.get('source') as 'login' | 'signup' | null;
    const pendingEmail = useAuthStore((s) => s.pendingEmail);
    const userEmail = pendingEmail;
    const { mutate: resend, isPending: isResending } = useResendVerification();
    const {
        mutate: verifyEmailOtp,
        isPending: verifying,
        isError,
        reset: resetVerify,
        error,
    } = useVerifyEmail();

    const [cooldown, setCooldown] = useState(() =>
        // If coming from login, we already sent a code, so start with cooldown active.
        source === 'login' ? COOLDOWN_SECONDS : 0,
    );
    const [otp, setOtp] = useState('');
    const hasSubmittedRef = useRef(false); // to prevent multiple auto-submissions after clearPendingEmail() nulls the userEmail
    //extract the server error message
    const errorMessage = isError
        ? ((error as AxiosError<{ message?: string }>)?.response?.data
              ?.message ?? 'Something went wrong. Please try again.')
        : null;

    // Tick down every second while cooldown is active
    useEffect(() => {
        if (cooldown <= 0) return;
        const id = setInterval(() => {
            setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(id);
    }, [cooldown]);

    // Token verification - auto submit when all 6 digits are entered in the input
    useEffect(() => {
        if (otp.length !== 6 && verifying && hasSubmittedRef.current) return;
        if (!userEmail) {
            toast.error('Session expired. Please sign in again.');
            router.push('/auth/login');
            return;
        }
        hasSubmittedRef.current = true;
        verifyEmailOtp(
            { email: userEmail, otp },
            {
                onError: () => {
                    hasSubmittedRef.current = false;
                    setOtp('');
                },
            },
        );
    }, [otp, verifyEmailOtp, userEmail, router, verifying]);
    const handleOtpChange = (value: string) => {
        // Clear previous error state as soon as they start typing again
        if (isError) resetVerify();
        setOtp(value);
    };

    const handleResend = useCallback(() => {
        if (cooldown > 0 || isResending || !userEmail) return;
        resend(userEmail, { onSuccess: () => setCooldown(COOLDOWN_SECONDS) });
    }, [cooldown, isResending, userEmail, resend]);

    const heading =
        source === 'login'
            ? 'Verify your email to continue'
            : 'Check your email';
    const subtext =
        source === 'login'
            ? "Your account hasn't been verified yet. We've sent a fresh code to"
            : 'Enter the 6-digit code we sent to';

    return (
        <div className='min-h-screen flex items-center justify-center bg-muted/30 p-6'>
            <div className='w-full max-w-sm'>
                <div className='bg-card rounded-2xl p-8 shadow-luxury border border-border space-y-6'>
                    <div className='text-center'>
                        <Link href='/'>
                            <Image
                                src={iconSrc}
                                alt='Mintd'
                                className='h-10 mx-auto mb-6 w-auto'
                            />
                        </Link>
                        <h1 className='text-xl font-bold text-foreground mb-2'>
                            {heading}
                        </h1>
                        <p className='text-sm text-muted-foreground'>
                            {subtext}{' '}
                            <span className='font-medium text-foreground'>
                                {userEmail || 'your email address'}
                            </span>
                        </p>
                    </div>

                    {/* OTP Input */}
                    <div className='flex flex-col items-center gap-3'>
                        <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={handleOtpChange}
                            disabled={verifying}
                        >
                            <InputOTPGroup>
                                {[0, 1, 2].map((index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        className={
                                            isError ? 'border-destructive' : ''
                                        }
                                    />
                                ))}
                            </InputOTPGroup>

                            <InputOTPSeparator className='text-muted-foreground' />
                            <InputOTPGroup>
                                {[3, 4, 5].map((index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        className={
                                            isError ? 'border-destructive' : ''
                                        }
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>

                        {/* Inline status — fixed height so layout doesn't jump */}
                        <div className='h-5 flex items-center justify-center'>
                            {verifying && (
                                <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                                    <Loader2 className='w-3 h-3 animate-spin' />
                                    Verifying…
                                </span>
                            )}
                            {errorMessage && !verifying && (
                                <span className='text-xs text-destructive'>
                                    {errorMessage}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-3'>
                        <Button
                            variant='outline'
                            className='flex-1 h-11'
                            onClick={handleResend}
                            disabled={isResending || cooldown > 0}
                        >
                            {isResending ? (
                                <Loader2 className='w-4 h-4 animate-spin mr-2' />
                            ) : (
                                <RefreshCw className='w-4 h-4 mr-2' />
                            )}
                            {cooldown > 0
                                ? `Resend (${cooldown}s)`
                                : 'Resend code'}
                        </Button>

                        <Button
                            variant='outline'
                            className='flex-1 h-11'
                            onClick={() => router.push('/auth/register')}
                        >
                            Update email
                        </Button>
                    </div>

                    <p className='text-xs text-muted-foreground text-center'>
                        Can&apos;t find it? Check your spam folder.
                    </p>
                </div>

                <p className='text-center text-sm text-muted-foreground mt-6'>
                    <Link
                        href='/auth/login'
                        className='text-accent hover:underline font-medium'
                    >
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
