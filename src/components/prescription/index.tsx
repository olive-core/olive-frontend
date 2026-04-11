import { usePrescriptionStore } from "@/stores/prescription-store";
import DoctorInfo from "./doctor-info";
import ListInfo from "./list-info";
import PatientInfo from "./patient-info";
import { MedicineContainer } from "./medicine-container";
import api from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useReactToPrint } from 'react-to-print';
import { useRef } from "react";
import AdviceList from "./advice-list";
import { PrescriptionView } from "./view";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function Prescription() {

    const store = usePrescriptionStore();
    const navigate = useNavigate();
    const { consultationId } = useParams({ from: '/dashboard/prescribe/$consultationId' });

    const prescriptionRef = useRef(null);

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

        // advice
        advice,
        setAdvice,

        // summary
        summary
    } = store;

    const confirmMutation = useMutation({
        mutationFn: async () => {
            const payload = store.getSubmitPayload(consultationId);
            await api.post('/prescription', payload);
        },
        onSuccess: () => {
            // TODO: remove editing details
            handlePrint();
            // navigate({ to: '/dashboard' });
        }
    });

    const handlePrint = useReactToPrint({
        contentRef: prescriptionRef,
        documentTitle: "Prescription_Report_" + consultationId,
    });


    return (
        <>
            {/* prescription view */}
            <div className="fixed top-0 left-[-9999px] print:left-0 print:block pb-8" ref={prescriptionRef}>
                <PrescriptionView />
            </div>

            {/* prescription editor */}
            <div className="container rounded-xl border flex flex-col mt-4 mb-12">
                <div className="m-4">
                    <DoctorInfo />
                    <PatientInfo sessionId={consultationId} />

                    <div className="grid grid-cols-1 md:grid-cols-3">
                        {/* left */}
                        <div className="h-full md:border-r md:col-span-1 border-b md:border-b-0 py-4 flex flex-col gap-2">
                            <div className="px-4">
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>
                                            <h3 className={`font-bold text-xs uppercase tracking-widest  text-slate-500`}>
                                                Summary
                                            </h3>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {summary}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>

                            <ListInfo
                                title="Chief Complaints"
                                info={chiefComplaint}
                                fieldName="chief-complaint"
                                addEmptyItem={addEmptyChiefComplaint}
                                updateItem={updateChiefComplaint}
                                removeItem={removeChiefComplaint}
                            />

                            <ListInfo
                                title="History"
                                info={history}
                                fieldName="history"
                                addEmptyItem={addEmptyHistory}
                                updateItem={updateHistory}
                                removeItem={removeHistory}
                            />

                            <ListInfo
                                title="Diagnosis"
                                info={diagnosis}
                                fieldName="diagnosis"
                                addEmptyItem={addEmptyDiagnosis}
                                updateItem={updateDiagnosis}
                                removeItem={removeDiagnosis}
                            />

                            <ListInfo
                                title="Investigation"
                                info={investigation}
                                fieldName="investigation"
                                addEmptyItem={addEmptyInvestigation}
                                updateItem={updateInvestigation}
                                removeItem={removeInvestigation}
                            />
                        </div>

                        {/* right */}
                        <div className="h-full col-span-1 md:col-span-2 py-4 px-4 md:px-8 flex flex-col justify-between">
                            <MedicineContainer />
                            <div className="mt-auto">
                                <AdviceList value={advice} onChange={setAdvice} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Master Confirm Button */}
                <div className="p-4 border-t flex justify-end bg-slate-50 rounded-b-xl">
                    <button
                        onClick={() => confirmMutation.mutate()}
                        disabled={confirmMutation.isPending}
                        className="h-9 px-8 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-md transition-colors disabled:opacity-50"
                    >
                        {confirmMutation.isPending ? 'Saving...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </>
    );
}