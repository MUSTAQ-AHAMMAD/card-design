import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, Layout, Mail, ShieldCheck,
  Settings, LogOut, X, Gift
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../ui/Avatar'
import { clsx } from 'clsx'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/gift-cards', icon: CreditCard, label: 'Gift Cards' },
  { to: '/templates', icon: Layout, label: 'Templates' },
  { to: '/email-templates', icon: Mail, label: 'Email Templates' },
]

const adminItems = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER'

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200',
          'flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Gift size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">GiftCard</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {isAdminOrHR && (
            <>
              <div className="pt-4 pb-1">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Management
                </p>
              </div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}

          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Account
            </p>
          </div>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
