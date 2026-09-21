import { Fragment, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useUpdateConsultationSetting } from "@/hooks/use-consultation-settings";
import { CONSULTATION_SETTINGS, type ConsultationSetting } from "./consultation-settings";
import DraftingPreference from "./drafting-preference";
import DisableSettingDialog from "./disable-setting-dialog";

interface ConsultationSettingsCardProps {
    clinicianData: Record<string, unknown>;
}

function SettingSwitch({ checked, onToggle, label, disabled }: { checked: boolean; onToggle: () => void; label: string; disabled: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={onToggle}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
            <span className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${checked ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`size-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${checked ? "translate-x-5" : "translate-x-0"}`} /></span>
        </button>
    );
}

function SettingRow({
    setting,
    checked,
    onToggle,
    disabled,
}: {
    setting: ConsultationSetting;
    checked: boolean;
    onToggle: () => void;
    disabled: boolean;
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
            <SettingSwitch checked={checked} onToggle={onToggle} label={setting.label} disabled={disabled} />
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
            <Card className="w-full border-slate-200/80 shadow-none">
                <CardContent className="flex flex-col gap-4">
                    {CONSULTATION_SETTINGS.map((setting) => (
                        <Fragment key={setting.key}>
                            <div className={setting.key === 'prescription_sms_enabled' ? 'border-t border-slate-100 pt-5' : ''}>
                                <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{setting.key === 'prescription_enabled' ? 'Prescription workflow' : 'Patient delivery'}</p>
                                <SettingRow
                                    setting={setting}
                                    checked={isEnabled(setting)}
                                    disabled={updateSetting.isPending || (setting.key === 'prescription_sms_enabled' && clinicianData.prescription_enabled === false)}
                                    onToggle={() => handleToggle(setting)}
                                />
                                {setting.key === 'prescription_sms_enabled' && clinicianData.prescription_enabled === false && <p className="mt-3 text-xs leading-relaxed text-amber-700">Your SMS preference is saved. It takes effect when prescription writing is enabled.</p>}
                            </div>
                            {setting.key === 'prescription_enabled' && <div className="border-t border-slate-100 pt-5"><DraftingPreference embedded enabled={clinicianData.generate_ai_draft !== false} prescriptionsEnabled={clinicianData.prescription_enabled !== false} /></div>}
                        </Fragment>
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
