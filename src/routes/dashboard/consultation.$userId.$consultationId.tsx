import ConsultationCardMemo from '@/components/dashboard/consultation/consultation-card'
import HistoryContainer from '@/components/dashboard/consultation/history-container'
import Recorder from '@/components/dashboard/consultation/recorder'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import type { HistoryType, PrescriptionType } from '@/types/patient'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
// import { useState } from 'react'

export const Route = createFileRoute('/dashboard/consultation/$userId/$consultationId')({
  component: RouteComponent,
})


function RouteComponent() {

  const { userId, consultationId } = Route.useParams();
  const clinicianId = useAuthStore(s => s.userId);

  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>(undefined);

  const {
    data: historiesData,
    isLoading: isLoadingHistories,
    isError: isErrorHistories,
  } = useQuery({
    queryKey: ['histories', userId],
    queryFn: async () => {
      const response = await api.get<HistoryType[]>(`/prescription/patient/${userId}`)
      return response.data;
    }
  });

  const {
    data: prescriptionData,
    isLoading: isLoadingPrescription,
    isError: isErrorPrescription,
  } = useQuery({
    queryKey: ['prescription', activeHistoryId],
    queryFn: async () => {
      const response = await api.get<PrescriptionType>(`/prescription/${activeHistoryId}`)
      return response.data;
    },
    enabled: !!activeHistoryId,
  });

  const histories = historiesData ?? [];

  // Track which prescription_id is set as follow-up for the current session
  const [followUpOfPrescriptionId, setFollowUpOfPrescriptionId] = useState<string | undefined>(undefined);

  const { mutate: setFollowUp, isPending: isFollowingUp } = useMutation({
    mutationFn: async (selectedSessionId: string) => {
      await api.put(`/session/${consultationId}`, {
        clinician_id: clinicianId,
        patient_id: userId,
        follow_up_of_session_id: selectedSessionId,
      });
      return selectedSessionId;
    },
    onSuccess: (selectedSessionId) => {
      // If toggling off the same one, clear; otherwise set new
      setFollowUpOfPrescriptionId(prev =>
        prev === activeHistoryId ? undefined : activeHistoryId
      );
      console.log('Follow-up set to session:', selectedSessionId);
    },
  });

  const handleFollowUp = () => {
    if (!prescriptionData) return;
    // Toggle: if this prescription is already the follow-up target, unset it
    if (followUpOfPrescriptionId === activeHistoryId) {
      setFollowUpOfPrescriptionId(undefined);
      return;
    }
    setFollowUp(prescriptionData.session_id);
  };

  // -1 when nothing is selected
  const currentIndex = activeHistoryId
    ? histories.findIndex(h => h.prescription_id === activeHistoryId)
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveHistoryId(histories[currentIndex - 1].prescription_id);
    }
  };

  const handleNext = () => {
    if (currentIndex !== -1 && currentIndex < histories.length - 1) {
      setActiveHistoryId(histories[currentIndex + 1].prescription_id);
    }
  };

  const hasSelection = !!activeHistoryId;

  return (
    <div className="container mt-10 pb-10 md:h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 md:h-[calc(100vh-100px)] w-full gap-8">

        <div className="flex flex-col md:h-full gap-8 min-h-0">
          <div className="flex-none">
            <Recorder />
          </div>

          <div className="flex-1 min-h-0">
            <HistoryContainer
              histories={historiesData}
              activeHistoryId={activeHistoryId}
              setActiveHistoryId={setActiveHistoryId}
              isLoading={isLoadingHistories}
              isError={isErrorHistories}
            />
          </div>
        </div>

        <ConsultationCardMemo
          prescription={prescriptionData}
          totalHistories={histories.length}
          currentHistoryIndex={currentIndex + 1}
          onFollowUp={handleFollowUp}
          isFollowUp={followUpOfPrescriptionId === activeHistoryId}
          isFollowingUp={isFollowingUp}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          isFirst={currentIndex <= 0}
          isLast={!hasSelection || currentIndex >= histories.length - 1}
          isLoading={isLoadingPrescription}
          isError={isErrorPrescription}
          hasSelection={hasSelection}
        />

      </div>
    </div>
  )
}
