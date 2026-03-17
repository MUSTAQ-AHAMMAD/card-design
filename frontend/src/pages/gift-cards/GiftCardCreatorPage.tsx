import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronRight, Send, Pencil, Clock } from 'lucide-react'
import { templatesApi, giftCardsApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { GiftCardPreview } from '../../components/GiftCard/GiftCardPreview'
import { TemplateCard } from '../../components/GiftCard/TemplateCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import type { Template } from '../../types'

const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Birthday Wishes', category: 'Birthday', designData: { backgroundColor: '#7C3AED', textColor: '#FFFFFF', accentColor: '#FCD34D', fontFamily: 'Arial', borderRadius: '8px' }, isActive: true, usageCount: 42, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Work Anniversary', category: 'Work Anniversary', designData: { backgroundColor: '#1E3A5F', textColor: '#FFFFFF', accentColor: '#F59E0B', fontFamily: 'Arial', borderRadius: '8px' }, isActive: true, usageCount: 28, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Holiday Greetings', category: 'Holiday', designData: { backgroundColor: '#B91C1C', textColor: '#FFFFFF', accentColor: '#FCD34D', fontFamily: 'Arial', borderRadius: '8px' }, isActive: true, usageCount: 67, createdAt: '', updatedAt: '' },
  { id: '4', name: 'Performance Recognition', category: 'Performance Recognition', designData: { backgroundColor: '#1D4ED8', textColor: '#FFFFFF', accentColor: '#34D399', fontFamily: 'Arial', borderRadius: '8px' }, isActive: true, usageCount: 15, createdAt: '', updatedAt: '' },
  { id: '5', name: 'Employee Appreciation', category: 'Thank You', designData: { backgroundColor: '#065F46', textColor: '#FFFFFF', accentColor: '#FCD34D', fontFamily: 'Arial', borderRadius: '8px' }, isActive: true, usageCount: 89, createdAt: '', updatedAt: '' },
]

const customizeSchema = z.object({
  recipientEmail: z.string().email('Valid email required'),
  recipientName: z.string().min(1, 'Name is required'),
  amount: z.number().min(1, 'Amount must be at least $1'),
  occasion: z.string().min(1, 'Occasion is required'),
  message: z.string().optional(),
  scheduledAt: z.string().optional(),
})

type CustomizeForm = z.infer<typeof customizeSchema>

const STEPS = ['Choose Template', 'Customize', 'Preview', 'Send']

const PRESET_AMOUNTS = [25, 50, 100, 150, 200]
const OCCASIONS = ['Birthday', 'Work Anniversary', 'Holiday', 'Congratulations', 'Thank You', 'New Employee Welcome', 'Performance Recognition', 'Team Achievement', 'Farewell Message', 'Other']

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Times New Roman', label: 'Times New Roman' },
]

