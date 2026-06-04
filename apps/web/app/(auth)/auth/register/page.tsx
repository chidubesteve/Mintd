'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import iconDark from '@/public/logo-mixed-green.webp';
import iconLight from '@/public/logo-mixed.webp';
import { registerFormSchema, RegisterFormValues } from './validation/schema';
import Image from 'next/image';
import { useRegister } from '@/hooks/mutations/useAuthMutations';
import { useForm } from 'react-hook-form';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useState } from 'react';

const Register = () => {
    const { resolvedTheme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const iconSrc = resolvedTheme === 'light' ? iconDark : iconLight;
    const { mutate: registerUser, isPending } = useRegister();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        mode: 'onChange',
        delayError: 1500, // add a delay of 1.5 second before showing validation errors to avoid overwhelming the user with messages as they type
    });

    // TODO: Replace with  mutation to call Express backend
    const onSubmit = async (data: RegisterFormValues) => {
        registerUser(data);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-muted/30 p-6'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <Link href='/'>
                        <Image
                            src={iconSrc}
                            alt='Mintd'
                            className='h-10 mx-auto mb-6 w-auto'
                        />
                    </Link>
                    <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2'>
                        Create your account
                    </h1>
                    <p className='text-muted-foreground'>
                        Start securing your watch collection
                    </p>
                </div>

                <div className='bg-card rounded-2xl p-8 shadow-luxury border border-border space-y-6'>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
                        <div className='flex flex-col sm:flex-row gap-4'>
                            <div className='space-y-2 w-full sm:w-1/2 '>
                                <Label
                                    htmlFor='firstName'
                                    className='text-foreground'
                                >
                                    First Name
                                    <Tooltip>
                                        <TooltipTrigger className='text-muted-foreground'>
                                            <Info size={14} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Enter your first name as it
                                                appears on your ID
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input
                                    id='firstName'
                                    type='text'
                                    placeholder='John'
                                    className='h-12'
                                    {...register('firstName')}
                                />
                                {errors.firstName && (
                                    <p className='text-xs text-red-500'>
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>
                            <div className='space-y-2 w-full sm:w-1/2 '>
                                <Label
                                    htmlFor='lastName'
                                    className='text-foreground'
                                >
                                    Last Name
                                    <Tooltip>
                                        <TooltipTrigger className='text-muted-foreground'>
                                            <Info size={14} />
                                        </TooltipTrigger>
                                        <TooltipContent className='bg-card-foreground!'>
                                            <p>
                                                Enter your last name as it
                                                appears on your ID
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input
                                    id='lastName'
                                    type='text'
                                    placeholder='Smith'
                                    className='h-12'
                                    {...register('lastName')}
                                />
                                {errors.lastName && (
                                    <p className='text-xs text-red-500'>
                                        {errors.lastName.message}
                                    </p>
                                )}
                            </div>
                        </div>

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
                            <div className='relative'>
                                <Input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Create a strong password'
                                    className='h-12'
                                    {...register('password')}
                                />
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
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Repeat your password'
                                    className='h-12'
                                    {...register('confirmPassword')}
                                />
                            </div>

                            {errors.confirmPassword && (
                                <p className='text-xs text-red-500'>
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                        <div className='flex items-center gap-2'>
                            <Input
                                type='checkbox'
                                id='showPassword'
                                className='accent-accent h-4 w-4'
                                onChange={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            />
                            <Label
                                htmlFor='showPassword'
                                className='text-sm text-foreground'
                            >
                                Show password
                            </Label>
                        </div>

                        <Button
                            type='submit'
                            className='w-full h-12'
                            size='lg'
                            disabled={isPending}
                        >
                            {isPending
                                ? 'Creating Account...'
                                : 'Create Account'}
                        </Button>
                        <p className='text-xs text-muted-foreground text-center leading-relaxed'>
                            By creating an account you agree to our{' '}
                            <Link
                                href='/terms'
                                className='underline text-accent hover:text-accent/80'
                            >
                                Terms & Conditions
                            </Link>{' '}
                            and confirm that you have read and understand our{' '}
                            <Link
                                href='/privacy'
                                className='underline text-accent hover:text-accent/80'
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </form>

                    <p className='text-center text-sm text-muted-foreground'>
                        Already have an account?{' '}
                        <Link
                            href='/auth/login'
                            className='text-accent hover:underline font-medium'
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
