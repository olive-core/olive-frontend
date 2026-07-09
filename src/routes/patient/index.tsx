import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import type { PatientPrescriptionListItem } from '@/types/patient'
import { applyFilters, isFiltersActive, type Period } from '@/components/patient/filter-prescriptions'
import PrescriptionsFilters from '@/components/patient/prescriptions-filters'
import PrescriptionList from '@/components/patient/prescription-list'
import Pagination from '@/components/patient/pagination'
import GridSkeleton from '@/components/dashboard/consultations/grid-skeleton'
import EmptyState from '@/components/dashboard/consultations/empty-state'
import ErrorState from '@/components/dashboard/consultations/error-state'
import NoResultsState from '@/components/dashboard/consultations/no-results-state'

export const Route = createFileRoute('/patient/')({
  component: PatientPrescriptionsPage,
})

const PAGE_SIZE = 10

function useAllPatientPrescriptions(patientId: string | undefined) {
  return useQuery<PatientPrescriptionListItem[]>({
    queryKey: ['patient-prescriptions', patientId],
    queryFn:  async () => {
      const response = await api.get(`/prescription/patient/${patientId}`)
      return response.data
    },
    enabled: !!patientId,
  })
}

function PatientPrescriptionsPage() {
  const activePatientId = useAuthStore((state) => state.activePatientId)

  const [page, setPage]             = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [period, setPeriod]         = useState<Period>('all')

  const { data, isLoading, isError } = useAllPatientPrescriptions(activePatientId)

  const allPrescriptions = data ?? []
  const filtered         = applyFilters(allPrescriptions, searchTerm, period)
  const totalPages       = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems        = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [searchTerm, period])

  const clearFilters = () => {
    setSearchTerm('')
    setPeriod('all')
  }

  const showEmptyState     = !isLoading && !isError && allPrescriptions.length === 0
  const showNoResults      = !isLoading && !isError && filtered.length === 0 && isFiltersActive(searchTerm, period)
  const showList           = !isLoading && !isError && pageItems.length > 0

  return (
    <div className="container py-8 px-4 mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Your Prescriptions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every prescription from your past consultations.
        </p>
      </header>

      <PrescriptionsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        period={period}
        onPeriodChange={setPeriod}
      />

      {isLoading && <GridSkeleton />}
      {!isLoading && isError && <ErrorState />}
      {showEmptyState && <EmptyState />}
      {showNoResults  && <NoResultsState onClearFilters={clearFilters} />}

      {showList && (
        <>
          <PrescriptionList prescriptions={pageItems} />
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}
