// Levenshtein distance that gives up (returns Infinity) once it exceeds maxDistance,
// so most non-matches are rejected in O(1) by the length pre-check.
export function boundedLevenshtein(a: string, b: string, maxDistance: number): number {
    if (Math.abs(a.length - b.length) > maxDistance) return Infinity;
    if (a === b) return 0;

    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const current = [i];
        let rowBest = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            const distance = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
            current.push(distance);
            if (distance < rowBest) rowBest = distance;
        }
        if (rowBest > maxDistance) return Infinity;
        previous = current;
    }
    return previous[b.length] <= maxDistance ? previous[b.length] : Infinity;
}

// Anchors typo tolerance to the start of the name, so a trailing strength
// ("Paracetamol 500 mg") never inflates the distance — mirrors MedEx.
export function prefixDistance(key: string, query: string, maxDistance: number): number {
    return boundedLevenshtein(key.slice(0, query.length), query, maxDistance);
}
