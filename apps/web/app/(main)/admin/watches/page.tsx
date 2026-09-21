'use client';

import { useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Check, X, Loader2 } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { usePendingReviewWatches } from '@/hooks/queries/useAdmin';
import { useApproveWatch, useRejectWatch } from '@/hooks/mutations/useAdminMutations';
import type { PendingReviewWatch } from '@/services/Admin.service';

const columns: ColumnDef<PendingReviewWatch>[] = [
    {
        header: 'Watch',
        cell: ({ row }) => (
            <div>
                <p className='font-medium text-foreground'>
                    {row.original.brand} {row.original.model}
                </p>
                {row.original.reference && (
                    <p className='text-xs text-muted-foreground font-mono'>
                        Ref. {row.original.reference}
                    </p>
                )}
            </div>
        ),
    },
    {
        header: 'Owner',
        cell: ({ row }) => (
            <div>
                <p className='text-foreground'>
                    {row.original.owner.fName} {row.original.owner.lName}
                </p>
                <p className='text-xs text-muted-foreground'>
                    {row.original.owner.email}
                </p>
            </div>
        ),
    },
    {
        header: 'Reason',
        cell: ({ row }) => (
            <div className='flex items-center gap-2'>
                {row.original.isCustomBrand && (
                    <Badge variant='muted'>Custom brand</Badge>
                )}
                <p className='text-xs text-muted-foreground max-w-72 truncate'>
                    {row.original.adminNote || 'Not found in catalogue.'}
                </p>
            </div>
        ),
    },
    {
        header: 'Registered',
        accessorKey: 'createdAt',
        cell: ({ row }) =>
            new Date(row.original.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
    },
];

const AdminWatchesPage = () => {
    const { data: watches, isLoading } = usePendingReviewWatches();
    const approveWatch = useApproveWatch();
    const rejectWatch = useRejectWatch();

    const [approveTarget, setApproveTarget] = useState<PendingReviewWatch | null>(
        null,
    );
    const [rejectTarget, setRejectTarget] = useState<PendingReviewWatch | null>(
        null,
    );
    const [rejectReason, setRejectReason] = useState('');

    const table = useReactTable({
        data: watches ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    function handleApprove(addToCatalogue: boolean) {
        if (!approveTarget) return;
        approveWatch.mutate(
            { watchId: approveTarget._id, addToCatalogue },
            { onSuccess: () => setApproveTarget(null) },
        );
    }

    function handleReject() {
        if (!rejectTarget || !rejectReason.trim()) return;
        rejectWatch.mutate(
            { watchId: rejectTarget._id, reason: rejectReason.trim() },
            {
                onSuccess: () => {
                    setRejectTarget(null);
                    setRejectReason('');
                },
            },
        );
    }

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-3xl font-bold text-foreground'>
                    Catalogue <span className='text-accent italic'>review</span>
                </h1>
                <p className='text-muted-foreground mt-1'>
                    Watches waiting on a decision before they can be minted.
                </p>
            </div>

            <div className='rounded-xl border border-border bg-card overflow-hidden'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </TableHead>
                                ))}
                                <TableHead className='text-right'>Actions</TableHead>
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className='text-center py-10 text-muted-foreground'>
                                    Loading…
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className='text-center py-10 text-muted-foreground'>
                                    Nothing waiting on review.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                    <TableCell className='text-right'>
                                        <div className='flex items-center justify-end gap-2'>
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                className='cursor-pointer'
                                                onClick={() => setRejectTarget(row.original)}
                                            >
                                                <X className='w-3.5 h-3.5' />
                                                Reject
                                            </Button>
                                            <Button
                                                size='sm'
                                                className='bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer'
                                                onClick={() => setApproveTarget(row.original)}
                                            >
                                                <Check className='w-3.5 h-3.5' />
                                                Approve
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Approve dialog */}
            <Dialog
                open={!!approveTarget}
                onOpenChange={(open) => !open && setApproveTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Approve {approveTarget?.brand} {approveTarget?.model}
                        </DialogTitle>
                        <DialogDescription>
                            This marks the watch as catalogue-matched. You can
                            also add it to the shared catalogue so future
                            submissions of this exact brand/model/reference
                            match automatically, instead of approving each one
                            individually.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            className='cursor-pointer'
                            disabled={approveWatch.isPending}
                            onClick={() => handleApprove(false)}
                        >
                            {approveWatch.isPending ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                            ) : (
                                'Approve this one only'
                            )}
                        </Button>
                        <Button
                            className='bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer'
                            disabled={approveWatch.isPending}
                            onClick={() => handleApprove(true)}
                        >
                            {approveWatch.isPending ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                            ) : (
                                'Approve and add to catalogue'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject dialog */}
            <Dialog
                open={!!rejectTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setRejectTarget(null);
                        setRejectReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Reject {rejectTarget?.brand} {rejectTarget?.model}
                        </DialogTitle>
                        <DialogDescription>
                            The owner will see this reason on their watch.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-2'>
                        <Label htmlFor='reject-reason'>Reason</Label>
                        <Textarea
                            id='reject-reason'
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Details don't match any known reference for this brand."
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant='destructive'
                            className='cursor-pointer'
                            disabled={!rejectReason.trim() || rejectWatch.isPending}
                            onClick={handleReject}
                        >
                            {rejectWatch.isPending ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                            ) : (
                                'Reject watch'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminWatchesPage;
