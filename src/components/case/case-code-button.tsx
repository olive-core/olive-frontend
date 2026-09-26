import { CheckIcon, CopyIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { formatCaseCode } from '@/lib/case-code';
import { cn } from '@/lib/utils';

export default function CaseCodeButton({ code, className }: { code: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(formatCaseCode(code));
            setCopied(true);
            toast.success('Case code copied');
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy. Select the code to copy it manually.');
        }
    };

    return (
        <button type="button" onClick={(event) => { event.stopPropagation(); void copy(); }}
            aria-label={`Copy case code ${formatCaseCode(code)}`}
            className={cn('inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600', className)}>
            <span className="select-text font-mono text-sm font-semibold tracking-wider">{formatCaseCode(code)}</span>
            {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
        </button>
    );
}
