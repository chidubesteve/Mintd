"use client"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import iconDark from '@/public/logo-mixed-green.webp';
import iconLight from '@/public/logo-mixed.webp';
import { loginFormSchema, LoginFormValues } from './validation/schema';
import { useLogin } from '@/hooks/mutations/useAuthMutations';
import Image from 'next/image';

const Login = () => {
    const { resolvedTheme } = useTheme();
    const iconSrc = resolvedTheme === 'light' ? iconDark : iconLight;
    const { mutate: loginUser, isPending } = useLogin();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: { email: '', password: '' },
        delayError: 1500,
        mode: 'onChange',
    });

    // TODO: Replace with React Query mutation to call Express backend
    const onSubmit = async (data: LoginFormValues) => {
        loginUser(data);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-muted/30 p-6'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <Link href='/'>
                        <Image
                            src={iconSrc}
                            alt='Mintd'
                            width={70}
                            className='h-10 mx-auto w-auto mb-6'
                            priority
                        />
                    </Link>
                    <h1 className='text-3xl font-bold text-foreground mb-2'>
                        Welcome back
                    </h1>
                    <p className='text-muted-foreground'>
                        Sign in to access your vault
                    </p>
                </div>

                <div className='bg-card rounded-2xl p-8 shadow-luxury border border-border space-y-6'>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
                        <div className='space-y-2'>
                            <Label htmlFor='email' className='text-foreground'>
                                Email
                            </Label>
                            <Input
                                id='email'
                                type='email'
                                placeholder='your@email.com'
                                className='h-12'
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className='text-xs text-red-500'>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label
                                htmlFor='password'
                                className='text-foreground'
                            >
                                Password
                            </Label>
                            <Input
                                id='password'
                                type='password'
                                placeholder='Enter your password'
                                className='h-12'
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className='text-xs text-red-500'>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type='submit'
                            className='w-full h-12'
                            size='lg'
                            disabled={isPending}
                        >
                            {isPending ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <div className='text-right'>
                            <Link
                                href='/auth/forgot-password'
                                className='text-xs text-accent hover:underline font-medium'
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </form>

                    <p className='text-center text-sm text-muted-foreground'>
                        Don&apos;t have an account?{' '}
                        <Link
                            href='/auth/register'
                            className='text-accent hover:underline font-medium'
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
