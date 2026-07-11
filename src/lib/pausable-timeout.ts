// A setTimeout that survives pause/resume. Browser timers cannot be paused, so the
// remaining delay is tracked explicitly and a fresh timeout is armed with what's left.
export class PausableTimeout {
    private timeoutId: number | null = null;
    private startedAt = 0;
    private remainingMs: number;
    private readonly onFire: () => void;

    constructor(remainingMs: number, onFire: () => void) {
        this.remainingMs = remainingMs;
        this.onFire = onFire;
    }

    start(): void {
        this.startedAt = Date.now();
        this.timeoutId = window.setTimeout(this.onFire, this.remainingMs);
    }

    pause(): void {
        if (this.timeoutId === null) return;
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        this.remainingMs = Math.max(0, this.remainingMs - (Date.now() - this.startedAt));
    }

    cancel(): void {
        if (this.timeoutId !== null) clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }
}
