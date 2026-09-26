import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function OpenCaseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [code, setCode] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: () => api.post<{ root_session_id: string }>('/case/open', { code }),
        onSuccess: async ({ data }) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['clinician-consultations'] }),
                queryClient.invalidateQueries({ queryKey: ['patient-consultations'] }),
                queryClient.invalidateQueries({ queryKey: ['consultation-detail'] }),
                queryClient.invalidateQueries({ queryKey: ['case-detail', data.root_session_id] }),
            ]);
            onOpenChange(false);
            setCode('');
            navigate({ to: '/doctor/cases/$caseId', params: { caseId: data.root_session_id } });
        },
    });
    const error = mutation.error as { response?: { data?: { detail?: string } } } | null;
    return (
        <Dialog open={open} onOpenChange={(next) => { onOpenChange(next); mutation.reset(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Open a case</DialogTitle>
                    <DialogDescription>Enter the code from the medical sheet or another doctor to view the case and add follow-ups.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!mutation.isPending) mutation.mutate(); }}>
                    <div className="space-y-2">
                        <label htmlFor="case-code" className="text-sm font-medium text-slate-700">Case code</label>
                        <Input id="case-code" value={code} onChange={(event) => { setCode(event.target.value); mutation.reset(); }}
                            placeholder="7KMP-4XRT" maxLength={32} autoComplete="off" autoCapitalize="characters" spellCheck={false}
                            className="h-14 text-center font-mono text-lg tracking-widest uppercase" aria-describedby="case-code-help" />
                        <p id="case-code-help" className="text-xs text-slate-500">Eight letters and numbers. Spaces and the dash are optional.</p>
                    </div>
                    {error && <p role="alert" className="text-sm text-rose-600">{error.response?.data?.detail ?? 'Could not open the case. Please try again.'}</p>}
                    <Button type="submit" disabled={mutation.isPending || code.replace(/[\s-]/g, '').length !== 8}
                        isLoading={mutation.isPending} className="min-h-11 w-full bg-emerald-600 hover:bg-emerald-700">
                        Open case <ArrowRightIcon className="size-4" />
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
