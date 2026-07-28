import { computeRms } from "./audio";

export interface MicMeter {
    /** Loudest RMS seen since the meter opened, or since the last resetPeak(). */
    peakRms: () => number;
    /** Most recent RMS reading, for a live level bar. */
    currentRms: () => number;
    /** Starts a fresh peak window, so a measurement covers only what follows. */
    resetPeak: () => void;
    close: () => void;
}

// Opens one AudioContext over a live stream and keeps a running peak. Callers read it
// on their own cadence (animation frame, interval), so no reading loop is imposed here.
export function openMicMeter(stream: MediaStream): MicMeter {
    const audio = new AudioContext();
    const source = audio.createMediaStreamSource(stream);
    const analyser = audio.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);

    const buffer = new Uint8Array(analyser.fftSize);
    let peak = 0;

    const read = () => {
        analyser.getByteTimeDomainData(buffer);
        const rms = computeRms(buffer);
        if (rms > peak) peak = rms;
        return rms;
    };

    return {
        peakRms:    () => peak,
        currentRms: read,
        resetPeak:  () => { peak = 0; },
        close: () => {
            analyser.disconnect();
            source.disconnect();
            void audio.close();
        },
    };
}

export async function requestMicStream(deviceId?: string): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
    });
}

export function stopStream(stream: MediaStream | null): void {
    stream?.getTracks().forEach((track) => track.stop());
}

export function inputLabelOf(stream: MediaStream): string {
    return stream.getAudioTracks()[0]?.label || "Default microphone";
}

export function activeDeviceIdOf(stream: MediaStream): string {
    return stream.getAudioTracks()[0]?.getSettings().deviceId ?? "";
}

export interface AudioInput {
    deviceId: string;
    label:    string;
}

// Only callable meaningfully once permission is granted: before that, browsers return
// entries with blank labels, which are useless in a picker.
export async function listAudioInputs(): Promise<AudioInput[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
        .filter((device) => device.kind === "audioinput" && device.deviceId)
        .map((device, index) => ({
            deviceId: device.deviceId,
            label:    device.label || `Microphone ${index + 1}`,
        }));
}
