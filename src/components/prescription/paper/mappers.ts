import type { ChiefComplaintItem, DiagnosisItem, RxItem } from "@/types/patient";
import type { ConsultationHistoryItem, ConsultationInvestigationItem } from "@/types/consultation";
import type { SectionItemProps } from "./section-item";
import type { MedicineCardProps } from "./medicine-card";
import { formatStoredDuration, formatStoredFrequency } from "@/lib/rx-format";
import { categoryLabel } from "@/lib/dosage-form";

export function mapChiefComplaintsToSectionItems(items: ChiefComplaintItem[] = []): SectionItemProps[] {
    return items.map((item) => ({
        name:     item.name_text,
        duration: item.duration ?? null,
        notes:    item.notes ?? null,
    }));
}

export function mapHistoriesToSectionItems(items: ConsultationHistoryItem[] = []): SectionItemProps[] {
    return items.map((item) => ({
        name:     item.name_text,
        duration: item.duration ?? null,
        notes:    item.notes ?? null,
    }));
}

export function mapDiagnosesToSectionItems(items: DiagnosisItem[] = []): SectionItemProps[] {
    return items.map((item) => ({
        name: item.name_text,
    }));
}

export function mapInvestigationsToSectionItems(items: ConsultationInvestigationItem[] = []): SectionItemProps[] {
    return items.map((item) => ({
        name:      item.name_text,
        reasoning: item.reason ?? null,
        priority:  item.priority ?? null,
    }));
}

export function mapRxListToMedicineCards(items: RxItem[] = []): MedicineCardProps[] {
    return items.map((item) => ({
        typeLabel:     categoryLabel(item.type),
        tradeName:     item.trade_name,
        genericName:   item.generic_name,
        fallbackName:  item.trade_name || item.generic_name,
        dosage:        item.dosage,
        frequencyText: formatStoredFrequency(item),
        durationText:  formatStoredDuration(item),
        notes:         item.instructions ?? null,
    }));
}
