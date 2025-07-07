import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          display_name: string
          avatar_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          goal: string
          target_date: string
          data: any
          created_at: string | null
          updated_at: string | null
          created_by: string
          collaborators: string[] | null
        }
        Insert: {
          id?: string
          title: string
          goal: string
          target_date: string
          data?: any
          created_at?: string | null
          updated_at?: string | null
          created_by: string
          collaborators?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          goal?: string
          target_date?: string
          data?: any
          created_at?: string | null
          updated_at?: string | null
          created_by?: string
          collaborators?: string[] | null
        }
      }
    }
  }
}