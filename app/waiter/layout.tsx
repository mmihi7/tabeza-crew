import { BottomTabNav } from '@/components/layout/BottomTabNav'

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="page-wrapper">{children}</main>
      <BottomTabNav />
    </>
  )
}
