import type { DoctorIdentity, HeaderConfig, HeaderPalette } from "@/lib/header-config";

// The common contract every preset and header part renders from.
export interface HeaderRenderProps {
    identity: DoctorIdentity;
    config:   HeaderConfig;
    palette:  HeaderPalette;
}
