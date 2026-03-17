import { useNavigate } from 'react-router-dom'
import { GiftCardCanvasEditor } from '../../components/GiftCard/GiftCardCanvasEditor'

export default function GiftCardEditorPage() {
  const navigate = useNavigate()
  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}
    >
      <GiftCardCanvasEditor
        cardName="My Gift Card"
        onBack={() => navigate('/gift-cards')}
      />
    </div>
  )
}
