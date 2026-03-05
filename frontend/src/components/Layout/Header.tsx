import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../ui/Avatar'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
