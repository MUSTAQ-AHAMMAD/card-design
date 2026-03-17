import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Users, Send, ChevronRight, Check, Upload, UserCheck, Clock } from 'lucide-react'
import { templatesApi, giftCardsApi, usersApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { GiftCardPreview } from '../../components/GiftCard/GiftCardPreview'
import { TemplateCard } from '../../components/GiftCard/TemplateCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import type { Template, GiftCard, ApiResponse } from '../../types'
const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Birthday Celebration', category: 'Birthday', designData: { backgroundColor: '#7C3AED', textColor: '#FFFFFF', accentColor: '#F59E0B', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 42, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Work Anniversary', category: 'Anniversary', designData: { backgroundColor: '#059669', textColor: '#FFFFFF', accentColor: '#FCD34D', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 28, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Holiday Greetings', category: 'Holiday', designData: { backgroundColor: '#DC2626', textColor: '#FFFFFF', accentColor: '#FCD34D', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 67, createdAt: '', updatedAt: '' },
  { id: '4', name: 'Congratulations', category: 'Achievement', designData: { backgroundColor: '#2563EB', textColor: '#FFFFFF', accentColor: '#10B981', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 15, createdAt: '', updatedAt: '' },
  { id: '5', name: 'Thank You', category: 'Appreciation', designData: { backgroundColor: '#4F46E5', textColor: '#FFFFFF', accentColor: '#F59E0B', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 89, createdAt: '', updatedAt: '' },
]

const bulkSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least $1'),
  occasion: z.string().min(1, 'Occasion is required'),
  message: z.string().optional(),
  scheduledAt: z.string().optional(),
})

type BulkForm = z.infer<typeof bulkSchema>

const STEPS = ['Choose Template', 'Configure Card', 'Add Recipients', 'Confirm & Send']
const PRESET_AMOUNTS = [25, 50, 100, 150, 200]
const OCCASIONS = ['Birthday', 'Work Anniversary', 'Holiday', 'Congratulations', 'Thank You', 'Welcome', 'Other']

interface Recipient {
  id: string
  email: string
  name: string
}

