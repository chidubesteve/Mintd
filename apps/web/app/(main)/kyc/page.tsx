'use client';

import { useEffect } from 'react';
import { DiditSdk } from '@didit-protocol/sdk-web';
import { ShieldCheck, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/Auth.store';
import { refreshSession } from '@/services/Auth.service';
import { useStartKyc } from '@/hooks/mutations/useKycMutations';

const STATUS_COPY: Record<
    'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED',
    { title: string; body: string; cta: string | null }
> = {
    NOT_SUBMITTED: {
        title: 'Verify your identity',
        body: "You'll need a government ID and a quick selfie. Didit's decision engine reviews it automatically, usually within seconds.",
        cta: 'Start verification',
    },
    PENDING: {
        title: "You're verified as soon as we finish reviewing.",
        body: 'Your verification is in review. This page updates automatically once a decision comes back.',
        cta: null,
    },
    APPROVED: {
        title: "You're verified.",
        body: "Your identity has been verified. You're all set to proceed to minting once a watch is ready.",
        cta: null,
    },
    REJECTED: {
        title: 'Your verification needs another look.',
        body: "Something didn't clear review. Try again with clearer photos of your ID and a well-lit selfie.",
        cta: 'Resubmit verification',
    },
};

const KycPage = () => {
    const { user, setAuth } = useAuthStore();
    const kycStatus = user?.kycStatus ?? 'NOT_SUBMITTED';
    const { mutate: startKyc, isPending } = useStartKyc();

    // The modal's own completion result is a UI hint only (per Didit's own
    // guidance — it's not proof of approval, the webhook is), but it's a
    // reliable signal that the decision has probably landed by now, so it's
    // a good moment to re-pull the real kycStatus rather than waiting for
    // the user to navigate somewhere else. One retry a few seconds later in
    // case the webhook is a beat behind the modal closing.
    useEffect(() => {
        DiditSdk.shared.onComplete = (result) => {
            if (result.type !== 'completed') return;

            const pull = () =>
                refreshSession()
                    .then(({ user: freshUser, accessToken: freshToken }) =>
                        setAuth(freshUser, freshToken),
                    )
                    .catch(() => {});

            pull();
            setTimeout(pull, 4000);
        };
    }, [setAuth]);

    const copy = STATUS_COPY[kycStatus];

    const statusColour = {
        NOT_SUBMITTED: 'bg-muted-foreground',
        PENDING: 'bg-yellow-500',
        APPROVED: 'bg-accent',
        REJECTED: 'bg-destructive',
    }[kycStatus];

    return (
        <div className='min-h-screen bg-background'>
            <div className='container mx-auto px-6 xl:max-w-[calc(100%-6rem)] pt-28 md:pt-32 pb-24 max-w-2xl'>
                <h1 className='text-3xl md:text-4xl font-bold text-foreground'>
                    Identity <span className='italic text-accent'>Verification</span>
                </h1>

                <div className='mt-8 rounded-2xl border border-border/50 bg-card px-6 py-6'>
                    <div className='flex items-start gap-4'>
                        <div className='shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center'>
                            <ShieldCheck className='w-5 h-5 text-accent' />
                        </div>

                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1.5 mb-1'>
                                <div
                                    className={`w-1.5 h-1.5 rounded-full ${statusColour}`}
                                />
                                <span className='text-xs text-muted-foreground capitalize'>
                                    {kycStatus.replace('_', ' ').toLowerCase()}
                                </span>
                            </div>

                            <p className='text-base font-semibold text-foreground'>
                                {copy.title}
                            </p>
                            <p className='text-sm text-muted-foreground mt-1'>
                                {copy.body}
                            </p>

                            {copy.cta && (
                                <Button
                                    size='lg'
                                    className='bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-6 mt-5'
                                    onClick={() => startKyc()}
                                    disabled={isPending}
                                >
                                    {isPending && (
                                        <Loader2 className='size-4 animate-spin' />
                                    )}
                                    {isPending ? 'Starting…' : copy.cta}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KycPage;
