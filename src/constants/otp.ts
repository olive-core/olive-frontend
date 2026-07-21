// Shared by every OTP screen so the rules cannot drift between them.

export const OTP_LENGTH = 6;

// Doubles as the resend cooldown, so a replacement is only obtainable once the previous
// code has died and two valid codes can never coexist.
//
// Must stay >= 60s: Supabase answers 429 to a second OTP request inside a 60-second
// window (https://supabase.com/docs/guides/auth/rate-limits). Must also match the
// Supabase SMS OTP expiry and the SMS copy in olive-backend `otp_sms_service.py`.
export const OTP_VALIDITY_SECONDS = 120;

export function formatCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
}
