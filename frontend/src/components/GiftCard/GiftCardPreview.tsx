import type { Template } from '../../types'

interface GiftCardPreviewProps {
  template?: Template | null
  amount?: number
  occasion?: string
  message?: string
  recipientName?: string
  senderName?: string
  compact?: boolean
}

const defaultDesign = {
  backgroundColor: '#4F46E5',
  textColor: '#FFFFFF',
  accentColor: '#F59E0B',
  borderRadius: '16px',
}

export function GiftCardPreview({
  template,
  amount = 50,
  occasion = 'Birthday',
  message = 'Wishing you a wonderful day!',
  recipientName = 'John Doe',
  senderName = 'The Team',
  compact = false,
}: GiftCardPreviewProps) {
  const design = template?.designData || defaultDesign

  return (
    <div
      className={`relative overflow-hidden shadow-2xl ${compact ? 'w-full max-w-xs' : 'w-full max-w-sm'}`}
      style={{
        borderRadius: design.borderRadius || '16px',
        background: design.backgroundColor || '#4F46E5',
        aspectRatio: '1.586 / 1',
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, ${design.accentColor || '#F59E0B'} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, white 0%, transparent 50%)`,
        }}
      />

      {/* Decorative circles */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
        style={{ background: design.accentColor || '#F59E0B' }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-15"
        style={{ background: 'white' }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-5" style={{ color: design.textColor || '#FFFFFF' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-70 uppercase tracking-widest font-medium">Gift Card</p>
            <p className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>{occasion}</p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: design.accentColor || '#F59E0B', color: '#1F2937' }}
          >
            GIFT
          </div>
        </div>

        {/* Amount */}
        <div className="text-center">
          <p className={`font-black ${compact ? 'text-4xl' : 'text-5xl'}`}>
            ${amount.toFixed(2)}
          </p>
          {message && (
            <p className={`mt-1 opacity-80 italic ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>
              "{message}"
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs opacity-60">To</p>
            <p className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{recipientName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-60">From</p>
            <p className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{senderName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
