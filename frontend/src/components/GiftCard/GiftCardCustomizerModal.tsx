import { useRef, useState } from 'react'
import { X, ImageIcon, FileText, ImagePlus } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { GiftCardPreview, GiftCardCompactCard, type LogoOption } from './GiftCardPreview'
import type { GiftCard, Template } from '../../types'
import toast from 'react-hot-toast'

interface GiftCardCustomizerModalProps {
  isOpen: boolean
  onClose: () => void
  card: GiftCard
}

const LOGO_OPTIONS: { value: LogoOption; label: string; emoji: string }[] = [
  { value: 'none', label: 'None', emoji: '—' },
  { value: 'star', label: 'Star', emoji: '⭐' },
  { value: 'diamond', label: 'Diamond', emoji: '💎' },
  { value: 'shield', label: 'Shield', emoji: '🛡️' },
  { value: 'crown', label: 'Crown', emoji: '👑' },
  { value: 'heart', label: 'Heart', emoji: '❤️' },
  { value: 'rocket', label: 'Rocket', emoji: '🚀' },
]

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Times New Roman', label: 'Times New Roman' },
]

export function GiftCardCustomizerModal({ isOpen, onClose, card }: GiftCardCustomizerModalProps) {
  const [recipientName, setRecipientName] = useState(card.recipientName || '')
  const [personalMessage, setPersonalMessage] = useState(card.personalMessage || '')
  const [companyName, setCompanyName] = useState('CorpHR™ Connect')
  const [logoOption, setLogoOption] = useState<LogoOption>('none')
  const [backgroundColor, setBackgroundColor] = useState(
    card.template?.designData?.backgroundColor || '#1E3A5F'
  )
  const [accentColor, setAccentColor] = useState(
    card.template?.designData?.accentColor || '#F59E0B'
  )
  const [textColor, setTextColor] = useState(
    card.template?.designData?.textColor || '#FFFFFF'
  )
  const [fontFamily, setFontFamily] = useState(
    card.template?.designData?.fontFamily || 'Arial'
  )
  const [downloading, setDownloading] = useState<'jpeg' | 'pdf' | null>(null)
  const downloadRef = useRef<HTMLDivElement>(null)

  const hasUploadedDesign = !!card.template?.designData?.backgroundImage

  // Build a customized template merging original template with user overrides
  const customizedTemplate: Template = {
    ...(card.template || { id: '', name: '', category: '', isActive: true, usageCount: 0, createdAt: '', updatedAt: '' }),
    designData: {
      ...(card.template?.designData || {}),
      backgroundColor,
      accentColor,
      textColor,
      fontFamily,
      borderRadius: card.template?.designData?.borderRadius || '8px',
    },
  }

  const captureCard = async (): Promise<HTMLCanvasElement> => {
    if (!downloadRef.current) throw new Error('Preview not available')
    return html2canvas(downloadRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    })
  }

  const handleDownloadJPEG = async () => {
    setDownloading('jpeg')
    try {
      const canvas = await captureCard()
      const link = document.createElement('a')
      link.download = `gift-card-${card.code}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
      toast.success('Gift card downloaded as JPEG!')
    } catch {
      toast.error('Failed to download JPEG. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadPDF = async () => {
    setDownloading('pdf')
    try {
      const canvas = await captureCard()
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdfWidth = 148
      const pdfHeight = pdfWidth / 1.586
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pdfWidth, pdfHeight] })
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`gift-card-${card.code}.pdf`)
      toast.success('Gift card downloaded as PDF!')
    } catch {
      toast.error('Failed to download PDF. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your HR Gift Email" size="xl">
      <div className="flex flex-col gap-6">
        {/* Editor panel */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-4">
            {/* HR-uploaded design badge */}
            {hasUploadedDesign && (
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
                <ImagePlus size={15} className="shrink-0" />
                <span>This email uses a custom design uploaded by HR.</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name on Card</label>
              <Input
                placeholder="Enter your name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <Input
                placeholder="e.g. CorpHR™ Connect"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Personal Message</label>
              <textarea
                rows={3}
                placeholder="Write a heartfelt message..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
              />
            </div>

            {/* Design customization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Colors</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Background</span>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-9 w-full rounded-lg cursor-pointer border border-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Accent</span>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-full rounded-lg cursor-pointer border border-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Text</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-9 w-full rounded-lg cursor-pointer border border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Font Style</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Logo Style</label>
              <div className="grid grid-cols-4 gap-2">
                {LOGO_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLogoOption(opt.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-all
                      ${logoOption === opt.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-xl leading-none">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Download actions (compact card style) */}
            <div className="pt-2 space-y-2">
              <p className="text-sm font-medium text-gray-700">Download Gift Voucher Card</p>
              <p className="text-xs text-gray-400">Downloads a compact gift voucher card image for print or attachment</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  leftIcon={<ImageIcon size={16} />}
                  loading={downloading === 'jpeg'}
                  disabled={!!downloading}
                  onClick={handleDownloadJPEG}
                >
                  Download JPEG
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  leftIcon={<FileText size={16} />}
                  loading={downloading === 'pdf'}
                  disabled={!!downloading}
                  onClick={handleDownloadPDF}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Hidden compact card for download only */}
          <div
            ref={downloadRef}
            style={{ position: 'fixed', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}
            aria-hidden="true"
          >
            <GiftCardCompactCard
              template={customizedTemplate}
              amount={card.amount}
              occasion={card.occasion}
              message={personalMessage || card.personalMessage}
              recipientName={recipientName || card.recipientName || 'Your Name'}
              logoOption={logoOption}
            />
          </div>
        </div>

        {/* Email template preview */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-3">Email Preview</p>
          <div className="overflow-x-auto">
            <GiftCardPreview
              template={customizedTemplate}
              amount={card.amount}
              occasion={card.occasion}
              message={personalMessage || card.personalMessage}
              recipientName={recipientName || card.recipientName || 'Your Name'}
              senderName="HR Team"
              companyName={companyName}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            This is how your HR email will appear to the recipient.
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
        <Button variant="ghost" leftIcon={<X size={16} />} onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}
