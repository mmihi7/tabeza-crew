'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Camera, ChevronRight, Bell, CreditCard, Shield,
  LogOut, MapPin, Images, ExternalLink,
  GraduationCap, Plus, Trash2, Sparkles, Check, X,
} from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { getDefaultAvatarStyle } from '@/lib/mock-data'
import { useAuth } from '@/contexts/AuthContext'
import type { Credential, Skill, CredentialType } from '@/lib/types'

const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  diploma:     'Diploma',
  certificate: 'Certificate',
  degree:      'Degree',
  license:     'License',
  other:       'Other',
}

const SUGGESTED_SKILLS = [
  'Wine Service', 'Cocktail Mixing', 'Coffee & Barista', 'Fine Dining',
  'Customer Relations', 'Cash Handling', 'Upselling', 'Menu Knowledge',
  'Swahili', 'English', 'French', 'Food Safety', 'Bar Management',
]

export default function MePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  // Real identity from session only — no mock fallback
  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Your Profile'

  const { background: avatarBg, initials } = getDefaultAvatarStyle(displayName)

  // New user — no venues worked yet
  const venues: { name: string; shifts: number }[] = []

  // ── Credentials state ──────────────────────────────────────────────────
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [showCredentialForm, setShowCredentialForm] = useState(false)
  const [newCred, setNewCred] = useState<Omit<Credential, 'id' | 'isVerified'>>({
    type: 'certificate', title: '', institution: '', yearObtained: '',
  })

  function addCredential() {
    if (!newCred.title || !newCred.institution) return
    setCredentials(prev => [...prev, {
      ...newCred,
      id: `cred-${Date.now()}`,
      isVerified: false,
    }])
    setNewCred({ type: 'certificate', title: '', institution: '', yearObtained: '' })
    setShowCredentialForm(false)
  }

  function removeCredential(id: string) {
    setCredentials(prev => prev.filter(c => c.id !== id))
  }

  // ── Skills state ───────────────────────────────────────────────────────
  const [skills, setSkills] = useState<Skill[]>([])
  const [showSkillInput, setShowSkillInput] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  function addSkill(name: string) {
    const trimmed = name.trim()
    if (!trimmed || skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) return
    setSkills(prev => [...prev, { id: `skill-${Date.now()}`, name: trimmed, category: 'other' }])
    setSkillInput('')
    setShowSkillInput(false)
  }

  function removeSkill(id: string) {
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  // ── Credentials & Skills (local state until Supabase is wired) ───────────
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [skills, setSkills]           = useState<Skill[]>([])
  const [showCredForm, setShowCredForm] = useState(false)
  const [showSkillForm, setShowSkillForm] = useState(false)

  const [newCred, setNewCred] = useState<Omit<Credential, 'id' | 'isVerified' | 'documentUrl'>>({
    type: 'certificate', title: '', institution: '', year: '',
  })
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'id'>>({
    name: '', level: 'intermediate',
  })

  function addCredential() {
    if (!newCred.title || !newCred.institution) return
    setCredentials(prev => [...prev, {
      ...newCred,
      id: `cred-${Date.now()}`,
      isVerified: false,
    }])
    setNewCred({ type: 'certificate', title: '', institution: '', year: '' })
    setShowCredForm(false)
  }

  function addSkill() {
    if (!newSkill.name) return
    setSkills(prev => [...prev, { ...newSkill, id: `skill-${Date.now()}` }])
    setNewSkill({ name: '', level: 'intermediate' })
    setShowSkillForm(false)
  }

  function removeCredential(id: string) {
    setCredentials(prev => prev.filter(c => c.id !== id))
  }

  function removeSkill(id: string) {
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  return (
    // Outer wrapper — no horizontal padding so the hero bleeds edge-to-edge
    <div style={{ minHeight: '100%', background: 'var(--background-primary)' }}>

      {/* ── HERO PANEL ── roughly 1/3 viewport height ─────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '33dvh',
          minHeight: 220,
          maxHeight: 320,
          overflow: 'hidden',
          background: 'var(--background-tertiary)',
        }}
      >
        {/* New users have no photo yet — show initials gradient */}
          <div
            style={{
              width: '100%', height: '100%',
              background: `linear-gradient(160deg, ${avatarBg} 0%, var(--background-tertiary) 100%)`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e',
            }}>
              {initials}
            </div>
          </div>

        {/* Dark gradient fade at bottom for legibility */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* Name + badge overlay at bottom of hero */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                {displayName}
              </h1>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                New member
              </div>
            </div>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(245,158,11,0.85)',
                backdropFilter: 'blur(4px)',
                borderRadius: '999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e',
              }}
            >
              Standard
            </span>
          </div>
        </div>

        {/* Top-right: edit photo button */}
        <Link
          href="/waiter/me/photos"
          style={{
            position: 'absolute', top: '0.875rem', right: '0.875rem',
            width: 36, height: 36, borderRadius: '0.5rem',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <Camera size={17} style={{ color: '#fff' }} />
        </Link>
      </div>

      {/* ── ACTION ROW ── sits between hero and content ─────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.625rem',
          padding: '0.875rem 1rem',
          background: 'var(--background-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Gallery link */}
        <Link
          href="/waiter/me/photos"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem',
            background: 'var(--background-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: '0.625rem',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          <Images size={16} style={{ color: 'var(--amber)' }} />
          Edit Gallery
        </Link>

        {/* Public profile link */}
        <Link
          href="#"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem',
            background: 'var(--amber-pale)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: '0.625rem',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--amber)',
          }}
        >
          <ExternalLink size={15} />
          Public Profile
        </Link>
      </div>

      {/* ── SCROLLABLE CONTENT ─────────────────────────────────────────────── */}
      <div style={{ padding: '1.25rem 1rem' }}>

        {/* ── Performance stats ──────────────────────────────────── */}
        <SectionHeading title="Performance" />
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem 1.5rem' }}>
            {[
              { label: 'Orders approved', value: '0' },
              { label: 'Approval rate',   value: '—' },
              { label: 'Tips earned',     value: 'KES 0' },
              { label: 'Customer likes',  value: '0' },
              { label: 'Points',          value: '0 pts' },
              { label: 'Platform rank',   value: '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Credentials ────────────────────────────────────────────────── */}
        <SectionHeading title="Credentials" />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
          Diplomas, degrees, certificates and licences — visible to venues on the marketplace.
        </p>

        {credentials.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '0.75rem' }}>
            {credentials.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.875rem 1.25rem',
                  borderBottom: i < credentials.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '0.625rem', flexShrink: 0,
                  background: 'var(--amber-pale)', border: '1px solid rgba(245,158,11,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GraduationCap size={16} style={{ color: 'var(--amber)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {c.institution}{c.year ? ` · ${c.year}` : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.3rem' }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, textTransform: 'capitalize',
                      padding: '0.1rem 0.5rem', borderRadius: '999px',
                      background: 'var(--background-tertiary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-secondary)',
                    }}>
                      {c.type}
                    </span>
                    {c.isVerified && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600,
                        padding: '0.1rem 0.5rem', borderRadius: '999px',
                        background: 'rgba(16,185,129,0.10)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        color: 'var(--success)',
                      }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeCredential(c.id)}
                  style={{
                    width: 28, height: 28, borderRadius: '0.375rem', flexShrink: 0,
                    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} style={{ color: 'var(--error)' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add credential form */}
        {showCredForm ? (
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Type</label>
                <select
                  className="input"
                  value={newCred.type}
                  onChange={e => setNewCred(p => ({ ...p, type: e.target.value as CredentialType }))}
                >
                  {(['diploma','degree','certificate','license','training','other'] as CredentialType[]).map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Title</label>
                <input
                  type="text" className="input"
                  placeholder="e.g. Diploma in Food & Beverage"
                  value={newCred.title}
                  onChange={e => setNewCred(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Institution</label>
                <input
                  type="text" className="input"
                  placeholder="e.g. Kenya Utalii College"
                  value={newCred.institution}
                  onChange={e => setNewCred(p => ({ ...p, institution: e.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Year (optional)</label>
                <input
                  type="text" className="input"
                  placeholder="e.g. 2022"
                  value={newCred.year}
                  onChange={e => setNewCred(p => ({ ...p, year: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowCredForm(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={addCredential}>Add</button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'center', gap: '0.375rem', marginBottom: '1.5rem' }}
            onClick={() => setShowCredForm(true)}
          >
            <Plus size={15} /> Add Credential
          </button>
        )}

        {/* ── Skills ─────────────────────────────────────────────────────────── */}
        <SectionHeading title="Skills" />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
          Specific abilities venues filter by — wine service, mixology, barista, languages, etc.
        </p>

        {skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {skills.map(s => (
              <div
                key={s.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  background: s.level === 'expert'
                    ? 'var(--amber-pale)'
                    : s.level === 'intermediate'
                      ? 'var(--background-secondary)'
                      : 'var(--background-tertiary)',
                  border: `1px solid ${s.level === 'expert' ? 'rgba(245,158,11,0.3)' : 'var(--border-default)'}`,
                  fontSize: '0.78rem', fontWeight: 500,
                  color: s.level === 'expert' ? 'var(--amber)' : 'var(--text-primary)',
                }}
              >
                {s.level === 'expert' && <Award size={11} style={{ color: 'var(--amber)' }} />}
                {s.level === 'intermediate' && <Zap size={11} style={{ color: 'var(--text-secondary)' }} />}
                {s.name}
                <button
                  onClick={() => removeSkill(s.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, marginLeft: '0.1rem' }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>×</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {showSkillForm ? (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Skill Name</label>
                <input
                  type="text" className="input"
                  placeholder="e.g. Wine Service, Mixology, Swahili"
                  value={newSkill.name}
                  onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="input-label">Level</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {(['beginner', 'intermediate', 'expert'] as Skill['level'][]).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setNewSkill(p => ({ ...p, level: lvl }))}
                      style={{
                        padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600,
                        cursor: 'pointer', border: '1px solid',
                        borderColor: newSkill.level === lvl ? 'var(--amber)' : 'var(--border-default)',
                        background: newSkill.level === lvl ? 'var(--amber-pale)' : 'var(--background-secondary)',
                        color: newSkill.level === lvl ? 'var(--amber)' : 'var(--text-secondary)',
                      }}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowSkillForm(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={addSkill}>Add</button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'center', gap: '0.375rem', marginBottom: '1.5rem' }}
            onClick={() => setShowSkillForm(true)}
          >
            <Plus size={15} /> Add Skill
          </button>
        )}

        {/* ── Venues worked ──────────────────────────────────────── */}
        <SectionHeading title="Venues Worked" />
        <div className="card" style={{ marginBottom: '1rem', padding: '0.875rem 1.25rem' }}>
          {venues.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '0.5rem 0' }}>
              No shifts yet — browse the Jobs tab to get started
            </p>
          ) : venues.map((v, i) => (
            <div key={v.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < venues.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{v.name}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.shifts} shifts</span>
            </div>
          ))}
        </div>

        {/* ── Credentials ───────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <SectionHeading title="Credentials" />
          <button
            onClick={() => setShowCredentialForm(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--amber)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0',
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Add credential form */}
        {showCredentialForm && (
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Type selector */}
              <div>
                <label className="input-label">Type</label>
                <select
                  className="input"
                  value={newCred.type}
                  onChange={e => setNewCred(p => ({ ...p, type: e.target.value as CredentialType }))}
                >
                  {Object.entries(CREDENTIAL_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Title</label>
                <input
                  type="text" className="input"
                  placeholder="e.g. Diploma in Food & Beverage Service"
                  value={newCred.title}
                  onChange={e => setNewCred(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Institution</label>
                <input
                  type="text" className="input"
                  placeholder="e.g. Kenya Utalii College"
                  value={newCred.institution}
                  onChange={e => setNewCred(p => ({ ...p, institution: e.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Year Obtained</label>
                <input
                  type="text" className="input"
                  placeholder="e.g. 2022"
                  value={newCred.yearObtained}
                  onChange={e => setNewCred(p => ({ ...p, yearObtained: e.target.value }))}
                  maxLength={4}
                  style={{ maxWidth: 120 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setShowCredentialForm(false)}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 2 }}
                  onClick={addCredential}
                  disabled={!newCred.title || !newCred.institution}
                >
                  <Check size={14} /> Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credentials list */}
        {credentials.length === 0 && !showCredentialForm ? (
          <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <GraduationCap size={22} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Add your diplomas, certificates, or degrees. These appear on your marketplace profile and build trust with venues.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {credentials.map(cred => (
              <div key={cred.id} className="card" style={{ padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.04em', padding: '0.1rem 0.5rem',
                        borderRadius: '999px',
                        background: 'var(--amber-pale)',
                        color: 'var(--amber)',
                        border: '1px solid rgba(245,158,11,0.2)',
                      }}>
                        {CREDENTIAL_TYPE_LABELS[cred.type]}
                      </span>
                      {cred.isVerified && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700,
                          color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem',
                        }}>
                          <Check size={10} /> Verified
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                      {cred.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {cred.institution}{cred.yearObtained ? ` · ${cred.yearObtained}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => removeCredential(cred.id)}
                    style={{
                      width: 28, height: 28, borderRadius: '0.375rem', flexShrink: 0,
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} style={{ color: 'var(--error)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Skills ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <SectionHeading title="Skills" />
          <button
            onClick={() => setShowSkillInput(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--amber)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0',
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Skill input */}
        {showSkillInput && (
          <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem 1rem' }}>
            <label className="input-label">Skill Name</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <input
                type="text" className="input" style={{ flex: 1 }}
                placeholder="e.g. Wine Service"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addSkill(skillInput) }}
                autoFocus
              />
              <button className="btn-primary" style={{ padding: '0.5rem 0.875rem' }} onClick={() => addSkill(skillInput)}>
                <Check size={15} />
              </button>
            </div>
            {/* Suggestions */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Suggestions
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {SUGGESTED_SKILLS.filter(s => !skills.some(sk => sk.name === s)).slice(0, 8).map(s => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  style={{
                    fontSize: '0.72rem', fontWeight: 500,
                    padding: '0.25rem 0.625rem', borderRadius: '999px',
                    background: 'var(--background-tertiary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                  }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skills chips */}
        {skills.length === 0 && !showSkillInput ? (
          <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={20} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Add skills like wine service, cocktail mixing, or languages. Skills are shown on your marketplace profile.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {skills.map(skill => (
              <div
                key={skill.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.375rem 0.75rem',
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '999px',
                  fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)',
                }}
              >
                {skill.name}
                <button
                  onClick={() => removeSkill(skill.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <X size={12} style={{ color: 'var(--text-tertiary)' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Availability ───────────────────────────────────────── */}
        <SectionHeading title="Availability" />
        <Link href="/waiter/me/availability" style={{ textDecoration: 'none' }}>
          <div
            className="card"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '1rem', cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Manage My Availability
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ⚫ Hidden from marketplace — update in Privacy settings
              </div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </Link>

        {/* ── Account settings ───────────────────────────────────── */}
        <SectionHeading title="Account" />
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {[
            { icon: Camera,     label: 'Edit Photos & Profile', href: '/waiter/me/photos'   },
            { icon: Bell,       label: 'Notification Settings', href: '#'                    },
            { icon: CreditCard, label: 'Payout Settings',       href: '#'                    },
            { icon: Shield,     label: 'Privacy & Marketplace', href: '/waiter/me/privacy'   },
          ].map(({ icon: Icon, label, href }, i, arr) => (
            <Link
              key={label}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1.25rem',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                textDecoration: 'none',
              }}
            >
              <Icon size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {label}
              </span>
              <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
            </Link>
          ))}
        </div>

        {/* Log out */}
        <button
          className="btn-ghost"
          style={{ width: '100%', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.25)', marginBottom: '1rem' }}
          onClick={async () => { await signOut(); router.replace('/auth/login') }}
        >
          <LogOut size={16} style={{ color: 'var(--error)' }} />
          Log Out
        </button>

      </div>
    </div>
  )
}
