import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, User, Gift } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import toast from 'react-hot-toast'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500']

  if (!password) return null

  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i <= strength ? colors[strength] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs mt-1 ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-amber-500' : 'text-emerald-600'}`}>
        {labels[strength]}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('password', '')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await authRegister({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      toast.success('Account created! Welcome aboard!')
      navigate('/')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-lg mb-4">
            <Gift className="text-indigo-600" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-indigo-200 mt-1">Join the gift card platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sign up</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="John"
                leftIcon={<User size={16} />}
                error={errors.firstName?.message}
                autoComplete="given-name"
                {...register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Doe"
                error={errors.lastName?.message}
                autoComplete="family-name"
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                autoComplete="new-password"
                {...register('password')}
              />
              <PasswordStrength password={password} />
            </div>

            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
