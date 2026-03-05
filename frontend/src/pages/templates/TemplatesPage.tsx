import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { templatesApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { TemplateCard } from '../../components/GiftCard/TemplateCard'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import type { Template } from '../../types'

const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Birthday Celebration', category: 'Birthday', designData: { backgroundColor: '#7C3AED', textColor: '#FFFFFF', accentColor: '#F59E0B', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 42, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Work Anniversary', category: 'Anniversary', designData: { backgroundColor: '#059669', textColor: '#FFFFFF', accentColor: '#FCD34D', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 28, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Holiday Greetings', category: 'Holiday', designData: { backgroundColor: '#DC2626', textColor: '#FFFFFF', accentColor: '#FCD34D', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 67, createdAt: '', updatedAt: '' },
  { id: '4', name: 'Congratulations', category: 'Achievement', designData: { backgroundColor: '#2563EB', textColor: '#FFFFFF', accentColor: '#10B981', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 15, createdAt: '', updatedAt: '' },
  { id: '5', name: 'Thank You', category: 'Appreciation', designData: { backgroundColor: '#4F46E5', textColor: '#FFFFFF', accentColor: '#F59E0B', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 89, createdAt: '', updatedAt: '' },
  { id: '6', name: 'Welcome Aboard', category: 'Onboarding', designData: { backgroundColor: '#0E7490', textColor: '#FFFFFF', accentColor: '#FDE68A', fontFamily: 'Inter', borderRadius: '16px' }, isActive: true, usageCount: 33, createdAt: '', updatedAt: '' },
]

const CATEGORIES = ['All', 'Birthday', 'Anniversary', 'Holiday', 'Achievement', 'Appreciation', 'Onboarding']

export default function TemplatesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER'

  useEffect(() => {
    templatesApi.getAll()
      .then((res) => setTemplates(res.data.data?.length ? res.data.data : MOCK_TEMPLATES))
      .catch(() => setTemplates(MOCK_TEMPLATES))
      .finally(() => setLoading(false))
  }, [])

  const filtered = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await templatesApi.delete(deleteTarget.id)
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      toast.success('Template deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete template')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-1">Manage your gift card design templates</p>
        </div>
        {isAdminOrHR && (
          <Link to="/templates/new">
            <Button leftIcon={<Plus size={16} />}>Create Template</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              leftIcon={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-gray-400 text-lg">No templates found</p>
          {isAdminOrHR && (
            <Link to="/templates/new" className="mt-4 inline-block">
              <Button variant="outline" leftIcon={<Plus size={16} />}>Create your first template</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={isAdminOrHR ? () => navigate(`/templates/${template.id}/edit`) : undefined}
              onDelete={isAdminOrHR ? () => setDeleteTarget(template) : undefined}
            />
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Template"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
