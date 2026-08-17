import ConsultationCardMemo from '@/components/dashboard/consultation/consultation-card'
import HistoryContainer from '@/components/dashboard/consultation/history-container'
import PatientChip from '@/components/dashboard/consultation/patient-chip'
import Recorder from '@/components/dashboard/consultation/recorder'
import api from '@/lib/axios'
import { useWarmLetterheadCache } from '@/hooks/use-warm-letterhead-cache'
import type { HistoryType, PrescriptionType } from '@/types/patient'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import ConsultationModeBanner from '@/components/consultation-start/consultation-mode-banner'

type ConsultationSession = {
  session_id: string
  follow_up_of_session_id?: string | null
}

export const Route = createFileRoute('/doctor/consultation/$userId/$consultationId')({
  component: RouteComponent,
})


function RouteComponent() {

  const { userId, consultationId } = Route.useParams();
  useWarmLetterheadCache(consultationId);

  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>(undefined);

  const { data: sessionData } = useQuery({
    queryKey: ['session', consultationId],
    queryFn: async () => {
      const response = await api.get<ConsultationSession>(`/session/${consultationId}`)
      return response.data
    },
  });

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
  const followUpSource = histories.find(
    (history) => history.session_id === sessionData?.follow_up_of_session_id,
  );

  // For follow-ups, surface the patient's most recent visit on load so its prescription is
  // already on screen — no clicks. Runs once; the doctor stays in control after that.
  const [didAutoSelect, setDidAutoSelect] = useState(false);
  useEffect(() => {
    if (didAutoSelect || activeHistoryId || !sessionData || !historiesData || historiesData.length === 0) return;
    const mostRecent = historiesData.reduce((latest, h) =>
      new Date(h.created_at) > new Date(latest.created_at) ? h : latest
    );
    const initialHistory = historiesData.find(
      (history) => history.session_id === sessionData.follow_up_of_session_id,
    ) ?? mostRecent;
    setActiveHistoryId(initialHistory.prescription_id);
    setDidAutoSelect(true);
  }, [sessionData, historiesData, activeHistoryId, didAutoSelect]);

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
    <div className="container flex flex-col py-6 md:h-[calc(100svh-136px)]">
      <div className="mb-5 flex flex-none flex-col gap-3">
        <PatientChip userId={userId} />
        {sessionData && (
          <ConsultationModeBanner
            isFollowUp={!!sessionData.follow_up_of_session_id}
            followUpSource={followUpSource}
            onViewSource={followUpSource
              ? () => setActiveHistoryId(followUpSource.prescription_id)
              : undefined}
          />
        )}
      </div>

      {/*
        DOM order (Recorder → Detail → History) sets the mobile single-column order.
        The md: grid coordinates restore the desktop two-column layout regardless of it.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_minmax(0,1fr)] w-full gap-6 md:gap-8 md:min-h-0 md:flex-1">

        <div className="flex-none md:col-start-1 md:row-start-1">
          <Recorder />
        </div>

        <div className="md:col-start-2 md:row-start-1 md:row-span-2 md:min-h-0">
          <ConsultationCardMemo
            prescription={prescriptionData}
            totalHistories={histories.length}
            currentHistoryIndex={currentIndex + 1}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            isFirst={currentIndex <= 0}
            isLast={!hasSelection || currentIndex >= histories.length - 1}
            isLoading={isLoadingPrescription}
            isError={isErrorPrescription}
            hasSelection={hasSelection}
          />
        </div>

        <div className="h-[60svh] md:h-auto md:col-start-1 md:row-start-2 md:min-h-0">
          <HistoryContainer
            histories={historiesData}
            activeHistoryId={activeHistoryId}
            setActiveHistoryId={setActiveHistoryId}
            isLoading={isLoadingHistories}
            isError={isErrorHistories}
          />
        </div>

      </div>
    </div>
  )
}
