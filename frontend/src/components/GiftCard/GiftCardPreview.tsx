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
  companyName?: string
}

const OCCASION_EMOJI: Record<string, string> = {
  Birthday: '🎂',
  'Work Anniversary': '🏆',
  Holiday: '🎄',
  Congratulations: '🎉',
  'Thank You': '🙏',
  Welcome: '👋',
  'Performance Recognition': '⭐',
  'New Employee Welcome': '🤝',
  'Team Achievement': '🚀',
  'Farewell Message': '💐',
  Other: '🎁',
}

const OCCASION_HEADLINE: Record<string, string> = {
  Birthday: 'Wishing You a Very Happy Birthday!',
  'Work Anniversary': 'Celebrating Your Work Anniversary',
  Holiday: 'Season\'s Greetings & Best Wishes',
  Congratulations: 'Congratulations on Your Achievement!',
  'Thank You': 'Thank You for Your Dedication',
  Welcome: 'Welcome to the Team!',
  'Performance Recognition': 'Recognizing Your Outstanding Performance',
  'New Employee Welcome': 'Welcome Aboard — We\'re Glad You\'re Here',
  'Team Achievement': 'Celebrating Our Team\'s Success',
  'Farewell Message': 'Wishing You All the Best',
  Other: 'A Special Recognition for You',
}

const defaultDesign = {
  backgroundColor: '#1E3A5F',
  textColor: '#FFFFFF',
  accentColor: '#F59E0B',
  fontFamily: 'Arial',
  borderRadius: '8px',
  backgroundImage: undefined as string | undefined,
}

