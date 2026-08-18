import WatchRegisterWizard from '@/components/watch-register/WatchRegisterWizard';

const RegisterWatchPage = () => {
    return (
        <div className='min-h-screen bg-background'>
            <div className='container mx-auto px-6 pt-28 md:pt-32 pb-24'>
                <div className='text-center max-w-xl mx-auto mb-10'>
                    <h1 className='text-3xl md:text-4xl font-bold text-foreground'>
                        Register a <span className='italic text-accent'>Watch</span>
                    </h1>
                    <p className='text-muted-foreground mt-2'>
                        Tell us about your timepiece. We&apos;ll verify it
                        against our catalogue and it&apos;ll be waiting in
                        your vault, ready to certify whenever you are.
                    </p>
                </div>

                <WatchRegisterWizard />
            </div>
        </div>
    );
};

export default RegisterWatchPage;
