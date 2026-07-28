import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useUpdateConsultationSetting } from "@/hooks/use-consultation-settings";
import { CONSULTATION_SETTINGS, type ConsultationSetting } from "./consultation-settings";
import DisableSettingDialog from "./disable-setting-dialog";

interface ConsultationSettingsCardProps {
    clinicianData: Record<string, unknown>;
}

function SettingSwitch({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onToggle}
            className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${checked ? "bg-emerald-500" : "bg-gray-300"}`}
        >
            <div className={`size-4 rounded-full bg-white shadow-md transition ${checked ? "translate-x-5" : "translate-x-0"}`} />
        </button>
    );
}

function SettingRow({
    setting,
    checked,
    onToggle,
}: {
    setting: ConsultationSetting;
    checked: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-900">{setting.label}</p>
                <p className="text-xs text-slate-700">{setting.description}</p>
                {!checked && (
                    <p className="mt-1 text-xs font-medium text-amber-700">Currently off</p>
                )}
            </div>
            <SettingSwitch checked={checked} onToggle={onToggle} />
        </div>
    );
}

// Both settings default to on. Turning one on saves immediately; turning one off routes
// through the confirmation dialog first.
export default function ConsultationSettingsCard({ clinicianData }: ConsultationSettingsCardProps) {
    const [pendingDisable, setPendingDisable] = useState<ConsultationSetting | null>(null);
    const updateSetting = useUpdateConsultationSetting();

    const isEnabled = (setting: ConsultationSetting) => clinicianData[setting.key] !== false;

    const handleToggle = (setting: ConsultationSetting) => {
        if (isEnabled(setting)) {
            setPendingDisable(setting);
            return;
        }
        updateSetting.mutate({ key: setting.key, enabled: true });
    };

    const confirmDisable = (reason: string) => {
        if (!pendingDisable) return;
        updateSetting.mutate(
            { key: pendingDisable.key, enabled: false, reason },
            { onSuccess: () => setPendingDisable(null) },
        );
    };

    return (
        <>
            <Card className="w-full">
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Consultation settings
                        </p>
                        <p className="text-xs text-slate-700">
                            These change what every consultation produces and what your patients receive.
                        </p>
                    </div>

                    {CONSULTATION_SETTINGS.map((setting) => (
                        <SettingRow
                            key={setting.key}
                            setting={setting}
                            checked={isEnabled(setting)}
                            onToggle={() => handleToggle(setting)}
                        />
                    ))}
                </CardContent>
            </Card>

            <DisableSettingDialog
                setting={pendingDisable}
                isSaving={updateSetting.isPending}
                onCancel={() => setPendingDisable(null)}
                onConfirm={confirmDisable}
            />
        </>
    );
}
