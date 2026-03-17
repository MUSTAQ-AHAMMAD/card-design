import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Users, Pencil } from 'lucide-react'
import { giftCardsApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { format } from 'date-fns'
import type { GiftCard, GiftCardStatus } from '../../types'

const MOCK_CARDS: GiftCard[] = [
  { id: '1', code: 'GC-001', amount: 50, occasion: 'Birthday', personalMessage: 'Happy Birthday!', status: 'SENT', recipientEmail: 'jane@example.com', recipientName: 'Jane Smith', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', code: 'GC-002', amount: 100, occasion: 'Work Anniversary', status: 'RECEIVED', recipientEmail: 'bob@example.com', recipientName: 'Bob Johnson', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', code: 'GC-003', amount: 25, occasion: 'Holiday', status: 'DRAFT', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', code: 'GC-004', amount: 75, occasion: 'Congratulations', status: 'REDEEMED', recipientEmail: 'alice@example.com', recipientName: 'Alice Brown', createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', code: 'GC-005', amount: 150, occasion: 'Birthday', status: 'SENT', recipientEmail: 'charlie@example.com', recipientName: 'Charlie Davis', createdAt: new Date(Date.now() - 345600000).toISOString(), updatedAt: new Date().toISOString() },
]

const statusBadgeMap: Record<GiftCardStatus, { variant: 'success' | 'warning' | 'info' | 'default' | 'purple'; label: string }> = {
  DRAFT: { variant: 'default', label: 'Draft' },
  SENT: { variant: 'info', label: 'Sent' },
  RECEIVED: { variant: 'success', label: 'Received' },
  REDEEMED: { variant: 'purple', label: 'Redeemed' },
  EXPIRED: { variant: 'warning', label: 'Expired' },
}

const STATUS_FILTERS = ['All', 'DRAFT', 'SENT', 'RECEIVED', 'REDEEMED', 'EXPIRED']

export default function GiftCardsPage() {
  const { user } = useAuth()
  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER'
  const [cards, setCards] = useState<GiftCard[]>(MOCK_CARDS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    giftCardsApi.getAll()
      .then((res) => setCards(res.data.data?.length ? res.data.data : MOCK_CARDS))
      .catch(() => setCards(MOCK_CARDS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = cards.filter((c) => {
    const matchesSearch =
      c.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
      c.recipientEmail?.toLowerCase().includes(search.toLowerCase()) ||
      c.occasion.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gift Cards</h1>
          <p className="text-gray-500 mt-1">Track and manage all your gift cards</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdminOrHR && (
            <Link to="/gift-cards/bulk-send">
              <Button variant="outline" leftIcon={<Users size={16} />}>Bulk Send</Button>
            </Link>
          )}
          <Link to="/gift-cards/designer">
            <Button variant="outline" leftIcon={<Pencil size={16} />}>Open Designer</Button>
          </Link>
          <Link to="/gift-cards/create">
            <Button leftIcon={<Plus size={16} />}>Create Gift Card</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by recipient, occasion, code..."
              leftIcon={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-gray-400 text-lg">No gift cards found</p>
          <Link to="/gift-cards/create" className="mt-4 inline-block">
            <Button variant="outline" leftIcon={<Plus size={16} />}>Create your first gift card</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((card) => {
            const badgeInfo = statusBadgeMap[card.status]
            return (
              <Card key={card.id} hover className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Color indicator */}
                <div className="w-full sm:w-2 h-2 sm:h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 sm:rounded-sm sm:bg-gradient-to-b shrink-0" />

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Recipient</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {card.recipientName || 'Not specified'}
                    </p>
                    <p className="text-xs text-gray-400">{card.recipientEmail || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                    <p className="text-lg font-bold text-gray-900">${card.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Occasion</p>
                    <p className="text-sm font-medium text-gray-700">{card.occasion}</p>
                    <p className="text-xs text-gray-400">{format(new Date(card.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">{card.code}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
