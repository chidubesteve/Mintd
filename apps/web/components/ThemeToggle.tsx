import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
// import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme} = useTheme();

    if(!resolvedTheme) {
        return null;
    }

    return (
        <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='text-primary-foreground hover:bg-primary-foreground/10 dark:text-foreground dark:hover:bg-foreground/10'
        >
            {theme === 'dark' ? (
                <Sun className='h-5 w-5' />
            ) : (
                <Moon className='h-5 w-5' />
            )}
            <span className='sr-only'>Toggle theme</span>
        </Button>
    );
}
