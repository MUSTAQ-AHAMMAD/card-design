import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, X } from 'lucide-react'
import { templatesApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { GiftCardPreview } from '../../components/GiftCard/GiftCardPreview'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import type { Template } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  backgroundColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  borderRadius: z.string(),
})

type FormData = z.infer<typeof schema>

const CATEGORIES = ['Birthday', 'Anniversary', 'Holiday', 'Achievement', 'Appreciation', 'Onboarding', 'Other']

export default function TemplateEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)

  const { control, register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      category: 'Birthday',
      backgroundColor: '#4F46E5',
      textColor: '#FFFFFF',
      accentColor: '#F59E0B',
      borderRadius: '16px',
    },
  })

  const formValues = watch()

  // Build preview template
  const previewTemplate: Template = {
    id: 'preview',
    name: formValues.name || 'Untitled',
    category: formValues.category,
    designData: {
      backgroundColor: formValues.backgroundColor,
      textColor: formValues.textColor,
      accentColor: formValues.accentColor,
      fontFamily: 'Inter',
      borderRadius: formValues.borderRadius,
    },
    isActive: true,
    usageCount: 0,
    createdAt: '',
    updatedAt: '',
  }

  useEffect(() => {
    if (id) {
      templatesApi.getById(id)
        .then((res) => {
          const t = res.data
          reset({
            name: t.name,
            category: t.category,
            backgroundColor: t.designData.backgroundColor,
            textColor: t.designData.textColor,
            accentColor: t.designData.accentColor,
            borderRadius: t.designData.borderRadius,
          })
        })
        .catch(() => toast.error('Failed to load template'))
        .finally(() => setLoading(false))
    }
  }, [id, reset])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const payload = {
      name: data.name,
      category: data.category,
      designData: {
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        accentColor: data.accentColor,
        fontFamily: 'Inter',
        borderRadius: data.borderRadius,
      },
    }
    try {
      if (isEditing) {
        await templatesApi.update(id!, payload)
        toast.success('Template updated')
      } else {
        await templatesApi.create(payload)
        toast.success('Template created')
      }
      navigate('/templates')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save template'
      toast.error(message)
    } finally {
      setSaving(false)
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Template' : 'Create Template'}
          </h1>
          <p className="text-gray-500 mt-1">Customize your gift card design</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<X size={16} />} onClick={() => navigate('/templates')}>
            Cancel
          </Button>
          <Button leftIcon={<Save size={16} />} loading={saving} onClick={handleSubmit(onSubmit)}>
            {isEditing ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-6">Design Settings</h2>
          <form className="space-y-5">
            <Input
              label="Template Name"
              placeholder="e.g. Birthday Celebration"
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              />
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Background</label>
                <Controller
                  name="backgroundColor"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input type="color" {...field} className="h-9 w-full rounded-lg cursor-pointer border border-gray-300" />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Text</label>
                <Controller
                  name="textColor"
                  control={control}
                  render={({ field }) => (
                    <input type="color" {...field} className="h-9 w-full rounded-lg cursor-pointer border border-gray-300" />
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Accent</label>
                <Controller
                  name="accentColor"
                  control={control}
                  render={({ field }) => (
                    <input type="color" {...field} className="h-9 w-full rounded-lg cursor-pointer border border-gray-300" />
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Border Radius</label>
              <Controller
                name="borderRadius"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="0px">None</option>
                    <option value="8px">Small</option>
                    <option value="16px">Medium</option>
                    <option value="24px">Large</option>
                  </select>
                )}
              />
            </div>
          </form>
        </Card>

        {/* Preview */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-6">Live Preview</h2>
          <div className="flex items-center justify-center p-4 bg-gray-100 rounded-xl">
            <GiftCardPreview
              template={previewTemplate}
              amount={50}
              occasion={formValues.category}
              message="Thank you for being awesome!"
              recipientName="John Doe"
              senderName="The Team"
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Live preview updates as you change settings
          </p>
        </Card>
      </div>
    </div>
  )
}