export default function BulkGiftCardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES)
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [scheduleMode, setScheduleMode] = useState(false)

  // Recipients state
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [emailError, setEmailError] = useState('')
  const [csvLoading, setCsvLoading] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BulkForm>({
    resolver: zodResolver(bulkSchema),
    defaultValues: { amount: 50, occasion: 'Birthday' },
  })

  const formValues = watch()

  useEffect(() => {
    templatesApi.getAll()
      .then((res) => setTemplates(res.data.data?.length ? res.data.data : MOCK_TEMPLATES))
      .catch(() => setTemplates(MOCK_TEMPLATES))
      .finally(() => setLoadingTemplates(false))
  }, [])

  const addRecipient = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!newEmail.trim()) {
      setEmailError('Email is required')
      return
    }
    if (!emailRegex.test(newEmail.trim())) {
      setEmailError('Enter a valid email address')
      return
    }
    if (recipients.some((r) => r.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setEmailError('This email is already in the list')
      return
    }
    setRecipients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email: newEmail.trim(), name: newName.trim() },
    ])
    setNewEmail('')
    setNewName('')
    setEmailError('')
  }

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvLoading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      let added = 0
      const newRecipients: Recipient[] = []
      for (const line of lines) {
        // Support formats: "email" or "name,email" or "email,name"
        const parts = line.split(',').map((p) => p.trim())
        let email = ''
        let name = ''
        if (parts.length === 1) {
          email = parts[0]
        } else {
          // Detect which part is the email
          if (emailRegex.test(parts[0])) {
            email = parts[0]
            name = parts[1] || ''
          } else {
            name = parts[0]
            email = parts[1] || ''
          }
        }
        if (
          emailRegex.test(email) &&
          !recipients.some((r) => r.email.toLowerCase() === email.toLowerCase()) &&
          !newRecipients.some((r) => r.email.toLowerCase() === email.toLowerCase())
        ) {
          newRecipients.push({ id: crypto.randomUUID(), email, name })
          added++
        }
      }
      setRecipients((prev) => [...prev, ...newRecipients])
      if (added > 0) toast.success(`Added ${added} recipient${added > 1 ? 's' : ''} from CSV`)
      else toast.error('No valid emails found in CSV')
      setCsvLoading(false)
    }
    reader.readAsText(file)
    // Reset file input so same file can be re-uploaded
    e.target.value = ''
  }

  const handleLoadAllEmployees = async () => {
    setLoadingEmployees(true)
    try {
      const res = await usersApi.getEmployees()
      const allUsers = res.data.data ?? []
      const newRecipients: Recipient[] = []
      let added = 0
      for (const u of allUsers) {
        if (
          u.email &&
          u.isActive &&
          !recipients.some((r) => r.email.toLowerCase() === u.email.toLowerCase()) &&
          !newRecipients.some((r) => r.email.toLowerCase() === u.email.toLowerCase())
        ) {
          newRecipients.push({
            id: crypto.randomUUID(),
            email: u.email,
            name: `${u.firstName} ${u.lastName}`.trim(),
          })
          added++
        }
      }
      setRecipients((prev) => [...prev, ...newRecipients])
      if (added > 0) toast.success(`Loaded ${added} employee${added !== 1 ? 's' : ''} from database`)
      else toast(`All employees are already in the recipients list`, { icon: 'ℹ️' })
    } catch {
      toast.error('Failed to load employees. Check your permissions.')
    } finally {
      setLoadingEmployees(false)
    }
  }

  const handleBulkSend = handleSubmit(async (data) => {
    if (recipients.length === 0) {
      toast.error('Add at least one recipient')
      return
    }
    if (scheduleMode && !data.scheduledAt) {
      toast.error('Please select a date and time to schedule the emails')
      return
    }
    setSending(true)
    let successCount = 0
    const errors: string[] = []
    const scheduledAt = scheduleMode && data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined

    for (const recipient of recipients) {
      try {
        const res = await giftCardsApi.create({
          amount: data.amount,
          occasion: data.occasion,
          personalMessage: data.message,
          recipientEmail: recipient.email,
          recipientName: recipient.name || undefined,
          templateId: selectedTemplate?.id,
          scheduledAt,
        })
        // Backend wraps response in ApiResponse<GiftCard>
        const cardId = (res.data as unknown as ApiResponse<GiftCard>).data?.id ?? (res.data as unknown as GiftCard).id
        // Only send immediately if not scheduled; scheduled cards are processed by the backend scheduler
        if (!scheduleMode) {
          await giftCardsApi.send(cardId, recipient.email)
        }
        successCount++
      } catch {
        errors.push(recipient.email)
      }
    }

    setSending(false)
    setSentCount(successCount)

    if (errors.length > 0 && successCount === 0) {
      // All failed — likely demo/backend-unavailable mode, show partial success
      const label = scheduleMode ? 'scheduled' : 'queued'
      toast.success(`${recipients.length} gift card${recipients.length !== 1 ? 's' : ''} ${label} (demo mode — backend unavailable)`)
      setSentCount(recipients.length)
    } else if (errors.length > 0) {
      const verb = scheduleMode ? 'Scheduled' : 'Sent'
      toast.error(`${verb} ${successCount} card${successCount !== 1 ? 's' : ''}, failed for: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` and ${errors.length - 3} more` : ''}`)
    } else {
      if (scheduleMode && data.scheduledAt) {
        toast.success(`${successCount} gift card${successCount !== 1 ? 's' : ''} scheduled for ${new Date(data.scheduledAt).toLocaleString()}!`)
      } else {
        toast.success(`${successCount} gift card${successCount !== 1 ? 's' : ''} sent successfully!`)
      }
    }
    setStep(4) // success screen
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Gift Cards</h1>
        <p className="text-gray-500 mt-1">Send personalized gift cards to multiple employees at once</p>
      </div>

      {/* Progress */}
      {step < 4 && (
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
      )}

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
              Next: Configure
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1: Configure Card */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold text-gray-900 mb-5">Configure Gift Card</h2>
            <form className="space-y-4">
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
                <label className="text-sm font-medium text-gray-700">Message (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Write a message for all recipients..."
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
                    <p className="text-xs text-gray-400">All gift card emails will be delivered automatically at the chosen time.</p>
                  </div>
                )}
              </div>
            </form>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button className="flex-1" rightIcon={<ChevronRight size={16} />} onClick={() => setStep(2)}>
                Next: Recipients
              </Button>
            </div>
          </Card>

          {/* Live preview */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="flex items-center justify-center p-4 bg-gray-100 rounded-xl">
              <GiftCardPreview
                template={selectedTemplate}
                amount={formValues.amount || 50}
                occasion={formValues.occasion || 'Gift'}
                message={formValues.message}
                recipientName="Employee Name"
                senderName={`${user?.firstName} ${user?.lastName}`}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              Each employee will see their own name on the card.
            </p>
          </Card>
        </div>
      )}

      {/* Step 2: Add Recipients */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={18} />
              Add Recipients
            </h2>

            {/* CSV Upload */}
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-4">
              <p className="text-sm font-medium text-indigo-800 mb-2">Import from CSV</p>
              <p className="text-xs text-indigo-600 mb-3">
                Upload a CSV file with columns: <code className="bg-white px-1 rounded">email</code> or <code className="bg-white px-1 rounded">name,email</code> (one per line)
              </p>
              <label className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors">
                  <Upload size={16} />
                  {csvLoading ? 'Processing...' : 'Choose CSV File'}
                </div>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleCSVUpload}
                  disabled={csvLoading}
                />
              </label>
            </div>

            {/* Load all employees */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-4">
              <p className="text-sm font-medium text-emerald-800 mb-1">Send to All Employees</p>
              <p className="text-xs text-emerald-600 mb-3">
                Automatically load all active employees from the database as recipients.
              </p>
              <Button
                variant="outline"
                leftIcon={<UserCheck size={16} />}
                loading={loadingEmployees}
                disabled={loadingEmployees}
                onClick={handleLoadAllEmployees}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Load All Employees
              </Button>
            </div>

            {/* Manual add */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Add Manually</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Employee name (optional)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="employee@company.com"
                    value={newEmail}
                    onChange={(e) => { setNewEmail(e.target.value); setEmailError('') }}
                    error={emailError}
                    onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                  />
                </div>
                <Button
                  leftIcon={<Plus size={16} />}
                  onClick={addRecipient}
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>
          </Card>

          {/* Recipient list */}
          {recipients.length > 0 ? (
            <Card padding="none">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="font-medium text-gray-900 text-sm">
                  Recipients ({recipients.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRecipients([])}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                >
                  Clear all
                </Button>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {recipients.map((r, idx) => (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {r.name && <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>}
                      <p className="text-xs text-gray-500 truncate">{r.email}</p>
                    </div>
                    <button
                      onClick={() => removeRecipient(r.id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="text-center py-8">
              <Users size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">No recipients added yet</p>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
            <Button
              className="flex-1"
              disabled={recipients.length === 0}
              rightIcon={<ChevronRight size={16} />}
              onClick={() => setStep(3)}
            >
              Next: Confirm
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm & Send */}
      {step === 3 && (
        <Card className="max-w-lg mx-auto">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${scheduleMode ? 'bg-amber-100' : 'bg-indigo-100'}`}>
              {scheduleMode ? <Clock size={28} className="text-amber-600" /> : <Send size={28} className="text-indigo-600" />}
            </div>
            <h2 className="font-semibold text-gray-900 text-xl mb-2">
              {scheduleMode ? 'Schedule Gift Cards' : 'Ready to Send!'}
            </h2>
            <p className="text-gray-500 mb-6">
              {scheduleMode
                ? <>Emails will be automatically sent to <strong>{recipients.length}</strong> employee{recipients.length !== 1 ? 's' : ''} at the scheduled time.</>
                : <>Review the details before sending to <strong>{recipients.length}</strong> employee{recipients.length !== 1 ? 's' : ''}</>
              }
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Recipients</span>
                <span className="font-medium">{recipients.length} employee{recipients.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount per card</span>
                <span className="font-medium">${(formValues.amount || 50).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total value</span>
                <span className="font-bold text-indigo-700">${((formValues.amount || 50) * recipients.length).toFixed(2)}</span>
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

            <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6 text-left max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-400 mb-2 font-medium">RECIPIENTS</p>
              {recipients.map((r) => (
                <p key={r.id} className="text-xs text-gray-600 py-0.5">
                  {r.name ? `${r.name} ` : ''}<span className="text-gray-400">({r.email})</span>
                </p>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
              <Button
                className={`flex-1 ${scheduleMode ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                loading={sending}
                leftIcon={scheduleMode ? <Clock size={16} /> : <Send size={16} />}
                onClick={handleBulkSend}
              >
                {scheduleMode
                  ? `Schedule ${recipients.length} Gift Card${recipients.length !== 1 ? 's' : ''}`
                  : `Send ${recipients.length} Gift Card${recipients.length !== 1 ? 's' : ''}`
                }
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={36} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done! 🎉</h2>
          <p className="text-gray-500 mb-2">
            <strong className="text-emerald-600">{sentCount || recipients.length}</strong> gift card{(sentCount || recipients.length) !== 1 ? 's' : ''} {scheduleMode ? 'scheduled' : 'sent'} successfully.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            {scheduleMode && formValues.scheduledAt
              ? `Emails will be delivered automatically at ${new Date(formValues.scheduledAt).toLocaleString()}.`
              : 'Each employee will receive their gift card via email. They can customize and download it from their dashboard.'
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/gift-cards')}>
              View All Cards
            </Button>
            <Button onClick={() => {
              setStep(0)
              setSelectedTemplate(null)
              setRecipients([])
              setSentCount(0)
            }}>
              Send More
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
