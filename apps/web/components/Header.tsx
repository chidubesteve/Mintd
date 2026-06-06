'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Switch } from '@/components/ui/switch';
import { Button } from './ui/button';
import { TbDeviceWatchPlus } from 'react-icons/tb';
import {
    LogOut,
    ChevronDown,
    ShieldCheck,
    Settings,
    Vault,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuthStore } from '@/store/Auth.store';
import { useLogout } from '@/hooks/mutations/useAuthMutations';

import logoSrc from '@/public/logo-and-name-mixed.webp';
import logoMobileSrc from '@/public/logo-mixed.webp';
import { useTheme } from 'next-themes';
import { Field, FieldLabel } from './ui/field';
import PngIcon from './PngIcon';

type NavLink = { href: string; label: string; icon?: React.ReactNode };

// Routes that are only visible when authenticated
const VAULT_NAV: NavLink[] = [
    {
        href: '/vault',
        label: 'Vault',
        icon: <Vault className='text-current size-5! ' />,
    },
    {
        href: '/watch/register',
        label: 'Register Watch',
        icon: <TbDeviceWatchPlus className=' text-current size-5!' />,
    },
    { href: '/kyc', label: 'Verification' },
    {
        href: '/mint',
        label: 'Mint Watch NFT',
        icon: <PngIcon src='/NFT.png' size={18} />,
    },
];

const ADMIN_NAV: NavLink[] = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/kyc', label: 'KYC' },
    { href: '/admin/watches', label: 'Watches' },
    { href: '/admin/mint', label: 'Mint' },
];

