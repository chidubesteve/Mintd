import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

import { Button } from './ui/button';


import logoSrc from '@/public/logo-and-name-mixed.webp';
import logoMobileSrc from '@/public/logo-mixed.webp';
const Header = () => {
  return (
      <header className='fixed top-0 w-full z-50 bg-primary dark:bg-background/80 dark:backdrop-blur-xl dark:border-b dark:border-border/50 shadow-subtle'>
          <div className='container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3'>
              <Link href='/' className='flex items-center'>
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
                      width={100}
                  />
              </Link>
              <div className='flex items-center gap-2'>
                  <ThemeToggle />
                  <Link href='/login'>
                      <Button
                          variant='ghost'
                          className='text-primary-foreground dark:text-foreground hover:bg-primary-foreground/10 dark:hover:bg-foreground/10'
                      >
                          Login
                      </Button>
                  </Link>
                  <Link href='/register'>
                      <Button className='bg-accent text-accent-foreground hover:bg-accent/90'>
                          Join Mintd
                      </Button>
                  </Link>
              </div>
          </div>
      </header>
  );
}

export default Header