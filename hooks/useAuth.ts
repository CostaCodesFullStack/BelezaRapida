'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  isLoading: boolean
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null }>
  register: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  })

  const supabase = createClient()

  useEffect(() => {
    // Busca a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, isLoading: false })
    })

    // Escuta mudanças de autenticação em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, isLoading: false })
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      setState((prev) => ({ ...prev, isLoading: true }))

      const { error } = await supabase.auth.signInWithPassword({ email, password })

      setState((prev) => ({ ...prev, isLoading: false }))

      if (error) return { error: error.message }
      return { error: null }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
    ): Promise<{ error: string | null }> => {
      setState((prev) => ({ ...prev, isLoading: true }))

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      })

      setState((prev) => ({ ...prev, isLoading: false }))

      if (error) return { error: error.message }
      return { error: null }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }))
    await supabase.auth.signOut()
    setState({ user: null, isLoading: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    user: state.user,
    isLoading: state.isLoading,
    login,
    register,
    logout,
  }
}
