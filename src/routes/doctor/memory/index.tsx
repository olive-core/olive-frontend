import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangleIcon, BookMarkedIcon, ClockIcon, PinIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MemoryChips from '@/components/memory/memory-chips'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useDeleteMemory, useMemoryLibrary, useToggleMemoryPin, type MemorySummary } from '@/hooks/use-memory-library'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/doctor/memory/')({
  component: RouteComponent,
})

function MemoryCard({
  memory,
  onDelete,
  onTogglePin,
}: {
  memory: MemorySummary
  onDelete: (memory: MemorySummary) => void
  onTogglePin: (memory: MemorySummary) => void
}) {
  return (
    <div
      className="group relative bg-white border border-slate-100 rounded-2xl p-5 cursor-pointer transition-colors duration-200 hover:border-emerald-200 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <BookMarkedIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug break-words group-hover:text-emerald-700 transition-colors">
            <Link to="/doctor/memory/manage/$memoryId" params={{ memoryId: memory.template_id }} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-emerald-600">{memory.template_name}</Link>
          </h3>
        </div>


      </div>

      <MemoryChips sections={memory.sections} />

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
        <div className="space-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <ClockIcon className="w-3 h-3" />
          {format(new Date(memory.created_at), 'MMM d, yyyy')}
        </span>
        {memory.use_count > 0 && (
          <span>Used {memory.use_count} {memory.use_count === 1 ? 'time' : 'times'}</span>
        )}
        </div>
        <div className="relative z-10 flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(memory) }}
            aria-label={memory.is_pinned ? 'Unpin memory' : 'Pin memory'}
            className={cn(
              'w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer',
              memory.is_pinned
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600',
            )}
          >
            <PinIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(memory) }}
            aria-label="Delete memory"
            className="w-11 h-11 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-200 cursor-pointer"
          >
            <Trash2Icon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function RouteComponent() {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [memoryToDelete, setMemoryToDelete] = useState<MemorySummary | null>(null)

  const debouncedQuery = useDebouncedValue(query, 200)
  const { data: memories = [], isLoading, isError } = useMemoryLibrary(debouncedQuery)
  const deleteMemory = useDeleteMemory()
  const togglePin = useToggleMemoryPin()

  const confirmDelete = () => {
    if (!memoryToDelete) return
    deleteMemory.mutate(memoryToDelete)
    setMemoryToDelete(null)
  }

  const isSearching = debouncedQuery.trim().length > 0
  const pinnedMemories = memories.filter((memory) => memory.is_pinned)
  const otherMemories = memories.filter((memory) => !memory.is_pinned)
  const groups = isSearching
    ? [{ title: 'Search results', items: memories }]
    : pinnedMemories.length > 0
      ? [{ title: 'Pinned', items: pinnedMemories }, { title: 'Other memories', items: otherMemories }]
      : [{ title: 'Your memories', items: memories }]

  return (
    <div className="container py-8 px-4 mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Memory</h1>
          <p className="text-sm text-slate-500 mt-1">Your saved prescriptions for the cases you see often</p>
        </div>
        <Button
          onClick={() => navigate({ to: '/doctor/memory/manage' })}
          className="min-h-11 shrink-0 font-semibold shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          New memory
        </Button>
      </div>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, medicine, condition..."
          className="h-11 pl-9"
          aria-label="Search memories"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-slate-100 rounded-full w-24" />
                <div className="h-3 bg-slate-100 rounded-full w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <BookMarkedIcon className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-slate-600 font-medium">Failed to load your memories</p>
          <p className="text-slate-400 text-sm">Please try again later</p>
        </div>
      )}

      {!isLoading && !isError && memories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <BookMarkedIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-700 font-semibold text-lg">
              {isSearching ? 'No memory matches that' : 'No memories yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {isSearching
                ? 'Search looks inside a memory too, not just at its name'
                : 'Save the prescription for a case you see often, then apply it in a click'}
            </p>
          </div>
          {!isSearching && (
            <Button onClick={() => navigate({ to: '/doctor/memory/manage' })} className="font-semibold shadow-sm">
              <PlusIcon className="w-4 h-4" />
              Create a memory
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && memories.length > 0 && (
        <div className="space-y-8">
          {groups.filter((group) => group.items.length > 0).map((group) => (
            <section key={group.title} aria-label={group.title}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">{group.title}<span className="text-xs font-normal text-slate-400">{group.items.length}</span></h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((memory) => <MemoryCard key={memory.template_id} memory={memory} onDelete={setMemoryToDelete} onTogglePin={togglePin.mutate} />)}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={!!memoryToDelete} onOpenChange={(open) => !open && setMemoryToDelete(null)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2 text-left">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Delete this memory?</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 text-left">
              <span className="font-semibold text-slate-900">"{memoryToDelete?.template_name}"</span> will be gone for
              good. Prescriptions you already wrote with it are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setMemoryToDelete(null)} className="rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
            >
              Delete memory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
