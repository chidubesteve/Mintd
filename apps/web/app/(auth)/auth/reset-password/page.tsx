'use client';
import { Suspense, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import iconDark from '@/public/logo-mixed.webp';
import iconLight from '@/public/logo-mixed-green.webp';
import { AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { AxiosError } from 'axios';
import { useResetPassword } from '@/hooks/mutations/useAuthMutations';
import {
    resetPasswordFormSchema,
    type ResetPasswordFormValues,
} from './validation/schema';

const ResetPassword = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordFormSchema),
        defaultValues: { password: '', confirmPassword: '' },
        mode: 'onChange',
    });

    // Remember which token the server rejected. A different link
    // can still be used without carrying over the previous error.
    const [rejectedToken, setRejectedToken] = useState<string | null>(null);

    const reset = useResetPassword();
    const loading = reset.isPending;

    const sessionValid =
        token !== null &&
        /^[a-f0-9]{64}$/.test(token) &&
        rejectedToken !== token;

    const handleReset = (formData: ResetPasswordFormValues) => {
        if (loading || !sessionValid || !token) return;

        reset.mutate(
            { token, password: formData.password },
            {
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        const data = error.response?.data as
                            | { code?: string }
                            | undefined;

                        if (data?.code === 'INVALID_TOKEN') {
                            setRejectedToken(token);
                        }
                    }
                },
            },
        );
    };

    if (!sessionValid) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-muted/30 p-6'>
                <div className='w-full max-w-md'>
                    <div className='text-center mb-8'>
                        <Link href='/'>
                            <Image
                                src={iconLight}
                                alt='Mintd'
                                className='block h-12 mx-auto mb-6 max-w-fit dark:hidden'
                                loading='lazy'
                            />
                            <Image
                                src={iconDark}
                                alt='Mintd'
                                className='hidden h-12 mx-auto mb-6 max-w-fit dark:block'
                                loading='lazy'
                            />
                        </Link>
                        <h1 className='text-3xl font-bold text-foreground mb-2'>
                            Invalid Link
                        </h1>
                    </div>

                    <div className='bg-card rounded-2xl p-8 shadow-luxury border border-border space-y-6 text-center'>
                        <div className='w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
                            <AlertTriangle className='w-8 h-8 text-destructive' />
                        </div>
                        <div>
                            <p className='text-sm text-foreground font-medium mb-1'>
                                This reset link has expired or is invalid
                            </p>
                            <p className='text-xs text-muted-foreground'>
                                Password reset links expire after a short time
                                for security reasons. Please request a new one.
                            </p>
                        </div>
                        <Link href='/auth/forgot-password'>
                            <Button className='w-full h-12' size='lg'>
                                Request New Reset Link
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-muted/30 p-6'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <Link href='/'>
                        <Image
                            src={iconLight}
                            alt='Mintd'
                            className='block h-12 mx-auto mb-6 dark:hidden max-w-fit'
                            loading='lazy'
                        />
                        <Image
                            src={iconDark}
                            alt='Mintd'
                            className='hidden h-12 mx-auto mb-6 dark:block max-w-fit'
                            loading='lazy'
                        />
                    </Link>
                    <h1 className='text-3xl font-bold text-foreground mb-2'>
                        Set New Password
                    </h1>
                    <p className='text-muted-foreground'>
                        Choose a strong password for your account
                    </p>
                </div>

                <div className='bg-card rounded-2xl p-8 shadow-luxury border border-border space-y-6'>
                    <form
                        noValidate
                        onSubmit={handleSubmit(handleReset)}
                        className='space-y-4'
                    >
                        <div className='space-y-2'>
                            <Label
                                htmlFor='password'
                                className='text-foreground'
                            >
                                New Password
                            </Label>
                            <div className='relative'>
                                <Input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Enter new password'
                                    className='h-12 pr-11'
                                    required
                                    minLength={8}
                                    maxLength={32}
                                    {...register('password')}
                                />
                                <button
                                    type='button'
                                    className='absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                    onClick={() =>
                                        setShowPassword((visible) => !visible)
                                    }
                                    aria-label={
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            className='h-4 w-4'
                                            aria-hidden='true'
                                        />
                                    ) : (
                                        <Eye
                                            className='h-4 w-4'
                                            aria-hidden='true'
                                        />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className='text-xs text-red-500'>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label
                                htmlFor='confirmPassword'
                                className='text-foreground'
                            >
                                Confirm Password
                            </Label>
                            <div className='relative'>
                                <Input
                                    id='confirmPassword'
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    placeholder='Confirm new password'
                                    className='h-12 pr-11'
                                    required
                                    minLength={8}
                                    maxLength={32}
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type='button'
                                    className='absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (visible) => !visible,
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? 'Hide password confirmation'
                                            : 'Show password confirmation'
                                    }
                                    aria-pressed={showConfirmPassword}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff
                                            className='h-4 w-4'
                                            aria-hidden='true'
                                        />
                                    ) : (
                                        <Eye
                                            className='h-4 w-4'
                                            aria-hidden='true'
                                        />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className='text-xs text-red-500'>
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type='submit'
                            className='w-full h-12'
                            size='lg'
                            disabled={loading}
                        >
                            {loading ?? (
                                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            )}
                            {loading ? 'Updating...' : 'Update Password'}{' '}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className='min-h-screen flex items-center justify-center'>
                    <Loader2
                        className='w-8 h-8 animate-spin text-accent'
                        aria-label='Loading password reset'
                    />
                </div>
            }
        >
            <ResetPassword />
        </Suspense>
    );
}
