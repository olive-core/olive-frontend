import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import { applyChamberPad, buildChamberFooter, padFromApi } from "@/lib/chamber-pad";
import { clinicianStyleConfig, type HeaderConfigApi, type ResolvedLetterhead } from "@/lib/header-config";
import { listChambers } from "@/lib/attendant-queue";
import { useAuthStore } from "@/stores/auth-store";
import type { Chamber } from "@/types/attendant-queue";

interface SessionDetail {
    session_id:  string;
    chamber_id?: string | null;
}

interface ClinicianProfile {
    name?:          string | null;
    qualification?: string | null;
    bmdc_no?:       string | null;
    header_config?: HeaderConfigApi | null;
    generate_ai_draft?: boolean;
}

export interface ComposeLetterhead {
    letterhead:      ResolvedLetterhead | null;
    clinician:       ClinicianProfile | undefined;
    chambers:        Chamber[];
    activeChamberId: string | null;
    isLoading:       boolean;
}

// The compose screen has no snapshot yet (the prescription isn't saved), so it mirrors
// the backend's resolution live: global header style + the session chamber's pad, with
// the other chambers in the footer. What this shows is exactly what the backend will
// freeze into render_config on save.
export function useComposeLetterhead(sessionId: string): ComposeLetterhead {
    const { userId } = useAuthStore();

    const clinicianQuery = useQuery<ClinicianProfile>({
        queryKey: ["clinician", userId],
        queryFn:  async () => (await api.get(`/clinician/${userId}`)).data,
        enabled:  !!userId,
    });

    const sessionQuery = useQuery<SessionDetail>({
        queryKey: ["session", sessionId],
        queryFn:  async () => (await api.get(`/session/${sessionId}`)).data,
        enabled:  !!sessionId,
    });

    const chambersQuery = useQuery({ queryKey: ["chambers"], queryFn: listChambers });

    const clinician = clinicianQuery.data;
    const chambers = chambersQuery.data ?? [];
    const activeChamberId = sessionQuery.data?.chamber_id ?? null;
    const activeChamber = chambers.find((chamber) => chamber.chamber_id === activeChamberId) ?? null;

    let letterhead: ResolvedLetterhead | null = null;
    if (clinician) {
        let config = clinicianStyleConfig(clinician.header_config);
        if (activeChamber) config = applyChamberPad(config, activeChamber);
        letterhead = {
            identity: {
                name:          clinician.name,
                qualification: clinician.qualification,
                bmdcNo:        clinician.bmdc_no,
            },
            config,
            footer: buildChamberFooter(chambers, activeChamber ? activeChamberId : null),
            paper:  padFromApi(activeChamber?.pad_config).paper,
        };
    }

    return {
        letterhead,
        clinician,
        chambers,
        activeChamberId,
        isLoading: clinicianQuery.isLoading || sessionQuery.isLoading,
    };
}
