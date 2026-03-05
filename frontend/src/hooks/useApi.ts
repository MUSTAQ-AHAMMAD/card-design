import { useState, useCallback } from 'react'
import type { AxiosPromise } from 'axios'
import toast from 'react-hot-toast'

interface UseApiOptions {
  successMessage?: string
  errorMessage?: string
  showErrorToast?: boolean
}

export function useApi<T>(
  apiFn: (...args: unknown[]) => AxiosPromise<T>,
  options: UseApiOptions = {}
) {
  const { successMessage, showErrorToast = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiFn(...args)
        setData(response.data)
        if (successMessage) toast.success(successMessage)
        return response.data
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'An unexpected error occurred'
        setError(message)
        if (showErrorToast) toast.error(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFn, successMessage, showErrorToast]
  )

  return { data, loading, error, execute }
}
