import { Button } from '@/components/ui/button';
import {
    Shield,
    Fingerprint,
    CheckCircle2,
    AlertTriangle,
    FileX,
    HelpCircle,
    Clock,
    BadgeCheck,
    Database,
    History,
    QrCode,
    ArrowRight,
    ArrowLeftRight,
} from 'lucide-react';
import Link from 'next/link';

import HeroCertificateMockup from '@/components/HeroCertificateMockup';


const Home = () => {


    return (
        <div className='min-h-screen bg-background text-foreground'>

            {/* Hero Section */}
            <section className='pt-32 pb-20 lg:pb-24 relative overflow-hidden bg-background'>
                <div className='container mx-auto px-6'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-8 items-center'>
                        {/* Left: Text content */}
                        <div className='order-2 lg:order-1'>
                            <span className='inline-flex items-center gap-2 text-accent text-sm font-medium mb-6 bg-accent/10 border border-accent/30 rounded-full px-4 py-1.5'>
                                <CheckCircle2 className='w-4 h-4' />
                                Blockchain Verified Authenticity
                            </span>
                            <h1 className='text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-foreground'>
                                The Digital
                                <br />
                                Proof of{' '}
                                <span className='text-accent'>Luxury</span>
                                <br />
                                Ownership
                            </h1>
                            <p className='text-lg text-muted-foreground max-w-xl mb-8'>
                                Mintd bridges the physical and digital worlds,
                                creating immutable NFT certificates for your
                                most prized timepieces. Secure, transferable,
                                and eternal.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <Link href='/register'>
                                    <Button
                                        size='lg'
                                        className='bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-8 w-full sm:w-auto'
                                    >
                                        Join as Collector
                                        <ArrowRight className='w-4 h-4 ml-2' />
                                    </Button>
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className='flex flex-wrap gap-8 sm:gap-12 mt-12'>
                                <div>
                                    <div className='text-2xl sm:text-3xl font-bold text-foreground'>
                                        500+
                                    </div>
                                    <div className='text-sm text-muted-foreground'>
                                        Watches Minted
                                    </div>
                                </div>
                                <div>
                                    <div className='text-2xl sm:text-3xl font-bold text-foreground'>
                                        £5k+
                                    </div>
                                    <div className='text-sm text-muted-foreground'>
                                        Asset Value
                                    </div>
                                </div>
                                <div>
                                    <div className='text-2xl sm:text-3xl font-bold text-foreground'>
                                        50+
                                    </div>
                                    <div className='text-sm text-muted-foreground'>
                                        Verified Collectors
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Certificate mockup */}
                        <div className='order-2 h-87.5 sm:h-100 lg:h-125'>
                            <HeroCertificateMockup />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Strip */}
            <section className='py-8 border-y border-border bg-muted/50'>
                <div className='container mx-auto px-6'>
                    <div className='flex flex-wrap items-center justify-center gap-12 text-muted-foreground'>
                        <div className='flex items-center gap-3'>
                            <CheckCircle2 className='w-5 h-5 text-accent' />
                            <span className='text-sm'>
                                Admin-minted NFTs only
                            </span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <CheckCircle2 className='w-5 h-5 text-accent' />
                            <span className='text-sm'>
                                Verified serial numbers
                            </span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <CheckCircle2 className='w-5 h-5 text-accent' />
                            <span className='text-sm'>On-chain ownership</span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <CheckCircle2 className='w-5 h-5 text-accent' />
                            <span className='text-sm'>
                                Fiat payments supported
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem/Solution Section */}
            <section className='py-20 bg-background'>
                <div className='container mx-auto px-6'>
                    <div className='text-center mb-16'>
                        <h2 className='text-3xl md:text-4xl font-bold mb-4 text-foreground'>
                            The Problem with Traditional Authentication
                        </h2>
                        <p className='text-muted-foreground max-w-2xl mx-auto'>
                            The luxury watch market faces critical challenges
                            that put collectors and dealers at risk.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 gap-8 max-w-6xl mx-auto'>
                        {/* Critical Issues */}
                        <div>
                            <h3 className='flex items-center gap-2 text-destructive font-semibold mb-6'>
                                <AlertTriangle className='w-5 h-5' />
                                Critical Issues
                            </h3>
                            <div className='space-y-4'>
                                <div className='p-5 rounded-xl border border-border bg-card shadow-card'>
                                    <div className='flex items-start gap-3'>
                                        <AlertTriangle className='w-5 h-5 text-destructive mt-0.5' />
                                        <div>
                                            <h4 className='font-semibold mb-1 text-foreground'>
                                                Counterfeit Epidemic
                                            </h4>
                                            <p className='text-sm text-muted-foreground'>
                                                Over $1.2B in fake luxury
                                                watches sold annually.
                                                Traditional certificates are
                                                easily forged.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-5 rounded-xl border border-border bg-card shadow-card'>
                                    <div className='flex items-start gap-3'>
                                        <FileX className='w-5 h-5 text-destructive mt-0.5' />
                                        <div>
                                            <h4 className='font-semibold mb-1 text-foreground'>
                                                Lost Documentation
                                            </h4>
                                            <p className='text-sm text-muted-foreground'>
                                                Physical papers get damaged,
                                                lost, or destroyed. No backup
                                                means no proof of authenticity.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-5 rounded-xl border border-border bg-card shadow-card'>
                                    <div className='flex items-start gap-3'>
                                        <HelpCircle className='w-5 h-5 text-destructive mt-0.5' />
                                        <div>
                                            <h4 className='font-semibold mb-1 text-foreground'>
                                                Provenance Gaps
                                            </h4>
                                            <p className='text-sm text-muted-foreground'>
                                                Incomplete ownership history
                                                makes verification impossible.
                                                Trust issues plague the
                                                secondary market.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-5 rounded-xl border border-border bg-card shadow-card'>
                                    <div className='flex items-start gap-3'>
                                        <Clock className='w-5 h-5 text-destructive mt-0.5' />
                                        <div>
                                            <h4 className='font-semibold mb-1 text-foreground'>
                                                Market Friction
                                            </h4>
                                            <p className='text-sm text-muted-foreground'>
                                                Slow, expensive verification
                                                processes. Buyers hesitate,
                                                sellers struggle to prove
                                                authenticity.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mintd Solutions */}
                        <div>
                            <h3 className='flex items-center gap-2 text-accent font-semibold mb-6'>
                                <CheckCircle2 className='w-5 h-5' />
                                Mintd Solutions
                            </h3>
                            <div className='space-y-4'>
                                <div className='p-5 rounded-xl border border-accent/30 bg-accent/5 shadow-card'>
                                    <div className='flex items-start gap-3'>
                                        <BadgeCheck className='w-5 h-5 text-accent mt-0.5' />
                                        <div>
                                            <h4 className='font-semibold mb-1 text-foreground'>
                                                Blockchain Verification
                                            </h4>
                                            <p className='text-sm text-muted-foreground'>
                                                Immutable digital certificates
                                                on Polygon. Impossible to forge,
                                                always verifiable.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-5 rounded-xl border border-accent/30 bg-accent/5 shadow-card'>
                                    <div className='flex items-start gap-3'>
                                        <Database className='w-5 h-5 text-accent mt-0.5' />
                                        <div>
                                            <h4 className='font-semibold mb-1 text-foreground'>
                                                Permanent Records
                                            </h4>
                                            <p className='text-sm text-muted-foreground'>
                                                Stored on IPFS and blockchain
                                                forever. Never lost, damaged, or
                                                destroyed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-5 rounded-xl border border-accent/30 bg-accent/5 shadow-card'>
                                    <div className='flex items-start gap-3'>
                                        <History className='w-5 h-5 text-accent mt-0.5' />
                                        <div>
                                            <h4 className='font-semibold mb-1 text-foreground'>
                                                Complete Provenance
                                            </h4>
                                            <p className='text-sm text-muted-foreground'>
                                                Full ownership history from mint
                                                to current owner. Transparent,
                                                auditable, trustworthy.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-5 rounded-xl border border-accent/30 bg-accent/5 shadow-card'>
                                    <div className='flex items-start gap-3'>
                                        <QrCode className='w-5 h-5 text-accent mt-0.5' />
                                        <div>
                                            <h4 className='font-semibold mb-1 text-foreground'>
                                                Instant Verification
                                            </h4>
                                            <p className='text-sm text-muted-foreground'>
                                                Scan QR code or enter serial
                                                number. Instant authentication
                                                in seconds, not days.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Mintd Section */}
            <section className='py-20 bg-muted/30'>
                <div className='container mx-auto px-6'>
                    <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
                        Why Collectors Choose Mintd
                    </h2>
                    <p className='text-muted-foreground text-center max-w-2xl mx-auto mb-12'>
                        Own digital certificates effortlessly. No crypto
                        expertise required.
                    </p>

                    <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
                        {/* Zero Crypto Complexity */}
                        <div className='group relative pl-6 py-6 pr-8'>
                            <div className='absolute left-0 top-0 bottom-0 w-1 bg-border group-hover:bg-accent transition-colors duration-300 rounded-full' />
                            <div className='w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-5'>
                                <Fingerprint className='w-5 h-5 text-accent' />
                            </div>
                            <h3 className='text-lg font-semibold mb-2 text-foreground'>
                                Zero Crypto Complexity
                            </h3>
                            <p className='text-sm text-muted-foreground leading-relaxed'>
                                No wallet setup, no seed phrases, no gas fees.
                                We handle the blockchain so you can focus on
                                your collection.
                            </p>
                        </div>

                        {/* Bank-Level Security */}
                        <div className='group relative pl-6 py-6 pr-8'>
                            <div className='absolute left-0 top-0 bottom-0 w-1 bg-border group-hover:bg-accent transition-colors duration-300 rounded-full' />
                            <div className='w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-5'>
                                <Shield className='w-5 h-5 text-accent' />
                            </div>
                            <h3 className='text-lg font-semibold mb-2 text-foreground'>
                                Bank-Level Security
                            </h3>
                            <p className='text-sm text-muted-foreground leading-relaxed'>
                                Enterprise-grade encryption, secure custody, and
                                24/7 monitoring. Your digital assets are
                                protected like your physical ones.
                            </p>
                        </div>

                        {/* Full Ownership Rights */}
                        <div className='group relative pl-6 py-6 pr-8'>
                            <div className='absolute left-0 top-0 bottom-0 w-1 bg-border group-hover:bg-accent transition-colors duration-300 rounded-full' />
                            <div className='w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-5'>
                                <BadgeCheck className='w-5 h-5 text-accent' />
                            </div>
                            <h3 className='text-lg font-semibold mb-2 text-foreground'>
                                Full Ownership Rights
                            </h3>
                            <p className='text-sm text-muted-foreground leading-relaxed'>
                                Your certificate, your asset. Transfer ownership
                                seamlessly or export to your own wallet whenever
                                you choose.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className='py-20 bg-background'>
                <div className='container mx-auto px-6'>
                    <div className='text-center mb-16'>
                        <h2 className='text-3xl md:text-4xl font-bold mb-4 text-foreground'>
                            How Mintd Works
                        </h2>
                        <p className='text-muted-foreground'>
                            A seamless bridge between physical luxury and
                            digital permanence.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-4 gap-6 max-w-5xl mx-auto'>
                        <div className='relative text-center p-6 rounded-xl bg-card border border-border shadow-card overflow-hidden'>
                            <Shield className='absolute top-4 right-4 w-16 h-16 text-accent/10' />
                            <div className='relative z-10'>
                                <h3 className='font-bold text-foreground mb-2'>
                                    Register the Watch
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    collectors submits serial number, high-res
                                    imagery, and metadata for verification.
                                </p>
                            </div>
                        </div>

                        <div className='relative text-center p-6 rounded-xl bg-card border border-border shadow-card overflow-hidden'>
                            <BadgeCheck className='absolute top-4 right-4 w-16 h-16 text-accent/10' />
                            <div className='relative z-10'>
                                <h3 className='font-bold text-foreground mb-2'>
                                    Admin Mints NFT
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    Once verified, a unique Token ID is
                                    generated on the blockchain.
                                </p>
                            </div>
                        </div>

                        <div className='relative text-center p-6 rounded-xl bg-card border border-border shadow-card overflow-hidden'>
                            <Fingerprint className='absolute top-4 right-4 w-16 h-16 text-accent/10' />
                            <div className='relative z-10'>
                                <h3 className='font-bold text-foreground mb-2'>
                                    Collector Owns NFT
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    The NFT serves as immutable proof of
                                    ownership and authenticity.
                                </p>
                            </div>
                        </div>

                        <div className='relative text-center p-6 rounded-xl bg-card border border-border shadow-card overflow-hidden'>
                            <ArrowLeftRight className='absolute top-4 right-4 w-16 h-16 text-accent/10' />
                            <div className='relative z-10'>
                                <h3 className='font-bold text-foreground mb-2'>
                                    Transfer Ownership
                                </h3>
                                <div className='relative'>
                                    <p className='text-sm text-muted-foreground blur-[3px] select-none'>
                                        Secure, admin-approved transfer of the
                                        digital certificate to the buyer.
                                    </p>
                                    <span className='absolute inset-0 flex items-center justify-center text-md font-bold text-accent bg-card/80 rounded'>
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='py-20 bg-primary'>
                <div className='container mx-auto px-6 text-center'>
                    <h2 className='text-4xl md:text-5xl font-bold mb-4 text-primary-foreground'>
                        Luxury Ownership,{' '}
                        <span className='text-accent'>Verified.</span>
                    </h2>
                    <p className='text-primary-foreground/70 max-w-xl mx-auto mb-8'>
                        Join the network of trusted dealers and collectors
                        securing the future of horology.
                    </p>
                    <Link href='/register'>
                        <Button
                            size='lg'
                            className='bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-10 text-md w-50 font-bold'
                        >
                            Register Now
                <ArrowRight className='w-6 h-6 ml-1' size={40} strokeWidth={3} />
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default Home;
