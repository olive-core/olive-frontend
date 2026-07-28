import { createFileRoute } from '@tanstack/react-router'

import MicTestPanel from '@/components/device/mic-test-panel'
import MicTroubleshooting from '@/components/device/mic-troubleshooting'

export const Route = createFileRoute('/doctor/device-check/')({
  component: DeviceCheckPage,
})

function DeviceCheckPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Microphone check</h1>
        <p className="mt-1 text-sm text-slate-700">
          Make sure Olive can hear your consultations clearly.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <MicTestPanel />
        <MicTroubleshooting />
      </div>
    </div>
  )
}
