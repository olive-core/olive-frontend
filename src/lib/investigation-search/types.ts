export type InvestigationRecord = {
    investigation_name_id: string;
    name: string;
};

export type InvestigationSnapshot = {
    version: string;
    investigation_names: InvestigationRecord[];
};
