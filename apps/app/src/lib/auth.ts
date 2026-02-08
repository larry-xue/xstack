import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export const getSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw error
  }
  return data.session
}

export const getAccessToken = async (): Promise<string | null> => {
  const session = await getSession()
  return session?.access_token ?? null
}
