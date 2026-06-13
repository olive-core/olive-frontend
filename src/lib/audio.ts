// Root-mean-square loudness of a time-domain buffer from an AnalyserNode (bytes centered on 128).
// Returns 0 (silence) to ~1 (full scale).
export function computeRms(timeDomain: Uint8Array): number {
    let sumOfSquares = 0;
    for (let i = 0; i < timeDomain.length; i++) {
        const amplitude = (timeDomain[i] - 128) / 128;
        sumOfSquares += amplitude * amplitude;
    }
    return Math.sqrt(sumOfSquares / timeDomain.length);
}
