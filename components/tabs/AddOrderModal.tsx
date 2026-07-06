'use client'

import { useState } from 'react'
import { X, Plus, Minus, Search, Send } from 'lucide-react'
import type { AssignedTab } from '@/lib/types'
import { formatCurrency } from '@/lib/demo-data'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
}

interface CartItem {
  item: MenuItem
  qty: number
}

interface AddOrderModalProps {
  tab: AssignedTab
  menuItems: MenuItem[]
  onSend: (items: string, amount: number) => void
  onClose: () => void
}

export function AddOrderModal({ tab, menuItems, onSend, onClose }: AddOrderModalProps) {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [sending, setSending] = useState(false)

  const filtered = menuItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const categories = Array.from(new Set(filtered.map(i => i.category)))

  function getQty(id: string) {
    return cart.find(c => c.item.id === id)?.qty ?? 0
  }

  function adjust(item: MenuItem, delta: number) {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id)
      if (!existing) {
        if (delta <= 0) return prev
        return [...prev, { item, qty: 1 }]
      }
      const newQty = existing.qty + delta
      if (newQty <= 0) return prev.filter(c => c.item.id !== item.id)
      return prev.map(c => c.item.id === item.id ? { ...c, qty: newQty } : c)
    })
  }

  const total = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0)

  const itemsLabel = cart
    .map(c => `${c.qty}x ${c.item.name}`)
    .join(', ')

  function handleSend() {
    if (cart.length === 0) return
    setSending(true)
    // Simulate API call
    setTimeout(() => {
      setSending(false)
      onSend(itemsLabel, total)
    }, 800)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Add Order
            </h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              Table {tab.tableNumber} · {tab.customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid var(--border-default)',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem', flexShrink: 0 }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            className="input"
            placeholder="Search menu…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        {/* Menu items — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amber)', marginBottom: '0.5rem' }}>
                {cat}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {filtered.filter(i => i.category === cat).map(item => {
                  const qty = getQty(item.id)
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        background: qty > 0 ? 'var(--amber-pale)' : 'var(--background-secondary)',
                        border: `1px solid ${qty > 0 ? 'rgba(245,158,11,0.25)' : 'var(--border-default)'}`,
                        borderRadius: '0.5rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: qty > 0 ? 600 : 500, color: 'var(--text-primary)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 600 }}>
                          {formatCurrency(item.price)}
                        </div>
                      </div>

                      {/* Qty controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => adjust(item, -1)}
                              style={{
                                width: 28, height: 28, borderRadius: '50%',
                                border: '1px solid var(--border-default)',
                                background: 'var(--background-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <Minus size={12} style={{ color: 'var(--text-primary)' }} />
                            </button>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: 16, textAlign: 'center' }}>
                              {qty}
                            </span>
                          </>
                        )}
                        <button
                          onClick={() => adjust(item, 1)}
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--amber)',
                            border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={12} style={{ color: '#1a1a2e' }} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer — cart total + send */}
        <div style={{ flexShrink: 0 }}>
          {cart.length > 0 && (
            <div
              style={{
                padding: '0.75rem',
                background: 'var(--background-tertiary)',
                borderRadius: '0.5rem',
                marginBottom: '0.875rem',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {cart.map(c => `${c.qty}x ${c.item.name}`).join(' · ')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Total
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--amber)' }}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSend}
              disabled={cart.length === 0 || sending}
              style={{ flex: 2, gap: '0.375rem' }}
            >
              <Send size={15} />
              {sending ? 'Sending…' : `Send to Customer`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
