"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link  from 'next/link';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import iconDark from '@/public/logo-mixed.webp';
import iconLight from '@/public/logo-mixed-green.webp';
import { Mail, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { resolvedTheme } = useTheme();
    const iconSrc = resolvedTheme === 'light' ? iconLight : iconDark;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setSent(true);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-muted/30 p-6'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <Link href='/'>
                        <Image
                            src={iconSrc}
                            alt='Mintd'
                            className='h-12 w-auto mx-auto mb-6'
                        />
                    </Link>
                    <h1 className='text-3xl font-bold text-foreground mb-2'>
                        Forgot Password
                    </h1>
                    <p className='text-muted-foreground'>
                        {sent
                            ? 'Check your inbox'
                            : 'Enter your email to reset your password'}
                    </p>
                </div>

                <div className='bg-card rounded-2xl p-8 shadow-luxury border border-border space-y-6'>
                    {sent ? (
                        <div className='text-center space-y-4'>
                            <div className='w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto'>
                                <Mail className='w-8 h-8 text-accent' />
                            </div>
                            <div>
                                <p className='text-sm text-foreground font-medium mb-1'>
                                    Password reset link sent
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                    We&apos;ve sent a password reset link to{' '}
                                    <span className='font-medium text-foreground'>
                                        {email}
                                    </span>
                                    . Please check your email and click the link
                                    to set a new password.
                                </p>
                            </div>
                            <p className='text-xs text-muted-foreground'>
                                Didn&apos;t receive the email? Check your spam folder
                                or{' '}
                                <button
                                    onClick={() => setSent(false)}
                                    className='text-accent hover:underline font-medium'
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label
                                    htmlFor='email'
                                    className='text-foreground'
                                >
                                    Email
                                </Label>
                                <Input
                                    id='email'
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='your@email.com'
                                    className='h-12 dark:border-gray-400'
                                    required
                                />
                            </div>

                            <Button
                                type='submit'
                                className='w-full h-12'
                                size='lg'
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}

                    <p className='text-center text-sm text-muted-foreground'>
                        <Link
                            href='/login'
                            className='text-accent hover:underline font-medium inline-flex items-center gap-1'
                        >
                            <ArrowLeft className='w-3 h-3' />
                            Back to login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
