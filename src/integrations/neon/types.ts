/**
 * Database Type Definitions for Neon
 * 
 * These types are shared with Supabase integration
 * They define the schema of your Neon PostgreSQL database
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Re-export from Supabase types to maintain consistency
export type { Database } from '../supabase/types';
