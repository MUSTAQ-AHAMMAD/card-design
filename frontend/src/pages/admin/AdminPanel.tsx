import { useEffect, useState } from 'react'
import { usersApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, BarChart2, Settings2, Shield, Trash2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { User, UserRole } from '../../types'

const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', email: 'hr@example.com', firstName: 'HR', lastName: 'Manager', role: 'HR_MANAGER', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', email: 'employee1@example.com', firstName: 'Alice', lastName: 'Brown', role: 'EMPLOYEE', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', email: 'employee2@example.com', firstName: 'Bob', lastName: 'Johnson', role: 'EMPLOYEE', isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', email: 'employee3@example.com', firstName: 'Charlie', lastName: 'Davis', role: 'EMPLOYEE', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const CHART_DATA = [
  { month: 'Jul', giftCards: 20, users: 5 },
  { month: 'Aug', giftCards: 28, users: 8 },
  { month: 'Sep', giftCards: 35, users: 12 },
  { month: 'Oct', giftCards: 42, users: 7 },
  { month: 'Nov', giftCards: 38, users: 9 },
  { month: 'Dec', giftCards: 34, users: 6 },
]

const PIE_DATA = [
  { name: 'Admin', value: 1, color: '#4F46E5' },
  { name: 'HR Manager', value: 2, color: '#10B981' },
  { name: 'Employee', value: 87, color: '#F59E0B' },
]

const roleBadge: Record<UserRole, { variant: 'danger' | 'success' | 'info'; label: string }> = {
  ADMIN: { variant: 'danger', label: 'Admin' },
  HR_MANAGER: { variant: 'success', label: 'HR Manager' },
  EMPLOYEE: { variant: 'info', label: 'Employee' },
}

const TABS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'System Settings', icon: Settings2 },
]

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('EMPLOYEE')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    usersApi.getAll()
      .then((res) => setUsers(res.data.data?.length ? res.data.data : MOCK_USERS))
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await usersApi.delete(deleteTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      toast.success('User deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!editTarget) return
    setUpdating(true)
    try {
      await usersApi.update(editTarget.id, { role: newRole })
      setUsers((prev) => prev.map((u) => u.id === editTarget.id ? { ...u, role: newRole } : u))
      toast.success('Role updated')
      setEditTarget(null)
    } catch {
      toast.error('Failed to update role')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500">Manage users, analytics and system settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card padding="none">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={roleBadge[u.role].variant}>{roleBadge[u.role].label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.isActive ? 'success' : 'default'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditTarget(u); setNewRole(u.role) }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Monthly Activity</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={CHART_DATA} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                <Bar dataKey="giftCards" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Gift Cards" />
                <Bar dataKey="users" fill="#10B981" radius={[4, 4, 0, 0]} name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">User Roles Distribution</h2>
            <div className="flex items-center gap-6">
              <PieChart width={160} height={160}>
                <Pie data={PIE_DATA} dataKey="value" cx={75} cy={75} innerRadius={45} outerRadius={75}>
                  {PIE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="space-y-3">
                {PIE_DATA.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                    <span className="text-sm text-gray-600">{entry.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: users.length, color: 'bg-indigo-50 text-indigo-700' },
                { label: 'Active Users', value: users.filter(u => u.isActive).length, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: 'bg-red-50 text-red-700' },
                { label: 'HR Staff', value: users.filter(u => u.role === 'HR_MANAGER').length, color: 'bg-amber-50 text-amber-700' },
              ].map((m) => (
                <div key={m.label} className={`rounded-xl p-4 ${m.color}`}>
                  <p className="text-2xl font-bold">{m.value}</p>
                  <p className="text-sm opacity-80 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-6">System Settings</h2>
          <div className="space-y-4">
            {[
              { label: 'Maintenance Mode', desc: 'Prevent users from accessing the system', enabled: false },
              { label: 'Email Notifications', desc: 'Send email notifications for gift card events', enabled: true },
              { label: 'Allow Self Registration', desc: 'Allow new users to register without invite', enabled: true },
              { label: 'Require Email Verification', desc: 'Require email verification for new accounts', enabled: false },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{setting.desc}</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    setting.enabled ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" size="sm">
        <p className="text-gray-600">
          Delete <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Update Role" size="sm">
        <p className="text-gray-600 mb-4">
          Change role for <strong>{editTarget?.firstName} {editTarget?.lastName}</strong>
        </p>
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as UserRole)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ADMIN">Admin</option>
          <option value="HR_MANAGER">HR Manager</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setEditTarget(null)}>Cancel</Button>
          <Button className="flex-1" loading={updating} onClick={handleUpdateRole}>Update</Button>
        </div>
      </Modal>
    </div>
  )
}
