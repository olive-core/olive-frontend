export type AccessStateName = "trial" | "active" | "grace" | "locked";
export type NudgeLevel = "none" | "trial_low" | "grace";
export type PaymentMethod = "bkash" | "nagad" | "bank" | "cash";

export interface PendingPayment {
    amount: number;
    months: number;
    created_at: string;
}

export interface SubscriptionStatus {
    state: AccessStateName;
    allowed: boolean;
    nudge_level: NudgeLevel;
    consultations_used: number;
    consultations_remaining: number | null;
    trial_limit: number;
    subscription_until: string | null;
    price: number | null;
    currency: string;
    bkash_number: string;
    prepay_months: number[];
    pending_payment: PendingPayment | null;
}

export interface PaymentClaim {
    amount: number;
    method: PaymentMethod;
    months: number;
    sender_msisdn?: string;
    txn_ref?: string;
}
