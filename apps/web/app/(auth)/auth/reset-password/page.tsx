"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import iconDark from '@/public/logo-mixed.webp';
import iconLight from '@/public/logo-mixed-green.webp';
import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [sessionValid, setSessionValid] = useState(false);
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const iconSrc = resolvedTheme === 'light' ? iconLight : iconDark;


    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        // if (password !== confirmPassword) {
        //     toast.error("Passwords don't match", {
        //         description: 'Please make sure both passwords are the same.',
        //     });
        //     return;
        // }

        // if (password.length < 6) {
        //     toast.error('Password too short', {
        //         description: 'Password must be at least 6 characters.',
        //     });
        //     return;
        // }

        // setLoading(true);

        // if (error) {
        //     toast.error("Something went wrong", {
        //         description: error.message,
        //     });
        // } else {
        //     toast({
        //         title: 'Password updated',
        //         description: 'Your password has been reset successfully.',
        //     });
        //     router.push('/vault');
        // }

        // setLoading(false);
    };

    if (verifying) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-muted/30 p-6'>
                <div className='text-center space-y-4'>
                    <Loader2 className='w-8 h-8 animate-spin text-accent mx-auto' />
                    <p className='text-muted-foreground text-sm'>
                        Verifying reset link...
                    </p>
                </div>
            </div>
        );
    }

    if (!sessionValid) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-muted/30 p-6'>
                <div className='w-full max-w-md'>
                    <div className='text-center mb-8'>
                        <Link href='/'>
                            <Image
                                src={iconSrc}
                                alt='Mintd'
                                className='h-12 mx-auto mb-6'
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
                        <Link href='/forgot-password'>
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
                            src={iconSrc}
                            alt='Mintd'
                            className='h-12 mx-auto mb-6'
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
                    <form onSubmit={handleReset} className='space-y-4'>
                        <div className='space-y-2'>
                            <Label
                                htmlFor='password'
                                className='text-foreground'
                            >
                                New Password
                            </Label>
                            <Input
                                id='password'
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Enter new password'
                                className='h-12'
                                required
                                minLength={6}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label
                                htmlFor='confirmPassword'
                                className='text-foreground'
                            >
                                Confirm Password
                            </Label>
                            <Input
                                id='confirmPassword'
                                type='password'
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder='Confirm new password'
                                className='h-12'
                                required
                                minLength={6}
                            />
                        </div>

                        <Button
                            type='submit'
                            className='w-full h-12'
                            size='lg'
                            disabled={loading}
                        >
                            <ShieldCheck className='w-4 h-4 mr-2' />
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
