export type MicVerdict = "clear" | "faint" | "muted";

// A muted mic (keyboard mic-mute key, or the OS input muted) delivers digital silence.
// A quiet room does not: with autoGainControl on, ambient noise sits above this floor.
// Shared with the in-session silence monitor so the two can never disagree.
export const SILENT_RMS = 0.008;

// Below this, speech reaches the transcript too faint to be reliable.
export const CLEAR_RMS = 0.04;

export function verdictFor(peakRms: number): MicVerdict {
    if (peakRms < SILENT_RMS) return "muted";
    if (peakRms < CLEAR_RMS) return "faint";
    return "clear";
}

// Verdicts stay general — the specific things to check live on the device-check page,
// where there is room to say they are common cases rather than the only ones.
export const MIC_VERDICT_COPY: Record<MicVerdict, { title: string; detail: string }> = {
    clear: {
        title:  "Your mic sounds clear",
        detail: "Olive will hear your consultations at this level.",
    },
    faint: {
        title:  "Your voice is very faint",
        detail: "Move closer to the mic, or try a different input and test again.",
    },
    muted: {
        title:  "No sound is reaching Olive",
        detail: "Check that your microphone is connected and unmuted.",
    },
};

export const MIC_TEST_DURATION_MS = 5000;
