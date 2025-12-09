import { useAudioVisualizer } from "@/hooks/use-audio-visualizer";
import { memo, useEffect, useRef } from "react";

function AudioVisualizer({ stream }: { stream: MediaStream | null }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { historyRef } = useAudioVisualizer(stream, { durationSec: 25, fps: 20 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const draw = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            const history = historyRef.current;
            const barWidth = width / history.length;

            history.forEach((v, i) => {
                const barHeight = v * height;
                ctx.fillStyle = "#059669";
                ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
            });

            requestAnimationFrame(draw);
        };

        draw();
    }, [historyRef]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={150}
            className="w-full h-[150px] bg-emerald-500/10 block"
        />
    );
}

export const AudioVisualizerMemo = memo(AudioVisualizer);

