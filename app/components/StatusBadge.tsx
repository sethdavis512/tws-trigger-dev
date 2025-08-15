import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

export function StatusBadge({ status }: { status: string }) {
    const base =
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium border';
    if (status === 'COMPLETED' || status === 'SUCCESS') {
        return (
            <span
                className={`${base} border-emerald-600/30 bg-emerald-600/10 text-emerald-400`}
            >
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
        );
    }
    if (status === 'FAILED' || status === 'CANCELED') {
        return (
            <span
                className={`${base} border-red-600/30 bg-red-600/10 text-red-400`}
            >
                <XCircle className="h-3.5 w-3.5" />{' '}
                {status === 'FAILED' ? 'Failed' : 'Canceled'}
            </span>
        );
    }
    if (status === 'FAILED' || status === 'CANCELED') {
        return (
            <span
                className={`${base} border-red-600/30 bg-red-600/10 text-red-400`}
            >
                <XCircle className="h-3.5 w-3.5" />{' '}
                {status === 'FAILED' ? 'Failed' : 'Canceled'}
            </span>
        );
    }
    if (status === 'EXECUTING' || status === 'QUEUED' || status === 'RUNNING') {
        return (
            <span
                className={`${base} border-emerald-600/30 bg-emerald-600/10 text-emerald-400`}
            >
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> In progress
            </span>
        );
    }
    return (
        <span
            className={`${base} border-zinc-600/30 bg-zinc-600/10 text-zinc-300`}
        >
            <Clock className="h-3.5 w-3.5" /> Idle
        </span>
    );
}
