import Link from 'next/link';
import { Vault as VaultIcon } from 'lucide-react';
import { TbDeviceWatchPlus } from 'react-icons/tb';
import { Button } from '@/components/ui/button';

const EmptyVault = () => {
    return (
        <div className='flex flex-col items-center justify-center text-center py-24 px-6 rounded-2xl border border-dashed border-border bg-card/40'>
            <div className='w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6'>
                <VaultIcon className='w-7 h-7 text-accent' />
            </div>
            <h2 className='text-xl font-bold text-foreground mb-2'>
                Your vault is currently empty
            </h2>
            <p className='text-sm text-muted-foreground max-w-sm mb-8'>
                Register your first wristwatch and it will appear here —
                complete with verified details and a home for its future NFT
                certificate.
            </p>
            <Link href='/watch/register'>
                <Button size='lg' className='bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-8'>
                    <TbDeviceWatchPlus className='size-5!' />
                    Register a watch
                </Button>
            </Link>
        </div>
    );
};

export default EmptyVault;
