'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, X, ArrowRight } from 'lucide-react';

const DISMISS_KEY = 'mintd_kyc_banner_dismissed_at';
// Re-show the nudge after this long, so a dismiss doesn't hide it forever —
// KYC is optional until mint time, but we still want the reminder to resurface.
const RESHOW_AFTER_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

/**
 * KycBanner
 *
 * Deliberately soft-touch: KYC was moved out of onboarding so it's no longer
 * a frictional first block — it only becomes required at mint time. This
 * banner is the reminder that keeps it from being forgotten entirely,
 * without nagging every session. It should read as part of the page, not
 * as a warning — hence the tinted-accent surface instead of a loud alert
 * colour, and a dismiss control.
 */
const KycBanner = ({
    kycStatus,
}: {
    kycStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
}) => {
    const [dismissed, setDismissed] = useState(true); // default hidden until we check storage, avoids a flash

    // localStorage doesn't exist during SSR, so this genuinely can't be
    // derived at render time — reading it has to happen post-mount, which
    // is exactly what useEffect is for (syncing with a browser-only
    // external store). Reading it during the initial render instead would
    // desync the server-rendered HTML from the client's first paint and
    // trip a hydration mismatch, which is worse than the one extra render
    // this costs us. Resolved to a single boolean first so there's exactly
    // one (justified) setState call to flag, instead of three branches.
    useEffect(() => {
        function readDismissed(): boolean {
            try {
                const dismissedAt = window.localStorage.getItem(DISMISS_KEY);
                if (!dismissedAt) return false;
                return Date.now() - Number(dismissedAt) < RESHOW_AFTER_MS;
            } catch {
                // localStorage unavailable (e.g. private browsing) — just show it
                return false;
            }
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
        setDismissed(readDismissed());
    }, []);

    if (!kycStatus || kycStatus === 'APPROVED' || dismissed) return null;

    const copy =
        kycStatus === 'PENDING'
            ? {
                  title: "You're verified as soon as we finish reviewing.",
                  body: 'Your identity documents are in review. We’ll email you the moment it’s approved — no action needed for now.',
                  cta: null as null,
              }
            : kycStatus === 'REJECTED'
              ? {
                    title: 'Your verification needs another look.',
                    body: 'Something didn’t clear review. Resubmit your documents so you’re ready to mint whenever you are.',
                    cta: 'Resubmit verification',
                }
              : {
                    title: 'Complete verification to unlock minting.',
                    body: 'You can browse and register watches freely. Verifying your identity is quick, and only needed the moment you’re ready to turn one into an NFT certificate.',
                    cta: 'Complete verification',
                };

    const handleDismiss = () => {
        setDismissed(true);
        try {
            window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
            // ignore — worst case it reappears next visit
        }
    };

    return (
        <div className='relative rounded-2xl border border-accent/20 bg-accent/[0.06] px-5 py-4 sm:px-6 sm:py-5 mb-8 overflow-hidden'>
            {/* Subtle decorative ring, echoes the hero mockup's orbit motif so this reads as "on-brand" rather than a bolted-on alert */}
            <div className='pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full border border-accent/10' />

            <div className='relative flex items-start gap-4'>
                <div className='shrink-0 w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center'>
                    <ShieldCheck className='w-4.5 h-4.5 text-accent' />
                </div>

                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-foreground'>
                        {copy.title}
                    </p>
                    <p className='text-sm text-muted-foreground mt-0.5 max-w-2xl'>
                        {copy.body}
                    </p>

                    {copy.cta && (
                        <Link
                            href='/kyc'
                            className='inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors mt-2'
                        >
                            {copy.cta}
                            <ArrowRight className='w-3.5 h-3.5' />
                        </Link>
                    )}
                </div>

                <button
                    onClick={handleDismiss}
                    aria-label='Dismiss'
                    className='shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors p-1 -m-1 rounded-md'
                >
                    <X className='w-4 h-4' />
                </button>
            </div>
        </div>
    );
};

export default KycBanner;
