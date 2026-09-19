export function percent(share: number): string {
    return `${Math.round(share * 100)}%`;
}

export function shareOf(count: number, total: number): string {
    return total > 0 ? percent(count / total) : "—";
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
    return count === 1 ? singular : pluralForm;
}
