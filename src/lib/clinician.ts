// Formats a clinician's name for display with exactly one "Dr." honorific. Doctors often
// save their name already prefixed (e.g. "Dr. Ahsan Habib"), so blindly prepending "Dr. "
// yields "Dr. Dr. Ahsan Habib". This prepends only when the name doesn't already start
// with "Dr"/"Dr." — the word boundary keeps names like "Drake" from being mistaken for it.
export function withDoctorPrefix(name?: string | null): string {
    const trimmed = (name ?? "").trim();
    if (!trimmed) return "";
    return /^dr\.?(\s|$)/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
}

export function withDoctorFirstName(name?: string | null): string {
    const withoutTitle = (name ?? "").trim().replace(/^(?:dr\.\s*|dr\s+|doctor\s+|ডা[.:]?\s*)/i, "");
    const firstName = withoutTitle.split(/\s+/)[0];
    return firstName ? `Dr. ${firstName}` : "Your account";
}
