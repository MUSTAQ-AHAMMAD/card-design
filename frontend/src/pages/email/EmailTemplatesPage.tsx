import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Send, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { emailApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { EmailTemplate } from '../../types'

const MOCK_TEMPLATES: EmailTemplate[] = [
  { id: '1', name: 'Gift Card Delivery', subject: 'You received a gift card! 🎁', body: 'Hi {{name}},\n\nYou have received a ${{amount}} gift card for {{occasion}}.', variables: ['name', 'amount', 'occasion'], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Birthday Greeting', subject: 'Happy Birthday from the team! 🎂', body: 'Dear {{name}},\n\nWishing you a wonderful birthday!', variables: ['name'], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Work Anniversary', subject: 'Celebrating your work anniversary! 🎉', body: 'Hi {{name}},\n\nCongratulations on {{years}} years with us!', variables: ['name', 'years'], isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
})

type TemplateForm = z.infer<typeof templateSchema>

const testEmailSchema = z.object({
  to: z.string().email('Valid email required'),
})

type TestEmailForm = z.infer<typeof testEmailSchema>

export default function EmailTemplatesPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<EmailTemplate[]>(MOCK_TEMPLATES)
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(false)
  const [editTarget, setEditTarget] = useState<EmailTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null)
  const [testModal, setTestModal] = useState(false)
  const [testTarget, setTestTarget] = useState<EmailTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER'

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
  })

  const { register: registerTest, handleSubmit: handleTestSubmit, formState: { errors: testErrors } } = useForm<TestEmailForm>({
    resolver: zodResolver(testEmailSchema),
  })

  useEffect(() => {
    emailApi.getTemplates()
      .then((res) => setTemplates(res.data.length ? res.data : MOCK_TEMPLATES))
      .catch(() => setTemplates(MOCK_TEMPLATES))
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditTarget(null)
    reset({ name: '', subject: '', body: '' })
    setEditModal(true)
  }

  const openEdit = (template: EmailTemplate) => {
    setEditTarget(template)
    reset({ name: template.name, subject: template.subject, body: template.body })
    setEditModal(true)
  }

  const onSave = async (data: TemplateForm) => {
    setSaving(true)
    try {
      if (editTarget) {
        const res = await emailApi.updateTemplate(editTarget.id, data)
        setTemplates((prev) => prev.map((t) => t.id === editTarget.id ? res.data : t))
        toast.success('Template updated')
      } else {
        const res = await emailApi.createTemplate(data)
        setTemplates((prev) => [...prev, res.data])
        toast.success('Template created')
      }
      setEditModal(false)
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await emailApi.deleteTemplate(deleteTarget.id)
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      toast.success('Template deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const onSendTest = async (data: TestEmailForm) => {
    if (!testTarget) return
    setSendingTest(true)
    try {
      await emailApi.sendTest(data.to, testTarget.subject, testTarget.id)
      toast.success(`Test email sent to ${data.to}`)
      setTestModal(false)
    } catch {
      toast.error('Failed to send test email')
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-500 mt-1">Manage notification email templates</p>
        </div>
        {isAdminOrHR && (
          <Button leftIcon={<Plus size={16} />} onClick={openCreate}>Create Template</Button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {templates.map((template) => (
          <Card key={template.id} hover className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <Badge variant={template.isActive ? 'success' : 'default'}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{template.subject}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {template.variables.map((v) => (
                  <span key={v} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded font-mono">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Updated {format(new Date(template.updatedAt), 'MMM d, yyyy')}
              </p>
            </div>
            {isAdminOrHR && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Send size={14} />}
                  onClick={() => { setTestTarget(template); setTestModal(true) }}
                >
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit2 size={14} />}
                  onClick={() => openEdit(template)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 size={14} />}
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => setDeleteTarget(template)}
                >
                  Delete
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title={editTarget ? 'Edit Email Template' : 'Create Email Template'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <Input label="Name" placeholder="e.g. Gift Card Delivery" error={errors.name?.message} {...register('name')} />
          <Input label="Subject" placeholder="Email subject line" error={errors.subject?.message} {...register('subject')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Body</label>
            <textarea
              rows={6}
              placeholder="Email body — use {{variable}} for dynamic values"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono"
              {...register('body')}
            />
            {errors.body && <p className="text-xs text-red-500">{errors.body.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={saving} leftIcon={<Check size={16} />}>
              {editTarget ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Template" size="sm">
        <p className="text-gray-600">
          Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" loading={deleting} onClick={onDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Test Email Modal */}
      <Modal isOpen={testModal} onClose={() => setTestModal(false)} title="Send Test Email" size="sm">
        <p className="text-gray-500 mb-4">
          Send a test of <strong>"{testTarget?.name}"</strong> to your email.
        </p>
        <form onSubmit={handleTestSubmit(onSendTest)} className="space-y-4">
          <Input
            label="Send to"
            type="email"
            placeholder="your@email.com"
            error={testErrors.to?.message}
            defaultValue={user?.email}
            {...registerTest('to')}
          />
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setTestModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={sendingTest} leftIcon={<Send size={16} />}>
              Send Test
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
