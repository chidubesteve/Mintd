"use client"
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/public/logo-and-name-green.webp';
import logoDark from '@/public/logo-and-name-mixed.webp';
import { useTheme } from 'next-themes';

const Footer = () => {
    const { resolvedTheme } = useTheme();
    const logoSrc = resolvedTheme === 'light' ? logo : logoDark;
  return (
      <footer className='py-16 border-t border-border bg-card'>
          <div className='container mx-auto px-6 xl:max-w-[calc(100%-6rem)]'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 '>
                  <div className='flex flex-col items-center text-center'>
                      <Link href={'/'}>
                          <Image
                              src={logoSrc}
                              alt='Mintd'
                              className='h-8 mb-4 object-contain text-start w-inherit '
                              width={150}
                          />
                      </Link>
                      <p className='text-sm text-muted-foreground max-w-xs'>
                          The global standard for digital proof of luxury watch
                          ownership. Secure, transparent, and immutable.
                      </p>
                  </div>

                  <div className='md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8 md:place-items-center text-center'>
                      <div className='items-center'>
                          <h4 className='font-semibold mb-4 text-foreground'>
                              Platform
                          </h4>
                          <ul className='space-y-2 text-sm text-muted-foreground'>
                              <li>
                                  <Link
                                      href='/verify'
                                      className='hover:text-foreground transition-colors'
                                  >
                                      Browse Watches
                                  </Link>
                              </li>
                              <li>
                                  <Link
                                      href='/register'
                                      className='hover:text-foreground transition-colors'
                                  >
                                      For Collectors
                                  </Link>
                              </li>
                              <li>
                                  <Link
                                      href='/verify'
                                      className='hover:text-foreground transition-colors'
                                  >
                                      Verification
                                  </Link>
                              </li>
                          </ul>
                      </div>
                      <div>
                          <h4 className='font-semibold mb-4 text-foreground'>
                              Legal
                          </h4>
                          <ul className='space-y-2 text-sm text-muted-foreground'>
                              <li>
                                  <a
                                      href='#'
                                      className='hover:text-foreground transition-colors'
                                  >
                                      Privacy Policy
                                  </a>
                              </li>
                              <li>
                                  <a
                                      href='#'
                                      className='hover:text-foreground transition-colors'
                                  >
                                      Terms of Service
                                  </a>
                              </li>
                              <li>
                                  <a
                                      href='#'
                                      className='hover:text-foreground transition-colors'
                                  >
                                      Cookie Policy
                                  </a>
                              </li>
                          </ul>
                      </div>
                      <div>
                          <h4 className='font-semibold mb-4 text-foreground'>
                              Contact
                          </h4>
                          <ul className='space-y-2 text-sm text-muted-foreground flex flex-col'>
                              <Link href='mailto:hello@mintd.uk'>
                                  hello@mintd.uk
                              </Link>
                              <Link href='/support'>Support Portal</Link>
                          </ul>
                      </div>
                  </div>
              </div>

              <div className='border-t border-border pt-8 text-center text-sm text-muted-foreground'>
                  <p>
                      &copy; 2025 Mintd. All rights reserved. Built on Polygon.
                  </p>
              </div>
          </div>
      </footer>
  );
}

export default Footer