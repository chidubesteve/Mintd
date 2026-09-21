'use client';

import Link from 'next/link';
import { Clock, Users, Watch as WatchIcon, ArrowRight } from 'lucide-react';
import { useAdminStats } from '@/hooks/queries/useAdmin';

const StatCard = ({
    label,
    value,
    icon,
    isLoading,
}: {
    label: string;
    value: number | undefined;
    icon: React.ReactNode;
    isLoading: boolean;
}) => (
    <div className='rounded-xl border border-border bg-card p-5 flex items-center gap-4'>
        <div className='w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0'>
            {icon}
        </div>
        <div>
            <p className='text-2xl font-bold text-foreground'>
                {isLoading ? '…' : (value ?? 0)}
            </p>
            <p className='text-xs text-muted-foreground'>{label}</p>
        </div>
    </div>
);

const AdminDashboardPage = () => {
    const { data: stats, isLoading } = useAdminStats();

    return (
        <div className='space-y-8'>
            <div>
                <h1 className='text-3xl font-bold text-foreground'>
                    Admin <span className='text-accent italic'>Dashboard</span>
                </h1>
                <p className='text-muted-foreground mt-1'>
                    An overview of what needs attention.
                </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <StatCard
                    label='Pending review'
                    value={stats?.pendingReviewCount}
                    icon={<Clock className='w-5 h-5' />}
                    isLoading={isLoading}
                />
                <StatCard
                    label='Total watches'
                    value={stats?.totalWatches}
                    icon={<WatchIcon className='w-5 h-5' />}
                    isLoading={isLoading}
                />
                <StatCard
                    label='Total users'
                    value={stats?.totalUsers}
                    icon={<Users className='w-5 h-5' />}
                    isLoading={isLoading}
                />
            </div>

            <Link
                href='/admin/watches'
                className='flex items-center justify-between p-5 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors group'
            >
                <div>
                    <p className='text-sm font-medium text-foreground'>
                        Review pending watches
                    </p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                        Approve or reject watches waiting on a catalogue
                        decision.
                    </p>
                </div>
                <ArrowRight className='w-4 h-4 text-accent shrink-0 transition-transform group-hover:translate-x-1' />
            </Link>
        </div>
    );
};

export default AdminDashboardPage;