export default function GiftCardCreatorPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES)
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [sending, setSending] = useState(false)
  const [createdCardId, setCreatedCardId] = useState<string | null>(null)
  const [scheduleMode, setScheduleMode] = useState(false)

  // Design customization overrides
  const [backgroundColor, setBackgroundColor] = useState('')
  const [accentColor, setAccentColor] = useState('')
  const [textColor, setTextColor] = useState('')
  const [fontFamily, setFontFamily] = useState('Arial')
  // Default company name shown on the gift card header — can be changed by the user in the Customize step
  const [companyName, setCompanyName] = useState('CorpHR™ Connect')

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CustomizeForm>({
    resolver: zodResolver(customizeSchema),
    defaultValues: { amount: 50, occasion: 'Birthday' },
  })

  const formValues = watch()

  useEffect(() => {
    templatesApi.getAll()
      .then((res) => setTemplates(res.data.data?.length ? res.data.data : MOCK_TEMPLATES))
      .catch(() => setTemplates(MOCK_TEMPLATES))
      .finally(() => setLoadingTemplates(false))
  }, [])

  // Sync design overrides when a template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setBackgroundColor(selectedTemplate.designData.backgroundColor || '#1E3A5F')
      setAccentColor(selectedTemplate.designData.accentColor || '#F59E0B')
      setTextColor(selectedTemplate.designData.textColor || '#FFFFFF')
      setFontFamily(selectedTemplate.designData.fontFamily || 'Arial')
    }
  }, [selectedTemplate])

  // Build a customized template merging selected template with user overrides
  const customizedTemplate: Template | null = selectedTemplate
    ? {
        ...selectedTemplate,
        designData: {
          ...selectedTemplate.designData,
          backgroundColor: backgroundColor || selectedTemplate.designData.backgroundColor,
          accentColor: accentColor || selectedTemplate.designData.accentColor,
          textColor: textColor || selectedTemplate.designData.textColor,
          fontFamily,
        },
      }
    : null

  const handleCustomize = handleSubmit(async (data) => {
    if (scheduleMode && !data.scheduledAt) {
      toast.error('Please select a date and time to schedule the email')
      return
    }
    setSending(true)
    try {
      const res = await giftCardsApi.create({
        amount: data.amount,
        occasion: data.occasion,
        personalMessage: data.message,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
        templateId: selectedTemplate?.id,
        scheduledAt: scheduleMode && data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
      })
      setCreatedCardId(res.data.id)
      setStep(2)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create gift card'
      toast.error(message)
      // Still allow preview in demo mode
      setStep(2)
    } finally {
      setSending(false)
    }
  })

  const handleSend = async () => {
    // If scheduled mode, the card was already created with scheduledAt — no need to send now
    if (scheduleMode) {
      const scheduledDate = formValues.scheduledAt
        ? new Date(formValues.scheduledAt).toLocaleString()
        : 'the scheduled time'
      toast.success(`Gift card scheduled! It will be sent to ${formValues.recipientEmail} at ${scheduledDate}.`)
      navigate('/gift-cards')
      return
    }

    if (!createdCardId) {
      toast.success('Gift card sent! (Demo mode)')
      navigate('/gift-cards')
      return
    }
    setSending(true)
    try {
      await giftCardsApi.send(createdCardId, formValues.recipientEmail)
      toast.success(`Gift card sent to ${formValues.recipientEmail}!`)
      navigate('/gift-cards')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send gift card'
      toast.error(message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send HR Gift Email</h1>
          <p className="text-gray-500 mt-1">Send a professional HR gift email to a colleague</p>
        </div>
        <Link to="/gift-cards/designer">
          <Button variant="outline" size="sm" leftIcon={<Pencil size={15} />}>
            Open Canvas Designer
          </Button>
        </Link>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-indigo-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 transition-colors ${i < step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Choose Template */}
      {step === 0 && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Choose a Template</h2>
          {loadingTemplates ? (
            <div className="flex items-center justify-center h-40">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={selectedTemplate?.id === t.id}
                  onSelect={() => setSelectedTemplate(t)}
                />
              ))}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button
              disabled={!selectedTemplate}
              rightIcon={<ChevronRight size={16} />}
              onClick={() => setStep(1)}
            >
              Next: Customize
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1: Customize */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold text-gray-900 mb-5">Customize Gift Card</h2>
            <form className="space-y-4">
              <Input
                label="Recipient Name"
                placeholder="John Doe"
                error={errors.recipientName?.message}
                {...register('recipientName')}
              />
              <Input
                label="Recipient Email"
                type="email"
                placeholder="recipient@company.com"
                error={errors.recipientEmail?.message}
                {...register('recipientEmail')}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setValue('amount', amt)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                        ${formValues.amount === amt ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-600 hover:border-indigo-400'}`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Custom amount"
                  error={errors.amount?.message}
                  onChange={(e) => setValue('amount', Number(e.target.value))}
                  value={formValues.amount ?? ''}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Occasion</label>
                <Controller
                  name="occasion"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {OCCASIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Personal Message</label>
                <textarea
                  rows={3}
                  placeholder="Write a heartfelt message..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  {...register('message')}
                />
              </div>

              {/* Scheduling */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    <span className="text-sm font-medium text-gray-700">Schedule for later</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={scheduleMode}
                    onClick={() => setScheduleMode(!scheduleMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${scheduleMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${scheduleMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {scheduleMode && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Send date & time</label>
                    <input
                      type="datetime-local"
                      min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      {...register('scheduledAt')}
                    />
                    <p className="text-xs text-gray-400">The email will be delivered automatically at the chosen time.</p>
                  </div>
                )}
              </div>

              {/* Design customization */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">Design Customization</h3>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Company Name</label>
                  <Input
                    placeholder="e.g. CorpHR™ Connect"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

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

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Font Style</label>
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
              </div>
            </form>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button className="flex-1" loading={sending} rightIcon={<ChevronRight size={16} />} onClick={handleCustomize}>
                Preview
              </Button>
            </div>
          </Card>

          {/* Live preview */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="flex items-center justify-center p-4 bg-gray-100 rounded-xl">
              <GiftCardPreview
                template={customizedTemplate}
                amount={formValues.amount || 50}
                occasion={formValues.occasion || 'Gift'}
                message={formValues.message}
                recipientName={formValues.recipientName || 'Recipient'}
                senderName={`${user?.firstName} ${user?.lastName}`}
                companyName={companyName}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-6">Preview Your Gift Card</h2>
          <div className="flex flex-col items-center gap-6">
            <GiftCardPreview
              template={customizedTemplate}
              amount={formValues.amount || 50}
              occasion={formValues.occasion || 'Gift'}
              message={formValues.message}
              recipientName={formValues.recipientName || 'Recipient'}
              senderName={`${user?.firstName} ${user?.lastName}`}
              companyName={companyName}
            />
            <div className="text-center max-w-sm">
              <p className="text-gray-600">
                Sending to: <span className="font-semibold">{formValues.recipientName}</span>
              </p>
              <p className="text-gray-400 text-sm">{formValues.recipientEmail}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-8 justify-center">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button rightIcon={<ChevronRight size={16} />} onClick={() => setStep(3)}>
              {scheduleMode ? 'Confirm & Schedule' : 'Confirm & Send'}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Send */}
      {step === 3 && (
        <Card className="max-w-lg mx-auto">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${scheduleMode ? 'bg-amber-100' : 'bg-indigo-100'}`}>
              {scheduleMode ? <Clock size={28} className="text-amber-600" /> : <Send size={28} className="text-indigo-600" />}
            </div>
            <h2 className="font-semibold text-gray-900 text-xl mb-2">
              {scheduleMode ? 'Schedule Gift Card' : 'Ready to Send!'}
            </h2>
            <p className="text-gray-500 mb-6">
              {scheduleMode
                ? <>The gift card will be automatically emailed to <strong>{formValues.recipientEmail}</strong> at the scheduled time.</>
                : <>The gift card will be sent to <strong>{formValues.recipientEmail}</strong></>
              }
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Recipient</span>
                <span className="font-medium">{formValues.recipientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">${(formValues.amount || 50).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Occasion</span>
                <span className="font-medium">{formValues.occasion}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Template</span>
                <span className="font-medium">{selectedTemplate?.name || 'Default'}</span>
              </div>
              {scheduleMode && formValues.scheduledAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Scheduled for</span>
                  <span className="font-medium text-amber-600">{new Date(formValues.scheduledAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                className={`flex-1 ${scheduleMode ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                loading={sending}
                leftIcon={scheduleMode ? <Clock size={16} /> : <Send size={16} />}
                onClick={handleSend}
              >
                {scheduleMode ? 'Schedule' : 'Send Gift Card'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
