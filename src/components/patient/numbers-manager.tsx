import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PhoneIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NumberGroupInputMemo from "@/components/dashboard/number-group-input";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { addNumber, listNumbers, removeNumber } from "@/lib/patient";
import { handleError } from "@/lib/utils";

const OTP_LENGTH = 6;
const emptyPhone = () => ["0", "1"].concat(Array(9).fill(""));
const emptyOtp = () => Array(OTP_LENGTH).fill("");

// Add or remove the numbers that can reach a patient. A new number must confirm an
// OTP sent to it, so a profile can't be linked to a stranger's number by mistake. The
// number the person is signed in with can't be removed, so they never lock themselves out.
export default function NumbersManager({ patientId }: { patientId: string }) {
    const currentUserId = useAuthStore((s) => s.userId);
    const queryClient = useQueryClient();
    const [step, setStep] = useState<"idle" | "phone" | "otp">("idle");
    const [phone, setPhone] = useState<string[]>(emptyPhone);
    const [otp, setOtp] = useState<string[]>(emptyOtp);
    const [busy, setBusy] = useState(false);

    const { data: numbers = [] } = useQuery({
        queryKey: ["patient-numbers", patientId],
        queryFn: () => listNumbers(patientId),
    });

    const reset = () => {
        setStep("idle");
        setPhone(emptyPhone());
        setOtp(emptyOtp());
    };

    // These are passed as NumberGroupInput's onComplete, which fires from an effect keyed
    // on the handler's identity — so they MUST be memoized, or a re-render mid-send would
    // re-fire and send a second OTP. Deps are the values each one actually reads.
    const sendCode = useCallback(async (isComplete: boolean) => {
        if (!isComplete) return;
        setBusy(true);
        try {
            await api.post("/auth/send-otp", { phone: "+88" + phone.join("").trim() });
            toast.success("Code sent to that number");
            setOtp(emptyOtp());
            setStep("otp");
        } catch (error) {
            handleError(error, "Could not send a code to this number");
        } finally {
            setBusy(false);
        }
    }, [phone]);

    const confirmAndAdd = useCallback(async (isComplete: boolean) => {
        if (!isComplete) return;
        setBusy(true);
        try {
            await addNumber(patientId, "+88" + phone.join("").trim(), otp.join("").trim());
            toast.success("Number added");
            setStep("idle");
            setPhone(emptyPhone());
            setOtp(emptyOtp());
            queryClient.invalidateQueries({ queryKey: ["patient-numbers", patientId] });
        } catch (error) {
            handleError(error, "Could not add this number");
        } finally {
            setBusy(false);
        }
    }, [patientId, phone, otp, queryClient]);

    const onRemove = async (targetUserId: string) => {
        try {
            await removeNumber(patientId, targetUserId);
            toast.success("Number removed");
            queryClient.invalidateQueries({ queryKey: ["patient-numbers", patientId] });
        } catch (error) {
            handleError(error, "Could not remove this number");
        }
    };

    return (
        <Card className="mt-4">
            <CardContent className="py-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">Numbers that can reach this profile</h2>
                    {step === "idle" && (
                        <Button variant="ghost" size="sm" onClick={() => setStep("phone")}>
                            <PlusIcon className="size-4" /> Add
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    {numbers.map((number) => (
                        <div key={number.user_id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                            <span className="flex items-center gap-2 text-sm text-slate-700">
                                <PhoneIcon className="size-4 text-slate-400" /> {number.phone}
                            </span>
                            {number.user_id !== currentUserId ? (
                                <button type="button" onClick={() => onRemove(number.user_id)} className="cursor-pointer text-slate-400 hover:text-rose-500" aria-label="Remove number">
                                    <Trash2Icon className="size-4" />
                                </button>
                            ) : (
                                <span className="text-[10px] text-slate-400">This device</span>
                            )}
                        </div>
                    ))}
                </div>

                {step === "phone" && (
                    <div className="mt-4 flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground">We'll text a code to this number to confirm it.</p>
                        <NumberGroupInputMemo numberInput={phone} setNumberInput={setPhone} onComplete={sendCode} />
                        {busy && <p className="text-center text-sm text-muted-foreground">Sending code…</p>}
                        <Button variant="ghost" size="sm" className="self-start" onClick={reset} disabled={busy}>Cancel</Button>
                    </div>
                )}

                {step === "otp" && (
                    <div className="mt-4 flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground">Enter the code sent to {"+88" + phone.join("").trim()}.</p>
                        <NumberGroupInputMemo
                            numberInput={otp}
                            setNumberInput={setOtp}
                            onComplete={confirmAndAdd}
                            inputLength={OTP_LENGTH}
                            secondGroupStartIndex={-1}
                            dynamicValuesStartIndex={0}
                            groupLabel="One-time passcode"
                            autoComplete="one-time-code"
                        />
                        {busy && <p className="text-center text-sm text-muted-foreground">Adding…</p>}
                        <Button variant="ghost" size="sm" className="self-start" onClick={reset} disabled={busy}>Cancel</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
