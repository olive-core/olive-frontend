import { Building2, CreditCard, Mic, SlidersHorizontal, Stamp, UserRound } from 'lucide-react'

export const ACCOUNT_GROUPS = [
  { label: 'Personal', sections: [
    { id: 'profile', label: 'Profile', description: 'Your personal and professional details', to: '/doctor/profile', icon: UserRound },
  ] },
  { label: 'Practice', sections: [
    { id: 'chambers', label: 'Chambers & attendants', description: 'Your locations and the people helping you', to: '/doctor/chambers', icon: Building2 },
    { id: 'pad', label: 'Prescription pad', description: 'How your prescriptions look on paper', to: '/doctor/account/prescription-pad', icon: Stamp },
    { id: 'preferences', label: 'Consultation preferences', description: 'Drafting and patient delivery', to: '/doctor/account/preferences', icon: SlidersHorizontal },
  ] },
  { label: 'Account', sections: [
    { id: 'devices', label: 'Devices', description: 'Check the microphone on this device', to: '/doctor/device-check', icon: Mic },
    { id: 'membership', label: 'Membership', description: 'Your plan, usage, and renewal', to: '/doctor/billing', icon: CreditCard },
  ] },
] as const

export type AccountSection = typeof ACCOUNT_GROUPS[number]['sections'][number]['id']
