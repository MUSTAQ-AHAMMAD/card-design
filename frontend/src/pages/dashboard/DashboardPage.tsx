import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Send, Layout, Users, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { format } from 'date-fns'
import type { ApiResponse, DashboardStats } from '../../types'

interface BackendDashboardData {
  totalGiftCards?: number
  totalUsers?: number
  giftCardsByStatus?: Record<string, number>
}

const MOCK_STATS: DashboardStats = {
  totalGiftCards: 248,
  sentThisMonth: 34,
  totalTemplates: 12,
  activeUsers: 89,
  recentActivity: [
    { id: '1', type: 'GIFT_CARD_SENT', description: 'Gift card sent to Jane Smith', user: 'Admin', timestamp: new Date().toISOString() },
    { id: '2', type: 'TEMPLATE_CREATED', description: 'New template "Birthday Bash" created', user: 'HR Team', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', type: 'GIFT_CARD_REDEEMED', description: 'Gift card redeemed by Bob Johnson', user: 'Bob Johnson', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', type: 'USER_REGISTERED', description: 'New employee Alice Brown registered', user: 'Alice Brown', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ],
  monthlyStats: [
    { month: 'Jul', sent: 20, redeemed: 15 },
    { month: 'Aug', sent: 28, redeemed: 22 },
    { month: 'Sep', sent: 35, redeemed: 28 },
    { month: 'Oct', sent: 42, redeemed: 35 },
    { month: 'Nov', sent: 38, redeemed: 30 },
    { month: 'Dec', sent: 34, redeemed: 26 },
  ],
  upcomingOccasions: [
    { id: '1', name: 'Sarah Connor', date: new Date(Date.now() + 3 * 86400000).toISOString(), type: 'Birthday' },
    { id: '2', name: 'John Wick', date: new Date(Date.now() + 7 * 86400000).toISOString(), type: 'Work Anniversary' },
    { id: '3', name: 'Maria Garcia', date: new Date(Date.now() + 14 * 86400000).toISOString(), type: 'Birthday' },
  ],
}

const activityColors: Record<string, string> = {
  GIFT_CARD_SENT: 'bg-indigo-100 text-indigo-600',
  TEMPLATE_CREATED: 'bg-emerald-100 text-emerald-600',
  GIFT_CARD_REDEEMED: 'bg-amber-100 text-amber-600',
  USER_REGISTERED: 'bg-purple-100 text-purple-600',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.getDashboard()
      .then((res) => {
        const apiData = (res.data as unknown as ApiResponse<BackendDashboardData>).data
        setStats({
          ...MOCK_STATS,
          totalGiftCards: apiData?.totalGiftCards ?? MOCK_STATS.totalGiftCards,
          sentThisMonth: apiData?.giftCardsByStatus?.['SENT'] ?? MOCK_STATS.sentThisMonth,
          activeUsers: apiData?.totalUsers ?? MOCK_STATS.activeUsers,
        })
      })
      .catch(() => setStats(MOCK_STATS))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Gift Cards', value: stats.totalGiftCards, icon: CreditCard, color: 'bg-indigo-500', change: '+12%' },
    { label: 'Sent This Month', value: stats.sentThisMonth, icon: Send, color: 'bg-emerald-500', change: '+8%' },
    { label: 'Templates', value: stats.totalTemplates, icon: Layout, color: 'bg-amber-500', change: '+2' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'bg-purple-500', change: '+5' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your gift cards today.</p>
        </div>
        <Link to="/gift-cards/create">
          <Button leftIcon={<Plus size={16} />}>
            Send Gift Card
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <stat.icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                <TrendingUp size={10} className="inline mr-1" />
                {stat.change} this month
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Monthly Overview</h2>
              <p className="text-sm text-gray-400">Gift cards sent vs redeemed</p>
            </div>
            <Badge variant="info">Last 6 months</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthlyStats} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="sent" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Sent" />
              <Bar dataKey="redeemed" fill="#10B981" radius={[4, 4, 0, 0]} name="Redeemed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Upcoming occasions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Occasions</h2>
          </div>
          <div className="space-y-3">
            {stats.upcomingOccasions.map((occ) => (
              <div key={occ.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">
                  {occ.type === 'Birthday' ? '🎂' : '🎉'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{occ.name}</p>
                  <p className="text-xs text-gray-400">{occ.type} · {format(new Date(occ.date), 'MMM d')}</p>
                </div>
                <Link to="/gift-cards/create">
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap">
                    Send →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${activityColors[item.type]}`}>
                  {item.type === 'GIFT_CARD_SENT' ? '💳' :
                    item.type === 'TEMPLATE_CREATED' ? '🎨' :
                    item.type === 'GIFT_CARD_REDEEMED' ? '✅' : '👤'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                    {item.user && ` · ${item.user}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Send Gift Card', to: '/gift-cards/create', icon: '💳', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
              { label: 'New Template', to: '/templates/new', icon: '🎨', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
              { label: 'View All Cards', to: '/gift-cards', icon: '📋', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
              { label: 'Email Templates', to: '/email-templates', icon: '📧', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${action.color}`}
              >
                <span>{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
                <ArrowRight size={14} className="ml-auto" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
