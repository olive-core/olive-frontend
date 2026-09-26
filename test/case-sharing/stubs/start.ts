export const starts: unknown[][] = [];
export function useStartConsultation() {
    return { start: (...args: unknown[]) => starts.push(args), startingSourceSessionId: null, graceDialog: null };
}