export function GiftCardPreview({
  template,
  amount = 50,
  occasion = 'Birthday',
  message = 'Wishing you a wonderful day!',
  recipientName = 'John Doe',
  senderName = 'The HR Team',
  compact = false,
  companyName = 'CorpHR™ Connect',
}: GiftCardPreviewProps) {
  const design = template?.designData || defaultDesign
  const primaryColor = design.backgroundColor || defaultDesign.backgroundColor
  const accentColor = design.accentColor || defaultDesign.accentColor
  const emoji = OCCASION_EMOJI[occasion] || '🎁'
  const headline = OCCASION_HEADLINE[occasion] || `A Special ${occasion} Message`

  // Compact thumbnail: show a styled email header thumbnail
  if (compact) {
    return (
      <div
        style={{
          width: '220px',
          minWidth: '220px',
          height: '139px',
          borderRadius: design.borderRadius || '8px',
          overflow: 'hidden',
          background: '#f8fafc',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
        }}
      >
        {/* Email header strip */}
        <div style={{ background: primaryColor, padding: '10px 12px', position: 'relative' }}>
          {design.backgroundImage && (
            <img
              src={design.backgroundImage}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
              crossOrigin="anonymous"
            />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
              Human Resources Department
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{emoji} {occasion}</div>
          </div>
        </div>

        {/* Divider accent */}
        <div style={{ height: '3px', background: accentColor }} />

        {/* Body snippet */}
        <div style={{ padding: '8px 12px', flex: 1 }}>
          <div style={{ fontSize: '8px', color: '#374151', fontWeight: 600, marginBottom: '3px' }}>
            Dear {recipientName},
          </div>
          <div style={{ fontSize: '7px', color: '#6b7280', lineHeight: 1.4, marginBottom: '6px' }}>
            {headline.length > 38 ? headline.slice(0, 38) + '…' : headline}
          </div>
          {/* Gift value badge */}
          <div style={{
            display: 'inline-block',
            background: accentColor,
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 900,
            color: '#1F2937',
          }}>
            ${amount.toFixed(2)}
          </div>
        </div>

        {/* Footer strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '4px 12px', fontSize: '6px', color: '#94a3b8' }}>
          From: {senderName} · Confidential HR Communication
        </div>
      </div>
    )
  }

  // Full preview: professional MNC HR email template
  return (
    <div
      style={{
        width: '520px',
        minWidth: '520px',
        fontFamily: design.fontFamily ? `${design.fontFamily}, Arial, sans-serif` : 'Arial, Helvetica, sans-serif',
        background: '#f1f5f9',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      }}
    >
      {/* Email chrome bar */}
      <div style={{ background: '#e2e8f0', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #cbd5e1' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} />
        <div style={{ flex: 1, marginLeft: '8px', background: '#fff', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', color: '#64748b' }}>
          HR Communication · {occasion}
        </div>
      </div>

      {/* Email body wrapper */}
      <div style={{ background: '#f1f5f9', padding: '16px' }}>
        <div style={{ background: '#ffffff', borderRadius: '6px', overflow: 'hidden' }}>

          {/* Company Header */}
          <div style={{ background: primaryColor, padding: '24px 28px 20px', position: 'relative', overflow: 'hidden' }}>
            {design.backgroundImage && (
              <img
                src={design.backgroundImage}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }}
                crossOrigin="anonymous"
              />
            )}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Human Resources Department
                </div>
                <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 900, letterSpacing: '-0.3px' }}>
                  {companyName}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: accentColor, color: '#1F2937', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', letterSpacing: '1px', display: 'inline-block' }}>
                  OFFICIAL
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', marginTop: '4px' }}>
                  Employee Communication
                </div>
              </div>
            </div>
          </div>

          {/* Accent stripe */}
          <div style={{ height: '4px', background: `linear-gradient(90deg, ${accentColor} 0%, ${primaryColor} 100%)` }} />

          {/* Occasion banner */}
          <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{emoji}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>{headline}</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px' }}>{occasion} Celebration</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 28px' }}>
            {/* Salutation */}
            <div style={{ fontSize: '13px', color: '#1e293b', marginBottom: '10px' }}>
              Dear <strong>{recipientName}</strong>,
            </div>

            {/* Personal message */}
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', marginBottom: '16px', padding: '12px 14px', background: '#f8fafc', borderLeft: `3px solid ${accentColor}`, borderRadius: '0 4px 4px 0' }}>
              {message || 'On behalf of the entire organization, we wish to recognize this special occasion and express our sincere appreciation for your continued contributions.'}
            </div>

            {/* Gift card value block */}
            <div style={{ background: primaryColor, borderRadius: '8px', padding: '16px 20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
              {design.backgroundImage && (
                <img
                  src={design.backgroundImage}
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }}
                  crossOrigin="anonymous"
                />
              )}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Gift Voucher Amount
                  </div>
                  <div style={{ color: '#ffffff', fontSize: '28px', fontWeight: 900 }}>
                    ${amount.toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ background: accentColor, color: '#1F2937', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', marginBottom: '4px', display: 'inline-block' }}>
                    GIFT VOUCHER
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px' }}>Valid for use at<br/>approved partners</div>
                </div>
              </div>
              {/* CTA button - preview only, not interactive */}
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', background: accentColor, color: '#1F2937', fontSize: '10px', fontWeight: 700, padding: '7px 24px', borderRadius: '4px', letterSpacing: '0.5px', cursor: 'default', userSelect: 'none' }}>
                  REDEEM YOUR GIFT →
                </div>
              </div>
              <div style={{ marginTop: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>Redemption link is included in the sent email</span>
              </div>
            </div>

            {/* Signature */}
            <div style={{ fontSize: '11px', color: '#374151', marginBottom: '4px' }}>
              With warm regards,
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{senderName}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Human Resources Department</div>
          </div>

          {/* Footer */}
          <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 28px' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.6', textAlign: 'center' }}>
              This is an official HR communication. Please do not reply to this email.<br />
              © {new Date().getFullYear()} {companyName} · Human Resources Department · All Rights Reserved
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Keep the old compact credit-card style for the customizer download feature
export function GiftCardCompactCard({
  template,
  amount = 50,
  occasion = 'Birthday',
  message,
  recipientName = 'John Doe',
  senderName = 'The HR Team',
  logoOption = 'none' as LogoOption,
}: Omit<GiftCardPreviewProps, 'compact'>) {
  const design = template?.designData || defaultDesign
  const primaryColor = design.backgroundColor || defaultDesign.backgroundColor
  const accentColor = design.accentColor || defaultDesign.accentColor

  return (
    <div
      style={{
        width: '340px',
        height: '214px',
        minWidth: '340px',
        borderRadius: design.borderRadius || '8px',
        background: design.backgroundImage ? undefined : primaryColor,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {design.backgroundImage && (
        <img src={design.backgroundImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
      )}
      {design.backgroundImage && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />}
      {!design.backgroundImage && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 20% 80%, ${accentColor} 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)`, opacity: 0.12 }} />
      )}
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '2px' }}>HR Gift Voucher</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{occasion}</div>
          </div>
          <div style={{ background: accentColor, borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: '#1F2937' }}>
            {logoOption !== 'none' ? logoOption.toUpperCase() : 'GIFT'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '44px', fontWeight: 900 }}>${amount.toFixed(2)}</div>
          {message && <div style={{ fontSize: '12px', opacity: 0.8, fontStyle: 'italic', marginTop: '4px' }}>"{message}"</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '9px', opacity: 0.6 }}>To</div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{recipientName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', opacity: 0.6 }}>From</div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{senderName}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
