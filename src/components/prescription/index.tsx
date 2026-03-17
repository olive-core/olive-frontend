import { usePrescriptionStore } from "@/stores/prescription-store";
import DoctorInfo from "./doctor-info";
import ListInfo from "./list-info";
import PatientInfo from "./patient-info";
import { MedicineContainer } from "./medicine-container";
import { useSuggestionList } from "@/hooks/use-suggestion-list";

export default function Prescription() {

    const {
        // chiefComplaint
        chiefComplaint,
        addEmptyChiefComplaint,
        updateChiefComplaint,
        removeChiefComplaint,

        // history
        history,
        addEmptyHistory,
        updateHistory,
        removeHistory,

        // diagnosis
        diagnosis,
        addEmptyDiagnosis,
        updateDiagnosis,
        removeDiagnosis,

        // investigation
        investigation,
        addEmptyInvestigation,
        updateInvestigation,
        removeInvestigation,

    } = usePrescriptionStore();

    const {
        chiefComplaints: suggestionChiefComplaints,
        history: suggestionHistory,
        diagnosis: suggestionDiagnosis,
        // medicines: suggestionMedicines,
    } = useSuggestionList();


    return (
        <div className="container rounded-xl border">
            <div className="m-4">
                <DoctorInfo />
                <PatientInfo />

                <div className="grid grid-cols-3">
                    {/* left */}
                    <div className="h-full border-r col-span-1 py-4 flex flex-col gap-2">
                        <ListInfo
                            title="Chief Complaints"
                            info={chiefComplaint}
                            fieldName="chief-complaint"
                            addEmptyItem={addEmptyChiefComplaint}
                            updateItem={updateChiefComplaint}
                            removeItem={removeChiefComplaint}
                            suggestionList={suggestionChiefComplaints}
                        />
                        <ListInfo
                            title="History"
                            info={history}
                            fieldName="history"
                            addEmptyItem={addEmptyHistory}
                            updateItem={updateHistory}
                            removeItem={removeHistory}
                            suggestionList={suggestionHistory}
                        />

                        <ListInfo
                            title="Diagnosis"
                            info={diagnosis}
                            fieldName="diagnosis"
                            addEmptyItem={addEmptyDiagnosis}
                            updateItem={updateDiagnosis}
                            removeItem={removeDiagnosis}
                            suggestionList={suggestionDiagnosis}
                        />

                        <ListInfo
                            title="Investigation"
                            info={investigation}
                            fieldName="investigation"
                            addEmptyItem={addEmptyInvestigation}
                            updateItem={updateInvestigation}
                            removeItem={removeInvestigation}
                            suggestionList={[]} // NOT AVAILABLE IN CURRENT API
                        />
                    </div>

                    {/* right */}
                    <MedicineContainer />
                </div>
            </div>
        </div>
    );
}