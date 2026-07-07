import { Clock, Globe, Hash, MapPin, Phone } from "lucide-react";

import type { ContactLineKind } from "@/lib/header-config";

const ICONS: Record<ContactLineKind, typeof Phone> = {
    address: MapPin,
    phone:   Phone,
    hours:   Clock,
    serial:  Hash,
    custom:  Globe,
};

// The quiet icon that prefixes a contact line, chosen by the line's kind.
export default function ContactLineIcon({ kind, className }: { kind: ContactLineKind; className?: string }) {
    const Icon = ICONS[kind];
    return <Icon className={className} />;
}
