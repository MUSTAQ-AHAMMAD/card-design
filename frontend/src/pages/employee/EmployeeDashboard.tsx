import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { giftCardsApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { GiftCardPreview } from '../../components/GiftCard/GiftCardPreview'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Plus, History } from 'lucide-react'
import { format } from 'date-fns'
import type { GiftCard, GiftCardStatus } from '../../types'

const MOCK_CARDS: GiftCard[] = [
  { id: '1', code: 'GC-001', amount: 50, occasion: 'Birthday', personalMessage: 'Happy Birthday! 🎂', status: 'RECEIVED', recipientEmail: 'me@example.com', recipientName: 'Me', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', code: 'GC-002', amount: 100, occasion: 'Work Anniversary', status: 'SENT', recipientEmail: 'me@example.com', recipientName: 'Me', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', code: 'GC-003', amount: 25, occasion: 'Holiday', status: 'REDEEMED', recipientEmail: 'me@example.com', recipientName: 'Me', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), updatedAt: new Date().toISOString() },
]

const statusBadgeMap: Record<GiftCardStatus, { variant: 'success' | 'warning' | 'info' | 'default' | 'purple'; label: string }> = {
  DRAFT: { variant: 'default', label: 'Draft' },
  SENT: { variant: 'info', label: 'Sent' },
  RECEIVED: { variant: 'success', label: 'Received' },
  REDEEMED: { variant: 'purple', label: 'Redeemed' },
  EXPIRED: { variant: 'warning', label: 'Expired' },
}

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [cards, setCards] = useState<GiftCard[]>(MOCK_CARDS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    giftCardsApi.getHistory()
      .then((res) => setCards(res.data.length ? res.data : MOCK_CARDS))
      .catch(() => setCards(MOCK_CARDS))
      .finally(() => setLoading(false))
  }, [])

  const activeCards = cards.filter((c) => c.status === 'SENT' || c.status === 'RECEIVED')
  const historyCards = cards.filter((c) => c.status === 'REDEEMED' || c.status === 'EXPIRED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Gift Cards 🎁
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.firstName}! Here are your gift cards.
          </p>
        </div>
        <Link to="/gift-cards/create">
          <Button leftIcon={<Plus size={16} />}>Send Gift Card</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Received', value: cards.length, color: 'bg-indigo-500' },
          { label: 'Active', value: activeCards.length, color: 'bg-emerald-500' },
          { label: 'Redeemed', value: historyCards.length, color: 'bg-amber-500' },
        ].map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
              <span className="text-white text-lg">🎁</span>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Active Cards */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Gift Cards</h2>
            {activeCards.length === 0 ? (
              <Card className="text-center py-10">
                <p className="text-gray-400">No active gift cards</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCards.map((card) => (
                  <Card key={card.id} hover padding="none" className="overflow-hidden">
                    <div className="p-4 flex justify-center bg-gray-50">
                      <GiftCardPreview
                        template={card.template}
                        amount={card.amount}
                        occasion={card.occasion}
                        message={card.personalMessage}
                        recipientName={card.recipientName || user?.firstName || 'Me'}
                        compact
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{card.occasion}</h3>
                        <Badge variant={statusBadgeMap[card.status].variant}>
                          {statusBadgeMap[card.status].label}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-indigo-600">${card.amount.toFixed(2)}</p>
                      {card.personalMessage && (
                        <p className="text-sm text-gray-500 italic mt-1">"{card.personalMessage}"</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(card.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          {historyCards.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <History size={18} />
                History
              </h2>
              <Card padding="none">
                <div className="divide-y divide-gray-50">
                  {historyCards.map((card) => (
                    <div key={card.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                        🎁
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{card.occasion}</p>
                        <p className="text-xs text-gray-400">{format(new Date(card.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${card.amount.toFixed(2)}</p>
                        <Badge variant={statusBadgeMap[card.status].variant} className="mt-0.5">
                          {statusBadgeMap[card.status].label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
