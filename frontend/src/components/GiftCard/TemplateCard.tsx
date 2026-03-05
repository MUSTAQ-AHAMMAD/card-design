import { Edit2, Trash2, Eye } from 'lucide-react'
import type { Template } from '../../types'
import { Badge } from '../ui/Badge'

interface TemplateCardProps {
  template: Template
  onEdit?: () => void
  onDelete?: () => void
  onSelect?: () => void
  selected?: boolean
}

export function TemplateCard({ template, onEdit, onDelete, onSelect, selected }: TemplateCardProps) {
  const design = template.designData

  return (
    <div
      className={`group relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200
        ${selected ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'}`}
      onClick={onSelect}
    >
      {/* Preview */}
      <div
        className="h-32 relative overflow-hidden"
        style={{ background: design.backgroundColor || '#4F46E5' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 20%, white 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20"
          style={{ background: design.accentColor || '#F59E0B' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl font-black opacity-40"
            style={{ color: design.textColor || '#FFFFFF' }}
          >
            GIFT
          </span>
        </div>
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Hover actions */}
        {(onEdit || onDelete) && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className="p-2 bg-white rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Edit2 size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="p-2 bg-white rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
            {onSelect && !onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onSelect() }}
                className="p-2 bg-white rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Eye size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{template.name}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <Badge variant="info">{template.category}</Badge>
          <span className="text-xs text-gray-400">{template.usageCount} uses</span>
        </div>
      </div>
    </div>
  )
}
