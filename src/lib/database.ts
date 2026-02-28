/**
 * Database Provider Adapter
 * 
 * This module abstracts database operations to support both Supabase and Neon.
 * It allows switching between providers using the VITE_DATABASE_PROVIDER environment variable.
 */

import { supabase } from '@/integrations/supabase/client';
import { neonDatabase } from '@/integrations/neon/client';

export type DatabaseProvider = 'supabase' | 'neon';

const DATABASE_PROVIDER = (import.meta.env.VITE_DATABASE_PROVIDER as DatabaseProvider) || 'supabase';

/**
 * Unified database interface
 * Provides the same methods regardless of the underlying provider
 */
export class DatabaseAdapter {
  private provider: DatabaseProvider;

  constructor(provider: DatabaseProvider = DATABASE_PROVIDER) {
    this.provider = provider;
    console.log(`[Database] Using provider: ${provider}`);
  }

  /**
   * Get the appropriate database client
   */
  getClient() {
    if (this.provider === 'neon') {
      return neonDatabase;
    }
    return supabase;
  }

  /**
   * Get current provider
   */
  getProvider(): DatabaseProvider {
    return this.provider;
  }

  /**
   * Switch provider at runtime
   */
  setProvider(provider: DatabaseProvider) {
    this.provider = provider;
    console.log(`[Database] Switched to provider: ${provider}`);
  }

  /**
   * Check if using Neon
   */
  isNeon(): boolean {
    return this.provider === 'neon';
  }

  /**
   * Check if using Supabase
   */
  isSupabase(): boolean {
    return this.provider === 'supabase';
  }
}

export const databaseAdapter = new DatabaseAdapter();

/**
 * Helper function to get the active database client
 */
export function getDatabase() {
  return databaseAdapter.getClient();
}

/**
 * Helper function to get the current provider
 */
export function getDatabaseProvider(): DatabaseProvider {
  return databaseAdapter.getProvider();
}
