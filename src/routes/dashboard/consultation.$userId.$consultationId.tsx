import ConsultationCardMemo from '@/components/dashboard/consultation/consultation-card'
import HistoryContainer from '@/components/dashboard/consultation/history-container'
import Recorder from '@/components/dashboard/consultation/recorder'
import type { HistoryType } from '@/types/patient'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/consultation/$userId/$consultationId')({
  component: RouteComponent,
})

const histories = [
  {
    id: "1",
    timestamp: "Dec 12, 2024",
    relativeTime: "7 days ago",
    description: "Suspected acid reflux and work-related stress.",
  },
  {
    id: "2",
    timestamp: "Dec 5, 2024",
    relativeTime: "14 days ago",
    description: "Follow-up consultation for acid reflux treatment.",
  },
  {
    id: "3",
    timestamp: "Nov 28, 2024",
    relativeTime: "21 days ago",
    description: "Initial consultation for acid reflux symptoms.",
  },
  {
    id: "4",
    timestamp: "Nov 15, 2024",
    relativeTime: "34 days ago",
    description: "Routine check-up and general health assessment.",
  },
  {
    id: "5",
    timestamp: "Nov 1, 2024",
    relativeTime: "48 days ago",
    description: "Consultation regarding dietary habits and lifestyle.",
  },
  {
    id: "6",
    timestamp: "Oct 20, 2024",
    relativeTime: "2 months ago",
    description: "Discussion on stress management techniques.",
  }
]

function RouteComponent() {

  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>("1");
  const [followUpHistoryId, setFollowUpHistoryId] = useState<string | undefined>(undefined);

  const toggleFollowUpHistory = (id: string) => {
    if (followUpHistoryId === id) {
      setFollowUpHistoryId(undefined);
    } else {
      setFollowUpHistoryId(id);
    }
  };

  const handlePrevious = () => {
    if (!activeHistoryId) return;
    const currentIndex = histories.findIndex(history => history.id === activeHistoryId);
    if (currentIndex > 0) {
      setActiveHistoryId(histories[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (!activeHistoryId) return;
    const currentIndex = histories.findIndex(history => history.id === activeHistoryId);
    if (currentIndex < histories.length - 1) {
      setActiveHistoryId(histories[currentIndex + 1].id);
    }
  };

  return (
    <div className="container mt-10">
      <div className="grid grid-cols-2 max-h-[calc(100vh-100px)] w-full gap-8">

        <div className="flex flex-col max-h-[calc(100vh-100px)] gap-8">
          <div className="h-[40%]">
            <Recorder />
          </div>

          <HistoryContainer
            histories={histories}
            activeHistoryId={activeHistoryId}
            setActiveHistoryId={setActiveHistoryId}
          />

        </div>

        <ConsultationCardMemo
          history={histories.find(history => history.id === activeHistoryId) as HistoryType}
          totalHistories={histories.length}
          currentHistoryIndex={histories.findIndex(history => history.id === activeHistoryId) + 1}
          toggleFollowUpHistory={toggleFollowUpHistory}
          isFollowUpOfCurrent={followUpHistoryId === activeHistoryId}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          isFirst={histories.findIndex(history => history.id === activeHistoryId) === 0}
          isLast={histories.findIndex(history => history.id === activeHistoryId) === histories.length - 1}
        />

      </div>
    </div>


  )
}
