import { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, IText, FabricImage, Rect, Circle, type FabricObject, type TPointerEventInfo, type TPointerEvent } from 'fabric'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import {
  MousePointer2, Type, ImageIcon, Square, Circle as CircleIcon,
  Trash2, Download, Upload, Undo2, Redo2, ZoomIn, ZoomOut,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  FileText, Palette, ChevronDown, ArrowLeft, Layers,
} from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker — pdf.worker.min.mjs is present in pdfjs-dist 4.x build/
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href

const CANVAS_W = 680
const CANVAS_H = 428

const FONT_FAMILIES = [
  'Arial', 'Georgia', 'Verdana', 'Trebuchet MS',
  'Times New Roman', 'Courier New', 'Impact', 'Helvetica',
]
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72]

type Tool = 'select' | 'text' | 'rect' | 'circle' | 'image'

export interface GiftCardCanvasEditorProps {
  cardName?: string
  onBack?: () => void
}

export function GiftCardCanvasEditor({ cardName = 'My Gift Card', onBack }: GiftCardCanvasEditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const isUndoRedo = useRef(false)
  const historyRef = useRef<string[]>([])
  const histIdxRef = useRef<number>(-1)
  const toolRef = useRef<Tool>('select')

  const [selected, setSelected] = useState<FabricObject | null>(null)
  const [tool, setToolState] = useState<Tool>('select')
  const [title, setTitle] = useState(cardName)
  const [zoom, setZoom] = useState(1)
  const [bgColor, setBgColor] = useState('#7C3AED')
  const [histIdx, setHistIdx] = useState(-1)
  const [histLen, setHistLen] = useState(0)
  const [exporting, setExporting] = useState<'jpeg' | 'png' | 'pdf' | null>(null)
  const [importing, setImporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [selectedProps, setSelectedProps] = useState({
    fontSize: 24,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    underline: false,
    fill: '#ffffff',
    textAlign: 'center',
    opacity: 1,
    stroke: '#000000',
    strokeWidth: 0,
  })

  const imageInputRef = useRef<HTMLInputElement>(null)
  const bgImageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const setTool = useCallback((t: Tool) => {
    toolRef.current = t
    setToolState(t)
    const canvas = canvasRef.current
    if (!canvas) return
    if (t === 'select') {
      canvas.defaultCursor = 'default'
      canvas.selection = true
    } else {
      canvas.defaultCursor = 'crosshair'
      canvas.selection = false
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }, [])

  const saveHistory = useCallback(() => {
    if (isUndoRedo.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const json = JSON.stringify(canvas.toJSON())
    const newHistory = historyRef.current.slice(0, histIdxRef.current + 1)
    newHistory.push(json)
    historyRef.current = newHistory
    histIdxRef.current = newHistory.length - 1
    setHistIdx(histIdxRef.current)
    setHistLen(newHistory.length)
  }, [])

  const undo = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || histIdxRef.current <= 0) return
    histIdxRef.current -= 1
    isUndoRedo.current = true
    await canvas.loadFromJSON(JSON.parse(historyRef.current[histIdxRef.current]))
    canvas.renderAll()
    isUndoRedo.current = false
    setHistIdx(histIdxRef.current)
    setSelected(null)
    if (typeof canvas.backgroundColor === 'string') {
      setBgColor(canvas.backgroundColor)
    }
  }, [])

  const redo = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || histIdxRef.current >= historyRef.current.length - 1) return
    histIdxRef.current += 1
    isUndoRedo.current = true
    await canvas.loadFromJSON(JSON.parse(historyRef.current[histIdxRef.current]))
    canvas.renderAll()
    isUndoRedo.current = false
    setHistIdx(histIdxRef.current)
    setSelected(null)
    if (typeof canvas.backgroundColor === 'string') {
      setBgColor(canvas.backgroundColor)
    }
  }, [])

  const syncSelectedProps = useCallback((obj: FabricObject | null) => {
    if (!obj) return
    setSelectedProps({
      fontSize: (obj as IText).fontSize ?? 24,
      fontFamily: (obj as IText).fontFamily ?? 'Arial',
      fontWeight: String((obj as IText).fontWeight ?? 'normal'),
      fontStyle: String((obj as IText).fontStyle ?? 'normal'),
      underline: (obj as IText).underline ?? false,
      fill: String(obj.fill ?? '#ffffff'),
      textAlign: (obj as IText).textAlign ?? 'center',
      opacity: obj.opacity ?? 1,
      stroke: String(obj.stroke ?? '#000000'),
      strokeWidth: obj.strokeWidth ?? 0,
    })
  }, [])

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasElRef.current) return

    const canvas = new Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#7C3AED',
      selection: true,
      preserveObjectStacking: true,
    })
    canvasRef.current = canvas

    // Add starter elements
    const titleText = new IText('🎁 HR Gift Voucher', {
      left: CANVAS_W / 2,
      top: 40,
      originX: 'center',
      fontSize: 32,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#FFFFFF',
      textAlign: 'center',
    })
    const amountText = new IText('$50.00', {
      left: CANVAS_W / 2,
      top: 130,
      originX: 'center',
      fontSize: 64,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#FCD34D',
      textAlign: 'center',
    })
    const messageText = new IText('Double-click any text to edit it!', {
      left: CANVAS_W / 2,
      top: 240,
      originX: 'center',
      fontSize: 18,
      fontFamily: 'Georgia',
      fontStyle: 'italic',
      fill: '#FFFFFF',
      textAlign: 'center',
    })
    const recipientText = new IText('To: Your Name', {
      left: 36,
      top: CANVAS_H - 70,
      fontSize: 16,
      fontFamily: 'Arial',
      fill: 'rgba(255,255,255,0.85)',
    })
    const fromText = new IText('From: HR Team', {
      left: CANVAS_W - 36,
      top: CANVAS_H - 70,
      originX: 'right',
      fontSize: 16,
      fontFamily: 'Arial',
      fill: 'rgba(255,255,255,0.85)',
    })

    canvas.add(titleText, amountText, messageText, recipientText, fromText)
    canvas.renderAll()

    // Initial history
    const initialJSON = JSON.stringify(canvas.toJSON())
    historyRef.current = [initialJSON]
    histIdxRef.current = 0
    setHistIdx(0)
    setHistLen(1)

    // Selection events
    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0] ?? null
      setSelected(obj)
      syncSelectedProps(obj)
    })
    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0] ?? null
      setSelected(obj)
      syncSelectedProps(obj)
    })
    canvas.on('selection:cleared', () => {
      setSelected(null)
    })

    // History save on modify
    canvas.on('object:modified', saveHistory)
    canvas.on('text:changed', saveHistory)

    return () => {
      canvas.dispose()
      canvasRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle tool-based mouse:down to add elements
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = async (e: TPointerEventInfo<TPointerEvent> & { target?: FabricObject }) => {
      const currentTool = toolRef.current
      if (currentTool === 'select') return
      if (e.target) return // clicked on existing object

      const pointer = e.scenePoint // canvas scene-relative point (fabric 7)
      const x = pointer.x
      const y = pointer.y

      if (currentTool === 'text') {
        const text = new IText('Double-click to edit', {
          left: x,
          top: y,
          originX: 'center',
          originY: 'center',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#ffffff',
          textAlign: 'center',
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        canvas.renderAll()
        saveHistory()
        setTool('select')
      }

      if (currentTool === 'rect') {
        const rect = new Rect({
          left: x - 80,
          top: y - 40,
          width: 160,
          height: 80,
          fill: '#4F46E5',
          stroke: '#ffffff',
          strokeWidth: 0,
          rx: 8,
          ry: 8,
        })
        canvas.add(rect)
        canvas.setActiveObject(rect)
        canvas.renderAll()
        saveHistory()
        setTool('select')
      }

      if (currentTool === 'circle') {
        const circle = new Circle({
          left: x - 50,
          top: y - 50,
          radius: 50,
          fill: '#F59E0B',
          stroke: '#ffffff',
          strokeWidth: 0,
        })
        canvas.add(circle)
        canvas.setActiveObject(circle)
        canvas.renderAll()
        saveHistory()
        setTool('select')
      }

      if (currentTool === 'image') {
        imageInputRef.current?.click()
        setTool('select')
      }
    }

    canvas.on('mouse:down', handleMouseDown)
    return () => {
      canvas.off('mouse:down', handleMouseDown)
    }
  }, [saveHistory, setTool])

  // ─── Action helpers (defined before keyboard shortcut effect) ─────────────

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    canvas.remove(obj)
    canvas.discardActiveObject()
    canvas.renderAll()
    setSelected(null)
    saveHistory()
  }, [saveHistory])

  const duplicateSelected = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    obj.clone().then((clone: FabricObject) => {
      clone.set({ left: (clone.left ?? 0) + 20, top: (clone.top ?? 0) + 20 })
      canvas.add(clone)
      canvas.setActiveObject(clone)
      canvas.renderAll()
      saveHistory()
    })
  }, [saveHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const obj = canvas.getActiveObject()
        if (obj && !(obj as IText).isEditing) {
          canvas.remove(obj)
          canvas.discardActiveObject()
          canvas.renderAll()
          setSelected(null)
          saveHistory()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        await undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        await redo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        duplicateSelected()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, saveHistory, duplicateSelected])

  // ─── Additional helpers ────────────────────────────────────────────────────

  const bringForward = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    canvas.bringObjectForward(obj)
    canvas.renderAll()
    saveHistory()
  }

  const sendBackward = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    canvas.sendObjectBackwards(obj)
    canvas.renderAll()
    saveHistory()
  }

  const updateProp = (props: Partial<typeof selectedProps>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    const newProps = { ...selectedProps, ...props }
    setSelectedProps(newProps)
    obj.set(props as Parameters<FabricObject['set']>[0])
    canvas.requestRenderAll()
  }

  const handleBgColorChange = (color: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setBgColor(color)
    canvas.backgroundColor = color
    canvas.renderAll()
  }

  const commitBgColor = () => {
    saveHistory()
  }

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const canvas = canvasRef.current
    if (!canvas) return
    const url = URL.createObjectURL(file)
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      img.scaleToWidth(CANVAS_W)
      img.set({ left: 0, top: 0, selectable: false, evented: false })
      // Remove existing background image if any
      const existing = canvas.getObjects().find(o => !(o as FabricObject & { selectable: boolean }).selectable && (o as FabricObject).type === 'image')
      if (existing) canvas.remove(existing)
      canvas.insertAt(0, img)
      canvas.renderAll()
      saveHistory()
      toast.success('Background image applied!')
    } catch {
      toast.error('Failed to load background image.')
    } finally {
      URL.revokeObjectURL(url)
      e.target.value = ''
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const canvas = canvasRef.current
    if (!canvas) return
    const url = URL.createObjectURL(file)
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      // Scale down if too big
      const maxSize = Math.min(CANVAS_W, CANVAS_H) * 0.6
      if (img.width && img.width > maxSize) img.scaleToWidth(maxSize)
      img.set({ left: CANVAS_W / 2, top: CANVAS_H / 2, originX: 'center', originY: 'center' })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
      saveHistory()
      toast.success('Image added!')
    } catch {
      toast.error('Failed to load image.')
    } finally {
      URL.revokeObjectURL(url)
      e.target.value = ''
    }
  }

  const handlePdfOrAiImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const canvas = canvasRef.current
    if (!canvas) return
    setImporting(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1 })
      // Scale to fit canvas width
      const scale = CANVAS_W / viewport.width
      const scaledViewport = page.getViewport({ scale })

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = scaledViewport.width
      tempCanvas.height = scaledViewport.height
      const ctx = tempCanvas.getContext('2d')!
      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise

      const imageURL = tempCanvas.toDataURL('image/jpeg', 0.95)
      const img = await FabricImage.fromURL(imageURL, { crossOrigin: 'anonymous' })
      img.set({ left: 0, top: 0, selectable: false, evented: false })
      img.scaleToWidth(CANVAS_W)

      // Remove existing locked background images
      const toRemove = canvas.getObjects().filter(o => !(o as FabricObject & { selectable: boolean }).selectable)
      toRemove.forEach(o => canvas.remove(o))
      canvas.insertAt(0, img)
      canvas.renderAll()
      saveHistory()
      toast.success(`${file.name.endsWith('.ai') ? 'AI' : 'PDF'} file imported as background!`)
    } catch {
      toast.error('Failed to import file. Make sure it is a valid PDF or AI file.')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const handleZoom = (delta: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const newZoom = Math.max(0.3, Math.min(2, zoom + delta))
    setZoom(newZoom)
    canvas.setZoom(newZoom)
    canvas.setDimensions({ width: CANVAS_W * newZoom, height: CANVAS_H * newZoom })
  }

  const resetZoom = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setZoom(1)
    canvas.setZoom(1)
    canvas.setDimensions({ width: CANVAS_W, height: CANVAS_H })
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  const exportAs = async (format: 'jpeg' | 'png' | 'pdf') => {
    const canvas = canvasRef.current
    if (!canvas) return
    setExporting(format)
    setShowExportMenu(false)
    try {
      // Temporarily reset zoom for export
      const prevZoom = canvas.getZoom()
      canvas.setZoom(1)
      canvas.setDimensions({ width: CANVAS_W, height: CANVAS_H })

      if (format === 'pdf') {
        const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.95, multiplier: 2 })
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] })
        pdf.addImage(dataURL, 'JPEG', 0, 0, 85.6, 53.98)
        pdf.save(`${title || 'gift-card'}.pdf`)
        toast.success('Exported as PDF!')
      } else {
        const dataURL = canvas.toDataURL({ format, quality: format === 'jpeg' ? 0.95 : undefined, multiplier: 2 })
        const link = document.createElement('a')
        link.download = `${title || 'gift-card'}.${format === 'jpeg' ? 'jpg' : 'png'}`
        link.href = dataURL
        link.click()
        toast.success(`Exported as ${format.toUpperCase()}!`)
      }

      // Restore zoom
      canvas.setZoom(prevZoom)
      canvas.setDimensions({ width: CANVAS_W * prevZoom, height: CANVAS_H * prevZoom })
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  // ─── Render helpers ───────────────────────────────────────────────────────

  const isText = selected instanceof IText
  const isShape = selected instanceof Rect || selected instanceof Circle
  const isImage = selected?.type === 'image'

  const toolButtons: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select' },
    { id: 'text', icon: <Type size={18} />, label: 'Text' },
    { id: 'rect', icon: <Square size={18} />, label: 'Rectangle' },
    { id: 'circle', icon: <CircleIcon size={18} />, label: 'Circle' },
    { id: 'image', icon: <ImageIcon size={18} />, label: 'Image' },
  ]

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden" style={{ minHeight: '100%' }}>
      {/* ── Top Toolbar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 shadow-sm shrink-0 h-12">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mr-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        {/* Card title */}
        <input
          aria-label="Card name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-44 truncate"
          placeholder="Card Name"
        />

        <div className="flex-1" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={histIdx <= 0}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={histIdx >= histLen - 1}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Zoom */}
        <button onClick={() => handleZoom(-0.1)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <button
          onClick={resetZoom}
          className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors min-w-[44px] text-center"
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={() => handleZoom(0.1)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Zoom In">
          <ZoomIn size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            disabled={!!exporting}
          >
            {exporting ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : <Download size={15} />}
            <span>Export</span>
            <ChevronDown size={13} />
          </button>
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[140px]">
                {(['jpeg', 'png', 'pdf'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => exportAs(fmt)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {fmt === 'pdf' ? <FileText size={15} /> : <ImageIcon size={15} />}
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Left Toolbar */}
        <div className="flex flex-col items-center gap-1 w-14 bg-white border-r border-gray-200 py-3 shrink-0">
          {toolButtons.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => {
                if (id === 'image') {
                  imageInputRef.current?.click()
                } else {
                  setTool(id)
                }
              }}
              className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl text-xs gap-0.5 transition-all
                ${tool === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
              title={label}
            >
              {icon}
            </button>
          ))}

          <div className="w-8 h-px bg-gray-200 my-1" />

          {/* Background color */}
          <div className="relative group" title="Background Color">
            <label className="flex flex-col items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors">
              <Palette size={18} />
              <input
                aria-label="Background color"
                type="color"
                value={bgColor}
                onChange={(e) => handleBgColorChange(e.target.value)}
                onBlur={commitBgColor}
                className="absolute opacity-0 w-0 h-0"
              />
            </label>
            <div
              className="absolute left-1 bottom-0.5 w-8 h-2 rounded-sm border border-gray-300 pointer-events-none"
              style={{ background: bgColor }}
            />
          </div>

          {/* BG Image */}
          <label className="flex flex-col items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors" title="Background Image">
            <Upload size={17} />
            <input ref={bgImageInputRef} type="file" accept="image/*" aria-label="Upload background image" className="hidden" onChange={handleBgImageUpload} />
          </label>

          {/* Import PDF / AI */}
          <label
            className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-colors ${importing ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Import PDF or AI file as background"
          >
            {importing ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : <FileText size={17} />}
            <input ref={pdfInputRef} type="file" accept=".pdf,.ai,application/pdf,application/postscript" aria-label="Import PDF or AI file as background" className="hidden" onChange={handlePdfOrAiImport} />
          </label>

          {/* Layers (duplicate/order) */}
          {selected && (
            <>
              <div className="w-8 h-px bg-gray-200 my-1" />
              <button onClick={bringForward} className="flex flex-col items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors" title="Bring Forward">
                <Layers size={17} />
              </button>
              <button onClick={sendBackward} className="flex flex-col items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors" title="Send Backward">
                <Layers size={17} className="rotate-180" />
              </button>
              <button onClick={deleteSelected} className="flex flex-col items-center justify-center w-10 h-10 rounded-xl text-red-500 hover:bg-red-50 transition-colors" title="Delete (Del)">
                <Trash2 size={17} />
              </button>
            </>
          )}
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center overflow-auto bg-gray-200 p-8">
          <div
            className="shadow-2xl rounded-lg overflow-hidden"
            style={{ lineHeight: 0, background: 'transparent' }}
          >
            <canvas ref={canvasElRef} />
          </div>
        </div>

        {/* Right properties panel */}
        <div className="w-56 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
          {!selected ? (
            <div className="p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Canvas</p>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Background Color</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  onBlur={commitBgColor}
                  className="h-8 w-full rounded-lg cursor-pointer border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Background Image</label>
                <label className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer">
                  <Upload size={12} /> Upload image
                  <input type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Import PDF / AI</label>
                <label className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer">
                  <FileText size={12} /> Import file
                  <input type="file" accept=".pdf,.ai,application/pdf" className="hidden" onChange={handlePdfOrAiImport} />
                </label>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">Size: {CANVAS_W} × {CANVAS_H}px</p>
                <p className="text-xs text-gray-400 mt-0.5">Standard gift card ratio</p>
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shortcuts</p>
                <p className="text-xs text-gray-400">Ctrl+Z – Undo</p>
                <p className="text-xs text-gray-400">Ctrl+Y – Redo</p>
                <p className="text-xs text-gray-400">Ctrl+D – Duplicate</p>
                <p className="text-xs text-gray-400">Del – Delete</p>
                <p className="text-xs text-gray-400">Dbl-click – Edit text</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {isText ? 'Text' : isImage ? 'Image' : 'Shape'}
                </p>
                <button onClick={deleteSelected} className="p-1 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Text properties */}
              {isText && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                    <select
                      value={selectedProps.fontFamily}
                      onChange={(e) => updateProp({ fontFamily: e.target.value })}
                      className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {FONT_FAMILIES.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                    <div className="flex gap-1">
                      <select
                        value={selectedProps.fontSize}
                        onChange={(e) => updateProp({ fontSize: Number(e.target.value) })}
                        className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input
                        type="number"
                        value={selectedProps.fontSize}
                        onChange={(e) => updateProp({ fontSize: Number(e.target.value) })}
                        className="w-16 text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        min={4}
                        max={400}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Style</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateProp({ fontWeight: selectedProps.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${selectedProps.fontWeight === 'bold' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        title="Bold (B)"
                      >
                        <Bold size={12} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => updateProp({ fontStyle: selectedProps.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        className={`flex-1 py-1.5 rounded-lg text-xs italic border transition-colors ${selectedProps.fontStyle === 'italic' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        title="Italic (I)"
                      >
                        <Italic size={12} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => updateProp({ underline: !selectedProps.underline })}
                        className={`flex-1 py-1.5 rounded-lg text-xs border transition-colors ${selectedProps.underline ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        title="Underline (U)"
                      >
                        <Underline size={12} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Alignment</label>
                    <div className="flex gap-1">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <button
                          key={align}
                          onClick={() => updateProp({ textAlign: align })}
                          className={`flex-1 py-1.5 rounded-lg border transition-colors ${selectedProps.textAlign === align ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {align === 'left' ? <AlignLeft size={12} className="mx-auto" /> : align === 'center' ? <AlignCenter size={12} className="mx-auto" /> : <AlignRight size={12} className="mx-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={selectedProps.fill}
                      onChange={(e) => updateProp({ fill: e.target.value })}
                      onBlur={saveHistory}
                      className="h-8 w-full rounded-lg cursor-pointer border border-gray-300"
                    />
                  </div>
                </>
              )}

              {/* Shape properties */}
              {isShape && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fill Color</label>
                    <input
                      type="color"
                      value={selectedProps.fill.startsWith('rgba') ? '#4f46e5' : selectedProps.fill}
                      onChange={(e) => updateProp({ fill: e.target.value })}
                      onBlur={saveHistory}
                      className="h-8 w-full rounded-lg cursor-pointer border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Stroke Color</label>
                    <input
                      type="color"
                      value={selectedProps.stroke}
                      onChange={(e) => updateProp({ stroke: e.target.value })}
                      onBlur={saveHistory}
                      className="h-8 w-full rounded-lg cursor-pointer border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Stroke Width</label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={selectedProps.strokeWidth}
                      onChange={(e) => updateProp({ strokeWidth: Number(e.target.value) })}
                      onMouseUp={saveHistory}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 mt-0.5">{selectedProps.strokeWidth}px</p>
                  </div>
                </>
              )}

              {/* Common: opacity */}
              {(isShape || isImage || isText) && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Opacity</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={selectedProps.opacity}
                    onChange={(e) => updateProp({ opacity: Number(e.target.value) })}
                    onMouseUp={saveHistory}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">{Math.round(selectedProps.opacity * 100)}%</p>
                </div>
              )}

              {/* Image: replace */}
              {isImage && (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Replace Image</label>
                  <label className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer">
                    <Upload size={12} /> Upload new image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const canvas = canvasRef.current
                        if (!canvas) return
                        const url = URL.createObjectURL(file)
                        try {
                          const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
                          const activeImg = canvas.getActiveObject()
                          if (!activeImg) return
                          const { left, top, scaleX, scaleY, angle } = activeImg
                          canvas.remove(activeImg)
                          img.set({ left, top, scaleX, scaleY, angle })
                          canvas.add(img)
                          canvas.setActiveObject(img)
                          canvas.renderAll()
                          saveHistory()
                        } finally {
                          URL.revokeObjectURL(url)
                          e.target.value = ''
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Order actions */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Layer Order</p>
                <div className="flex gap-2">
                  <button onClick={bringForward} className="flex-1 text-xs py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">↑ Forward</button>
                  <button onClick={sendBackward} className="flex-1 text-xs py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">↓ Backward</button>
                </div>
                <button onClick={duplicateSelected} className="w-full text-xs py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                  Duplicate (Ctrl+D)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" aria-label="Upload image" className="hidden" onChange={handleImageUpload} />
    </div>
  )
}
