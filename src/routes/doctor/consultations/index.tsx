import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import DaySection from '@/components/dashboard/consultations/day-section'
import GridSkeleton from '@/components/dashboard/consultations/grid-skeleton'
import EmptyState from '@/components/dashboard/consultations/empty-state'
import ErrorState from '@/components/dashboard/consultations/error-state'
import NoResultsState from '@/components/dashboard/consultations/no-results-state'
import ConsultationsToolbar from '@/components/dashboard/consultations/filters/toolbar'
import { groupConsultationsByDay } from '@/components/dashboard/consultations/group-by-day'
import { useClinicianConsultations } from '@/components/dashboard/consultations/use-clinician-consultations'
import { filterConsultationsByName } from '@/components/dashboard/consultations/filters/filter-by-name'
import { EMPTY_DATE_RANGE, isDateRangeActive, type DateRange } from '@/components/dashboard/consultations/filters/date-range'
import { useStartConsultation } from '@/hooks/use-start-consultation'
import FollowUpConfirmDialog from '@/components/consultation-start/follow-up-confirm-dialog'
import type { ClinicianConsultationItem } from '@/types/consultation'

export const Route = createFileRoute('/doctor/consultations/')({
  component: ConsultationsPage,
})

function ConsultationsPage() {
  const clinicianId = useAuthStore((state) => state.userId)
  const { start, startingSourceSessionId, graceDialog } = useStartConsultation()

  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_DATE_RANGE)
  const [searchTerm, setSearchTerm] = useState("")
  const [pendingFollowUp, setPendingFollowUp] = useState<ClinicianConsultationItem | null>(null)

  const { data: consultations = [], isLoading, isError } = useClinicianConsultations({
    clinicianId,
    dateRange,
  })

  const filteredConsultations = filterConsultationsByName(consultations, searchTerm)
  const dayGroups = groupConsultationsByDay(filteredConsultations)

  const hasActiveFilters = isDateRangeActive(dateRange) || searchTerm.trim().length > 0
  const isReady = !isLoading && !isError
  const showNoResults = isReady && filteredConsultations.length === 0 && hasActiveFilters
  const showEmptyState = isReady && filteredConsultations.length === 0 && !hasActiveFilters

  const handleClearFilters = () => {
    setDateRange(EMPTY_DATE_RANGE)
    setSearchTerm("")
  }

  return (
    <div className="container py-8 px-4 mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every consultation you have saved, grouped by day.
        </p>
      </header>

      <ConsultationsToolbar
        dateRange={dateRange}
        onDateChange={setDateRange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {isLoading && <GridSkeleton />}
      {!isLoading && isError && <ErrorState />}
      {showNoResults && <NoResultsState onClearFilters={handleClearFilters} />}
      {showEmptyState && <EmptyState />}

      {isReady && dayGroups.length > 0 && (
        <div className="space-y-10">
          {dayGroups.map((group) => (
            <DaySection
              key={group.isoDate}
              isoDate={group.isoDate}
              consultations={group.consultations}
              onFollowUp={setPendingFollowUp}
              startingSourceSessionId={startingSourceSessionId}
            />
          ))}
        </div>
      )}
      <FollowUpConfirmDialog
        open={!!pendingFollowUp}
        onOpenChange={(open) => !open && setPendingFollowUp(null)}
        patientName={pendingFollowUp?.patient_name}
        sourceDate={pendingFollowUp?.created_at}
        sourceSummary={
          pendingFollowUp?.chief_complaints_summary?.[0]
          || pendingFollowUp?.diagnoses_summary?.[0]
        }
        isStarting={startingSourceSessionId === pendingFollowUp?.session_id}
        onConfirm={() => {
          if (!pendingFollowUp?.session_id) return
          start(pendingFollowUp.patient_id, undefined, pendingFollowUp.session_id)
        }}
      />
      {graceDialog}
    </div>
  )
}
