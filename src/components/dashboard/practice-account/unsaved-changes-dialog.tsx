import { useBlocker } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function UnsavedChangesDialog({ dirty }: { dirty: boolean }) {
  const blocker = useBlocker({
    shouldBlockFn: () => dirty,
    enableBeforeUnload: dirty,
    withResolver: true,
  })
  return (
    <Dialog open={blocker.status === 'blocked'} onOpenChange={(open) => { if (!open) blocker.reset?.() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave without saving?</DialogTitle>
          <DialogDescription>Your changes haven’t been saved. Stay here to finish editing, or discard them and leave.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="min-h-11" variant="outline" onClick={() => blocker.reset?.()}>Keep editing</Button>
          <Button className="min-h-11" variant="destructive" onClick={() => blocker.proceed?.()}>Discard changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
