import { clsx } from 'clsx'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

const colors = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-teal-500',
]

function getColor(name: string) {
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center text-white font-semibold shrink-0',
        getColor(name),
        sizeMap[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
