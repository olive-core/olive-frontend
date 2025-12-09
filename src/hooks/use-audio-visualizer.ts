// import { useEffect, useRef, useState } from "react";

// export function useAudioVisualizer(stream: MediaStream | null, {
//     durationSec = 30,
//     fps = 16,
// } = {}) {
//     const MAX_POINTS = durationSec * fps;
//     const [history, setHistory] = useState<number[]>(() => new Array(MAX_POINTS).fill(0));
//     const analyserRef = useRef<AnalyserNode | null>(null);
//     const rafRef = useRef<number | null>(null);

//     useEffect(() => {


//         if (!stream) return;

//         const audio = new AudioContext();
//         const source = audio.createMediaStreamSource(stream);

//         const analyser = audio.createAnalyser();
//         analyser.fftSize = 1024;
//         source.connect(analyser);

//         analyserRef.current = analyser;

//         const buffer = new Uint8Array(analyser.fftSize);

//         const loop = () => {
//             if (!analyserRef.current) return;

//             analyserRef.current.getByteTimeDomainData(buffer);

//             // RMS volume
//             let sum = 0;
//             for (let i = 0; i < buffer.length; i++) {
//                 const v = (buffer[i] - 128) / 128;
//                 sum += v * v;
//             }
//             const rms = Math.sqrt(sum / buffer.length); // 0–1

//             setHistory(prev => {
//                 const next = [...prev, rms];
//                 if (next.length > MAX_POINTS) next.shift();
//                 return next;
//             });

//             rafRef.current = requestAnimationFrame(loop);
//         };

//         loop();

//         return () => {
//             if (rafRef.current) cancelAnimationFrame(rafRef.current);
//             analyser.disconnect();
//             source.disconnect();
//             audio.close();
//         };
//     }, [stream, MAX_POINTS]);

//     return { history };
// }


import { useEffect, useRef } from "react";

export function useAudioVisualizer(
    stream: MediaStream | null,
    { durationSec = 30, fps = 16 } = {}
) {
    const MAX_POINTS = durationSec * fps;

    // Use refs instead of state
    const historyRef = useRef<number[]>(new Array(MAX_POINTS).fill(0));
    const targetRef = useRef<number[]>(new Array(MAX_POINTS).fill(0));

    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastSampleTimeRef = useRef(0);

    useEffect(() => {
        if (!stream) return;

        const audio = new AudioContext();
        const source = audio.createMediaStreamSource(stream);

        const analyser = audio.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        analyserRef.current = analyser;

        const buffer = new Uint8Array(analyser.fftSize);
        const SAMPLE_INTERVAL = 1000 / fps;

        const loop = (time: number) => {
            if (!analyserRef.current) return;

            const elapsed = time - lastSampleTimeRef.current;

            // Sample audio every SAMPLE_INTERVAL ms
            if (elapsed >= SAMPLE_INTERVAL) {
                lastSampleTimeRef.current = time;

                analyserRef.current.getByteTimeDomainData(buffer);

                let sum = 0;
                for (let i = 0; i < buffer.length; i++) {
                    const v = (buffer[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / buffer.length);

                // Shift target history
                targetRef.current = [...targetRef.current.slice(1), rms];
            }

            // Interpolate smoothly for animation
            const alpha = Math.min(elapsed / SAMPLE_INTERVAL, 1);
            for (let i = 0; i < MAX_POINTS; i++) {
                historyRef.current[i] =
                    historyRef.current[i] + (targetRef.current[i] - historyRef.current[i]) * alpha;
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            analyser.disconnect();
            source.disconnect();
            audio.close();
        };
    }, [stream, fps, MAX_POINTS]);

    return { historyRef };
}
