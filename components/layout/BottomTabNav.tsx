'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Briefcase, History, User } from 'lucide-react'

export function BottomTabNav() {
  const pathname = usePathname()

  const tabs = [
    { id: 'home', label: 'Home', href: '/waiter', icon: Home },
    { id: 'jobs', label: 'Jobs', href: '/waiter/jobs', icon: Briefcase, badge: 2 },
    { id: 'history', label: 'History', href: '/waiter/history', icon: History },
    { id: 'me', label: 'Me', href: '/waiter/me', icon: User },
  ]

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
        const Icon = tab.icon

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`tab-btn ${isActive ? 'active' : ''}`.trim()}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </div>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
