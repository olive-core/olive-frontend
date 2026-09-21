import { createFileRoute } from '@tanstack/react-router'

import AccountLayout from '@/components/dashboard/practice-account/account-layout'
import MicTestPanel from '@/components/device/mic-test-panel'
import MicTroubleshooting from '@/components/device/mic-troubleshooting'

export const Route = createFileRoute('/doctor/device-check/')({
  component: DeviceCheckPage,
})

function DeviceCheckPage() {
  return (
    <AccountLayout section="devices" title="Devices" description="Check the microphone on this device before your next consultation. Results apply only to the phone or computer you’re using now.">
      <div className="flex flex-col gap-6">
        <MicTestPanel />
        <MicTroubleshooting />
      </div>
    </AccountLayout>
  )
}
