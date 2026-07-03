'use client'

import { useState } from 'react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { HireRequestCard } from '@/components/jobs/HireRequestCard'
import { JobPostingCard } from '@/components/jobs/JobPostingCard'
import { AcceptShiftModal } from '@/components/jobs/AcceptShiftModal'
import { DeclineShiftModal } from '@/components/jobs/DeclineShiftModal'
import { ApplyConfirmModal } from '@/components/jobs/ApplyConfirmModal'
import { MOCK_HIRE_REQUESTS, MOCK_JOB_POSTINGS } from '@/lib/mock-data'
import type { HireRequest, ShiftPosting } from '@/lib/types'

type JobsTab = 'requests' | 'openings'

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState<JobsTab>('requests')
  const [acceptTarget, setAcceptTarget] = useState<HireRequest | null>(null)
  const [declineTarget, setDeclineTarget] = useState<HireRequest | null>(null)
  const [applyTarget, setApplyTarget] = useState<ShiftPosting | null>(null)

  const pendingRequests = MOCK_HIRE_REQUESTS.filter(r => r.status === 'pending')

  return (
    <>
      <div className="page-content">
        {/* Page title */}
        <div style={{ marginBottom: '0.25rem' }}>
          <h1 className="text-page-title">Jobs</h1>
          <p className="text-subtitle">Nairobi · This Week</p>
        </div>

        {/* Sub-tab navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-default)',
            marginBottom: '1.25rem',
            marginTop: '1rem',
          }}
        >
          {(['requests', 'openings'] as JobsTab[]).map((tab) => {
            const isActive = activeTab === tab
            const label = tab === 'requests'
              ? `Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`
              : 'Open Postings'
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive
                    ? '2px solid var(--amber)'
                    : '2px solid transparent',
                  marginBottom: '-1px',
                  cursor: 'pointer',
                  color: isActive ? 'var(--amber)' : 'var(--text-secondary)',
                  transition: 'color 0.15s',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Requests sub-tab */}
        {activeTab === 'requests' && (
          <div>
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '2rem' }}>📭</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  No pending requests
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Venues will send hire offers when they find you in the marketplace
                </div>
              </div>
            ) : (
              <>
                <SectionHeading
                  title="Hire Requests"
                  description="Direct offers from venue managers — respond before they expire"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingRequests.map(request => (
                    <HireRequestCard
                      key={request.id}
                      request={request}
                      onAccept={() => setAcceptTarget(request)}
                      onDecline={() => setDeclineTarget(request)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Open Postings sub-tab */}
        {activeTab === 'openings' && (
          <div>
            <SectionHeading
              title={`${MOCK_JOB_POSTINGS.length} openings nearby`}
              description="Verified shifts at Tabeza venues"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_JOB_POSTINGS.map(posting => (
                <JobPostingCard
                  key={posting.id}
                  posting={posting}
                  onApply={() => setApplyTarget(posting)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {acceptTarget && (
        <AcceptShiftModal
          request={acceptTarget}
          onConfirm={() => {
            alert(`Accepted shift at ${acceptTarget.barName}! (UI demo)`)
            setAcceptTarget(null)
          }}
          onClose={() => setAcceptTarget(null)}
        />
      )}

      {declineTarget && (
        <DeclineShiftModal
          request={declineTarget}
          onConfirm={(reason, message) => {
            alert(`Declined: ${reason}${message ? ' — ' + message : ''} (UI demo)`)
            setDeclineTarget(null)
          }}
          onClose={() => setDeclineTarget(null)}
        />
      )}

      {applyTarget && (
        <ApplyConfirmModal
          posting={applyTarget}
          onConfirm={() => {
            alert(`Applied to ${applyTarget.barName}! (UI demo)`)
            setApplyTarget(null)
          }}
          onClose={() => setApplyTarget(null)}
        />
      )}
    </>
  )
}
