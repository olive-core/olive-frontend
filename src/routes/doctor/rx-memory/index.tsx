import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import { BookmarkIcon, PlusIcon, BookMarkedIcon, ClockIcon, GlobeIcon, LockIcon, Trash2Icon, AlertTriangleIcon } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/doctor/rx-memory/')({
  component: RouteComponent,
})

type Template = {
  template_id: string
  clinician_id: string
  template_name: string
  visibility: string
  is_bookmarked: boolean
  created_at: string
}

function TemplateCard({
  template,
  onBookmarkToggle,
  isBookmarkPending,
  onDelete,
  isDeletePending,
}: {
  template: Template
  onBookmarkToggle: (template: Template) => void
  isBookmarkPending: boolean
  onDelete: (template: Template) => void
  isDeletePending: boolean
}) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate({ to: '/doctor/rx-memory/manage/$templateId', params: { templateId: template.template_id } })}
      className="group relative bg-white border border-slate-100 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <BookMarkedIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {template.template_name}
          </h3>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Bookmark button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onBookmarkToggle(template)
            }}
            disabled={isBookmarkPending}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 ${template.is_bookmarked
              ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
          >
            <BookmarkIcon
              className="w-4 h-4 transition-transform"
              fill={template.is_bookmarked ? 'currentColor' : 'none'}
            />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(template)
            }}
            disabled={isDeletePending}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 disabled:opacity-50"
          >
            <Trash2Icon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ClockIcon className="w-3 h-3" />
          {format(new Date(template.created_at), 'MMM d, yyyy')}
        </span>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${template.visibility === 'public'
          ? 'bg-emerald-50 text-emerald-600'
          : 'bg-slate-100 text-slate-500'
          }`}>
          {template.visibility === 'public'
            ? <GlobeIcon className="w-3 h-3" />
            : <LockIcon className="w-3 h-3" />
          }
          {template.visibility}
        </span>
      </div>
    </div>
  )
}

function RouteComponent() {
  const navigate = useNavigate()
  const { userId } = useAuthStore()
  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)

  const { data: templates = [], isLoading, isError } = useQuery<Template[]>({
    queryKey: ['prescription-templates'],
    queryFn: async () => {
      const res = await api.get(`/prescription-template/my?clinician_id=${userId}`)
      return res.data
    },
  })

  const bookmarkMutation = useMutation({
    mutationFn: async ({ template, action }: { template: Template; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        await api.post(`/prescription-template/${template.template_id}/bookmark?clinician_id=${userId}`)
      } else {
        await api.delete(`/prescription-template/${template.template_id}/bookmark?clinician_id=${userId}`)
      }
    },
    onMutate: async ({ template, action }) => {
      await queryClient.cancelQueries({ queryKey: ['prescription-templates'] })
      const prev = queryClient.getQueryData<Template[]>(['prescription-templates'])
      queryClient.setQueryData<Template[]>(['prescription-templates'], (old) =>
        old?.map((t) =>
          t.template_id === template.template_id
            ? { ...t, is_bookmarked: action === 'add' }
            : t
        ) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['prescription-templates'], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription-templates'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (template: Template) => {
      await api.delete(`/prescription-template/${template.template_id}?clinician_id=${userId}`)
    },
    onMutate: async (template) => {
      await queryClient.cancelQueries({ queryKey: ['prescription-templates'] })
      const prev = queryClient.getQueryData<Template[]>(['prescription-templates'])
      queryClient.setQueryData<Template[]>(['prescription-templates'], (old) =>
        old?.filter((t) => t.template_id !== template.template_id) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['prescription-templates'], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription-templates'] })
    },
  })

  const handleBookmarkToggle = (template: Template) => {
    bookmarkMutation.mutate({
      template,
      action: template.is_bookmarked ? 'remove' : 'add',
    })
  }

  const handleDelete = (template: Template) => {
    setTemplateToDelete(template)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!templateToDelete) return
    deleteMutation.mutate(templateToDelete)
    setIsDeleteDialogOpen(false)
    setTemplateToDelete(null)
  }

  return (
    <div className="container py-8 px-4 mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">RxMemory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and reuse your saved RxMemory</p>
        </div>
        <button
          onClick={() => navigate({ to: '/doctor/rx-memory/manage' })}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">New RxMemory</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Loading */}
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

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <BookMarkedIcon className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-slate-600 font-medium">Failed to load RxMemory</p>
          <p className="text-slate-400 text-sm">Please try again later</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <BookMarkedIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-700 font-semibold text-lg">No RxMemory yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first RxMemory to get started</p>
          </div>
          <button
            onClick={() => navigate({ to: '/doctor/rx-memory/manage' })}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Create RxMemory
          </button>
        </div>
      )}

      {/* Template grid */}
      {!isLoading && !isError && templates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.template_id}
              template={template}
              onBookmarkToggle={handleBookmarkToggle}
              isBookmarkPending={bookmarkMutation.isPending}
              onDelete={handleDelete}
              isDeletePending={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2 text-left">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Delete RxMemory?</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 text-left">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{templateToDelete?.template_name}"</span>?
              This action cannot be undone and will remove the RxMemory for all sessions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
            >
              Delete RxMemory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
