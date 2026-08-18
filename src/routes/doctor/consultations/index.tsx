import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import DaySection from '@/components/dashboard/consultations/day-section'
import GridSkeleton from '@/components/dashboard/consultations/grid-skeleton'
import EmptyState from '@/components/dashboard/consultations/empty-state'
import ErrorState from '@/components/dashboard/consultations/error-state'
import NoResultsState from '@/components/dashboard/consultations/no-results-state'
import ConsultationsToolbar, { type CaseAccessFilter } from '@/components/dashboard/consultations/filters/toolbar'
import { groupConsultationsByDay } from '@/components/dashboard/consultations/group-by-day'
import { useClinicianConsultations } from '@/components/dashboard/consultations/use-clinician-consultations'
import { filterConsultationsByName } from '@/components/dashboard/consultations/filters/filter-by-name'
import { filterConsultationsByAccess } from '@/components/dashboard/consultations/filters/filter-by-access'
import { EMPTY_DATE_RANGE, isDateRangeActive, type DateRange } from '@/components/dashboard/consultations/filters/date-range'
import { useStartConsultation } from '@/hooks/use-start-consultation'

export const Route = createFileRoute('/doctor/consultations/')({
  component: ConsultationsPage,
})

function ConsultationsPage() {
  const clinicianId = useAuthStore((state) => state.userId)
  const { start, startingSourceSessionId, graceDialog } = useStartConsultation()

  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_DATE_RANGE)
  const [searchTerm, setSearchTerm] = useState("")
  const [accessFilter, setAccessFilter] = useState<CaseAccessFilter>("all")
  const queryClient = useQueryClient()

  const removeSharedCase = useMutation({
    mutationFn: (rootSessionId: string) => api.delete(`/case/shared/${rootSessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinician-consultations'] })
      toast.success('Shared case removed')
    },
    onError: () => toast.error('Could not remove shared case'),
  })

  const { data: consultations = [], isLoading, isError } = useClinicianConsultations({
    clinicianId,
    dateRange,
  })

  const visibleByAccess = filterConsultationsByAccess(consultations, accessFilter)
  const filteredConsultations = filterConsultationsByName(visibleByAccess, searchTerm)
  const dayGroups = groupConsultationsByDay(filteredConsultations)

  const hasActiveFilters = isDateRangeActive(dateRange) || searchTerm.trim().length > 0 || accessFilter !== "all"
  const isReady = !isLoading && !isError
  const showNoResults = isReady && filteredConsultations.length === 0 && hasActiveFilters
  const showEmptyState = isReady && filteredConsultations.length === 0 && !hasActiveFilters

  const handleClearFilters = () => {
    setDateRange(EMPTY_DATE_RANGE)
    setSearchTerm("")
    setAccessFilter("all")
  }

  return (
    <div className="container py-8 px-4 mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your consultations and Cases shared with you, grouped by day.
        </p>
      </header>

      <ConsultationsToolbar
        dateRange={dateRange}
        onDateChange={setDateRange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        accessFilter={accessFilter}
        onAccessChange={setAccessFilter}
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
              onFollowUp={(consultation) => {
                if (!consultation.session_id) return
                start(consultation.patient_id, undefined, consultation.session_id)
              }}
              startingSourceSessionId={startingSourceSessionId}
              onRemoveShared={(consultation) => {
                if (consultation.case_root_session_id) {
                  removeSharedCase.mutate(consultation.case_root_session_id)
                }
              }}
              removingRootSessionId={removeSharedCase.variables}
            />
          ))}
        </div>
      )}
      {graceDialog}
    </div>
  )
}