const Header = () => {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuthStore();
    const { mutate: logoutUser, isPending: isLoggingOut } = useLogout();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const isAdmin = user?.role === 'ADMIN';
    const navLinks = isAdmin ? ADMIN_NAV : VAULT_NAV;

    console.log(useAuthStore.getState(), 'Auth store');
    // KYC status badge colour — Collectors see this as a prompt to complete KYC
    const kycColour = {
        NOT_SUBMITTED: 'bg-muted-foreground',
        PENDING: 'bg-yellow-500',
        APPROVED: 'bg-accent',
        REJECTED: 'bg-destructive',
    }[user?.kycStatus ?? 'NOT_SUBMITTED'];

    return (
        <header className='fixed top-0 w-full z-50 bg-primary dark:bg-background/80 dark:backdrop-blur-xl dark:border-b dark:border-border/50 shadow-subtle'>
            <div className='container mx-auto px-4 md:px-6 xl:max-w-[calc(100%-6rem)] py-4 flex items-center justify-between gap-3'>
                {/* Logo */}
                <Link href='/' className='flex items-center shrink-0'>
                    <Image
                        src={logoSrc}
                        alt='Mintd'
                        className='h-8 object-contain hidden md:block'
                        height={50}
                        width={150}
                    />
                    <Image
                        src={logoMobileSrc}
                        alt='Mintd'
                        className='h-8 object-contain block md:hidden'
                        height={50}
                        width={50}
                    />
                </Link>

                {/* Authenticated nav links — desktop */}
                {isAuthenticated() && (
                    <nav className='hidden md:flex items-center gap-6'>
                        {navLinks.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`text-sm font-medium transition-colors ${
                                    pathname.startsWith(href)
                                        ? 'text-primary-foreground dark:text-foreground'
                                        : 'text-primary-foreground/60 dark:text-foreground/60 hover:text-primary-foreground dark:hover:text-foreground'
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* Right side */}
                <div className='flex items-center gap-2'>
                    {isAuthenticated() && user ? (
                        // ── Authenticated state ─────────────────────────────
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className='flex items-center gap-2 rounded-full p-1.25 hover:bg-primary-foreground/10 dark:hover:bg-foreground/10 transition-colors'>
                                    {/* Avatar with initials */}
                                    <Image
                                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.fName} ${user.lName}`}
                                        alt={`${user.fName}'s avatar`}
                                        className='w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0'
                                        width={32}
                                        height={32}
                                        unoptimized
                                    />

                                    <span className='hidden md:block text-sm font-medium text-primary-foreground dark:text-foreground'>
                                        {user.fName}
                                    </span>
                                    <ChevronDown className='w-3.5 h-3.5 text-primary-foreground/60 dark:text-foreground/60 hidden md:block' />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align='end' className='w-56'>
                                <DropdownMenuLabel className='font-normal'>
                                    <div className='flex flex-col gap-1'>
                                        <p className='text-sm font-semibold'>
                                            {user.fName} {user.lName}
                                        </p>
                                        <p className='text-xs text-muted-foreground truncate'>
                                            {user.email}
                                        </p>
                                        {/* KYC status pill — only for collectors */}
                                        {!isAdmin && user.kycStatus && (
                                            <div className='flex items-center gap-1.5 mt-1'>
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${kycColour}`}
                                                />
                                                <span className='text-xs text-muted-foreground capitalize'>
                                                    KYC:{' '}
                                                    {user.kycStatus
                                                        .replace('_', ' ')
                                                        .toLowerCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                {/* mobile only nav links, hidden on desktop */}
                                {navLinks
                                    .filter(({ href }) => href !== '/kyc')
                                    .map(({ href, label, icon }) => (
                                        <DropdownMenuItem
                                            key={href}
                                            asChild
                                            className='md:hidden'
                                        >
                                            <Link
                                                href={href}
                                                className='cursor-pointer'
                                            >
                                                {icon && (
                                                    <span className='mr-2 shrink-0 w-fit'>
                                                        {icon}
                                                    </span>
                                                )}
                                                {label}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}

                                <DropdownMenuItem
                                    asChild
                                    className='hover:bg-red-700'
                                >
                                    <Link
                                        href='/settings'
                                        className='cursor-pointer'
                                    >
                                        <Settings className='size-5! mr-2 hover:text-white focus:text-white' />
                                        Account Settings
                                    </Link>
                                </DropdownMenuItem>

                                {/* Theme toggle can be added here in the future for authenticated users */}

                                <DropdownMenuSeparator />

                                {!isAdmin && user.kycStatus !== 'APPROVED' && (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href='/kyc'
                                            className='cursor-pointer '
                                        >
                                            <ShieldCheck className='mr-2 hover:text-white focus:text-white size-5!' />
                                            Complete Verification
                                        </Link>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />
                                <Field
                                    className='flex items-center cursor-pointer select-none px-2 py-1.5 my-1 hover:bg-primary-foreground/10 dark:hover:bg-foreground/10 rounded-md'
                                    orientation='horizontal'
                                >
                                    <Switch
                                        checked={isDark}
                                        onCheckedChange={(checked) =>
                                            setTheme(checked ? 'dark' : 'light')
                                        }
                                        size='default'
                                        className='data-[state=checked]:bg-accent cursor-pointer'
                                    />
                                    <FieldLabel className='cursor-pointer '>
                                        {isDark ? 'Light mode' : 'Dark mode'}
                                    </FieldLabel>
                                </Field>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={() => logoutUser()}
                                    disabled={isLoggingOut}
                                    className='text-destructive focus:text-destructive cursor-pointer'
                                >
                                    <LogOut className='w-6 h-6 mr-2 text-destructive' />
                                    {isLoggingOut
                                        ? 'Signing out...'
                                        : 'Sign Out'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        // ── Unauthenticated state ───────────────────────────
                        <>
                            {/* Only show theme toggle in desktop mode */}
                            <span className='hidden md:block'>
                                <ThemeToggle />
                            </span>
                            <Link href='/auth/login'>
                                <Button
                                    variant='ghost'
                                    size={'lg'}
                                    className='text-primary-foreground dark:text-foreground text-md hover:bg-primary-foreground/10 dark:hover:bg-foreground/10'
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link href='/auth/register'>
                                <Button
                                    className='text-md bg-accent text-accent-foreground hover:bg-accent/90'
                                    size={'lg'}
                                >
                                    Join Mintd
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
