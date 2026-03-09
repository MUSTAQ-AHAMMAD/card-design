import React from 'react'
import type { Template } from '../../types'

export type LogoOption = 'none' | 'star' | 'diamond' | 'shield' | 'crown' | 'heart' | 'rocket'

interface GiftCardPreviewProps {
  template?: Template | null
  amount?: number
  occasion?: string
  message?: string
  recipientName?: string
  senderName?: string
  compact?: boolean
  logoOption?: LogoOption
}

const LOGO_SVGS: Record<LogoOption, React.ReactNode> = {
  none: null,
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  diamond: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M6 2l-6 8 12 12L24 10 18 2H6zM2.5 9L6 4h12l3.5 5-9.5 9.5L2.5 9z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  ),
  crown: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  rocket: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2.5C9.5 2.5 6 6.5 6 12H4l4 4 4-4h-2c0-4.5 2.5-7.5 4-8.5 1.5 1 4 4 4 8.5h-2l4 4 4-4h-2c0-5.5-3.5-9.5-6-9.5z" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  ),
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
  logoOption = 'none',
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
          <div className="flex items-center gap-2">
            {logoOption && logoOption !== 'none' && (
              <div
                className={`rounded-full flex items-center justify-center opacity-90 ${compact ? 'w-6 h-6' : 'w-8 h-8'}`}
                style={{ color: design.accentColor || '#F59E0B' }}
              >
                {LOGO_SVGS[logoOption]}
              </div>
            )}
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: design.accentColor || '#F59E0B', color: '#1F2937' }}
            >
              GIFT
            </div>
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
