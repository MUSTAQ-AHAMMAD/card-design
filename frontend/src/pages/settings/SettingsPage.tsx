import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Bell, Palette, Save } from 'lucide-react'
import { usersApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [notifications, setNotifications] = useState({
    giftCardSent: true,
    giftCardReceived: true,
    giftCardRedeemed: false,
    weeklyReport: true,
    newUser: false,
  })

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  })

  const { register: regPassword, handleSubmit: submitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onSaveProfile = async (data: ProfileForm) => {
    setSavingProfile(true)
    try {
      await usersApi.updateProfile({ firstName: data.firstName, lastName: data.lastName })
      await refreshProfile()
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const onChangePassword = async (data: PasswordForm) => {
    setSavingPassword(true)
    try {
      await usersApi.changePassword(data.currentPassword, data.newPassword)
      toast.success('Password changed successfully')
      resetPassword()
    } catch {
      toast.error('Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-6 flex-col sm:flex-row">
        {/* Tab sidebar */}
        <div className="sm:w-48 shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile */}
          {activeTab === 'profile' && (
            <Card>
              <h2 className="font-semibold text-gray-900 mb-6">Profile Information</h2>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {user?.role}
                  </span>
                </div>
              </div>

              <form onSubmit={submitProfile(onSaveProfile)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First name"
                    error={profileErrors.firstName?.message}
                    {...regProfile('firstName')}
                  />
                  <Input
                    label="Last name"
                    error={profileErrors.lastName?.message}
                    {...regProfile('lastName')}
                  />
                </div>
                <Input
                  label="Email address"
                  type="email"
                  disabled
                  error={profileErrors.email?.message}
                  {...regProfile('email')}
                />
                <p className="text-xs text-gray-400">Email cannot be changed. Contact an admin if needed.</p>
                <Button type="submit" loading={savingProfile} leftIcon={<Save size={16} />}>
                  Save Changes
                </Button>
              </form>
            </Card>
          )}

          {/* Password */}
          {activeTab === 'password' && (
            <Card>
              <h2 className="font-semibold text-gray-900 mb-6">Change Password</h2>
              <form onSubmit={submitPassword(onChangePassword)} className="space-y-4">
                <Input
                  label="Current password"
                  type="password"
                  error={passwordErrors.currentPassword?.message}
                  {...regPassword('currentPassword')}
                />
                <Input
                  label="New password"
                  type="password"
                  placeholder="Min. 8 characters"
                  error={passwordErrors.newPassword?.message}
                  {...regPassword('newPassword')}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  error={passwordErrors.confirmPassword?.message}
                  {...regPassword('confirmPassword')}
                />
                <Button type="submit" loading={savingPassword} leftIcon={<Lock size={16} />}>
                  Update Password
                </Button>
              </form>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <h2 className="font-semibold text-gray-900 mb-6">Email Notifications</h2>
              <div className="space-y-4">
                {[
                  { key: 'giftCardSent' as const, label: 'Gift card sent', desc: 'When you send a gift card' },
                  { key: 'giftCardReceived' as const, label: 'Gift card received', desc: 'When you receive a gift card' },
                  { key: 'giftCardRedeemed' as const, label: 'Gift card redeemed', desc: 'When your sent card is redeemed' },
                  { key: 'weeklyReport' as const, label: 'Weekly summary', desc: 'Weekly activity report' },
                  { key: 'newUser' as const, label: 'New user joined', desc: 'When a new employee registers (Admin/HR only)' },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        notifications[n.key] ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[n.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <Button className="mt-6" leftIcon={<Save size={16} />} onClick={() => toast.success('Notification preferences saved')}>
                Save Preferences
              </Button>
            </Card>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <Card>
              <h2 className="font-semibold text-gray-900 mb-6">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Light', bg: 'bg-white', preview: '☀️' },
                      { label: 'Dark', bg: 'bg-gray-900', preview: '🌙' },
                      { label: 'System', bg: 'bg-gradient-to-br from-white to-gray-800', preview: '⚙️' },
                    ].map((theme) => (
                      <button
                        key={theme.label}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors
                          ${theme.label === 'Light' ? 'border-indigo-500' : 'border-gray-200 hover:border-indigo-300'}`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${theme.bg} border border-gray-200`} />
                        <span className="text-sm font-medium text-gray-700">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
