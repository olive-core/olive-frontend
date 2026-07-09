import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PhoneIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NumberGroupInputMemo from "@/components/dashboard/number-group-input";
import { useAuthStore } from "@/stores/auth-store";
import { addNumber, listNumbers, removeNumber } from "@/lib/patient";
import { handleError } from "@/lib/utils";

const emptyPhone = () => ["0", "1"].concat(Array(9).fill(""));

// Add or remove the numbers that can reach a patient. The number the person is
// signed in with can't be removed, so a profile is never locked away from them.
export default function NumbersManager({ patientId }: { patientId: string }) {
    const currentUserId = useAuthStore((s) => s.userId);
    const queryClient = useQueryClient();
    const [adding, setAdding] = useState(false);
    const [phone, setPhone] = useState<string[]>(emptyPhone);
    const [busy, setBusy] = useState(false);

    const { data: numbers = [] } = useQuery({
        queryKey: ["patient-numbers", patientId],
        queryFn: () => listNumbers(patientId),
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["patient-numbers", patientId] });

    const onComplete = async (isComplete: boolean) => {
        if (!isComplete) return;
        setBusy(true);
        try {
            await addNumber(patientId, "+88" + phone.join("").trim());
            toast.success("Number added");
            setAdding(false);
            setPhone(emptyPhone());
            refresh();
        } catch (error) {
            handleError(error, "Could not add this number");
        } finally {
            setBusy(false);
        }
    };

    const onRemove = async (targetUserId: string) => {
        try {
            await removeNumber(patientId, targetUserId);
            toast.success("Number removed");
            refresh();
        } catch (error) {
            handleError(error, "Could not remove this number");
        }
    };

    return (
        <Card className="mt-4">
            <CardContent className="py-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">Numbers that can reach this profile</h2>
                    <Button variant="ghost" size="sm" onClick={() => setAdding((a) => !a)}>
                        <PlusIcon className="size-4" /> Add
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    {numbers.map((number) => (
                        <div key={number.user_id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                            <span className="flex items-center gap-2 text-sm text-slate-700">
                                <PhoneIcon className="size-4 text-slate-400" /> {number.phone}
                            </span>
                            {number.user_id !== currentUserId ? (
                                <button type="button" onClick={() => onRemove(number.user_id)} className="text-slate-400 hover:text-rose-500" aria-label="Remove number">
                                    <Trash2Icon className="size-4" />
                                </button>
                            ) : (
                                <span className="text-[10px] text-slate-400">This device</span>
                            )}
                        </div>
                    ))}
                </div>

                {adding && (
                    <div className="mt-3">
                        <NumberGroupInputMemo numberInput={phone} setNumberInput={setPhone} onComplete={onComplete} />
                        {busy && <p className="mt-2 text-center text-sm text-muted-foreground">Adding…</p>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
