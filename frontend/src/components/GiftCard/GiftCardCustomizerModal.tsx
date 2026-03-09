import { useRef, useState } from 'react'
import { X, ImageIcon, FileText, ImagePlus } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { GiftCardPreview, type LogoOption } from './GiftCardPreview'
import type { GiftCard } from '../../types'
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

export function GiftCardCustomizerModal({ isOpen, onClose, card }: GiftCardCustomizerModalProps) {
  const [recipientName, setRecipientName] = useState(card.recipientName || '')
  const [logoOption, setLogoOption] = useState<LogoOption>('none')
  const [downloading, setDownloading] = useState<'jpeg' | 'pdf' | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const hasUploadedDesign = !!card.template?.designData?.backgroundImage

  const captureCard = async (): Promise<HTMLCanvasElement> => {
    if (!previewRef.current) throw new Error('Preview not available')
    return html2canvas(previewRef.current, {
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
      // Use a wide landscape PDF page that matches the card's 1.586:1 aspect ratio (credit card standard)
      // A5 landscape width (148mm) is chosen as a convenient print-ready size
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
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Your Gift Card" size="xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Editor panel */}
        <div className="flex-1 space-y-5">
          {/* HR-uploaded design badge */}
          {hasUploadedDesign && (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
              <ImagePlus size={15} className="shrink-0" />
              <span>This card uses a custom design uploaded by HR. Personalize it below.</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Logo</label>
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

          {/* Download actions */}
          <div className="pt-2 space-y-2">
            <p className="text-sm font-medium text-gray-700">Download</p>
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

        {/* Card preview */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-gray-500 self-start">Live Preview</p>
          <div ref={previewRef} className="inline-flex">
            <GiftCardPreview
              template={card.template}
              amount={card.amount}
              occasion={card.occasion}
              message={card.personalMessage}
              recipientName={recipientName || card.recipientName || 'Your Name'}
              logoOption={logoOption}
            />
          </div>
          <p className="text-xs text-gray-400 text-center max-w-xs">
            Edit your name and pick a logo above — the preview updates in real time.
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
