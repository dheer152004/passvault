/**
 * Neon PostgreSQL Database Client
 * 
 * This module provides a PostgreSQL client for connecting to Neon database.
 * Neon is a serverless PostgreSQL platform that works as an alternative to Supabase.
 * 
 * Usage:
 * import { neonClient } from "@/integrations/neon/client";
 * 
 * Note: Neon only provides the database. For authentication, you'll need to implement
 * a separate auth solution (Firebase, Clerk, custom JWT, etc.)
 */

import type { Database } from '../supabase/types'; // Reuse database types

const NEON_DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL;

if (!NEON_DATABASE_URL) {
  throw new Error('Missing VITE_NEON_DATABASE_URL');
}

/**
 * Neon Client Interface
 * Provides methods to interact with Neon PostgreSQL database
 */
export class NeonClient {
  private connectionString: string;
  private headers: Record<string, string>;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Execute a SQL query against Neon
   * @param query SQL query string
   * @param values Query parameters
   * @returns Query result
   */
  async query(query: string, values?: (string | number | boolean | null)[]): Promise<any> {
    try {
      const response = await fetch('/api/neon', {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          values,
        }),
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Neon query error:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  async checkConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as connected');
      return !!result;
    } catch {
      return false;
    }
  }
}

export const neonClient = new NeonClient(NEON_DATABASE_URL);

/**
 * Database operations wrapper for Neon
 * Provides a unified interface similar to Supabase
 */
export class NeonDatabase {
  private client: NeonClient;

  constructor(client: NeonClient) {
    this.client = client;
  }

  // Vault operations
  vaults = {
    select: async (userId: string) => {
      const result = await this.client.query(
        'SELECT * FROM vaults WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result;
    },
    
    insert: async (vault: any) => {
      const { name, description, user_id, is_default } = vault;
      const result = await this.client.query(
        `INSERT INTO vaults (name, description, user_id, is_default) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, description, user_id, is_default ?? false]
      );
      return result;
    },

    update: async (id: string, updates: any) => {
      const { name, description, is_default } = updates;
      const result = await this.client.query(
        `UPDATE vaults SET name = $1, description = $2, is_default = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [name, description, is_default, id]
      );
      return result;
    },

    delete: async (id: string) => {
      await this.client.query('DELETE FROM vaults WHERE id = $1', [id]);
    },
  };

  // Password operations
  passwords = {
    select: async (userId: string, vaultId?: string) => {
      if (vaultId) {
        const result = await this.client.query(
          'SELECT * FROM passwords WHERE user_id = $1 AND vault_id = $2 ORDER BY created_at DESC',
          [userId, vaultId]
        );
        return result;
      }
      const result = await this.client.query(
        'SELECT * FROM passwords WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result;
    },

    insert: async (password: any) => {
      const { name, username, password: pwd, url, notes, vault_id, user_id } = password;
      const result = await this.client.query(
        `INSERT INTO passwords (name, username, password, url, notes, vault_id, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, username, pwd, url, notes, vault_id, user_id]
      );
      return result;
    },

    update: async (id: string, updates: any) => {
      const { name, username, password: pwd, url, notes, is_favorite } = updates;
      const result = await this.client.query(
        `UPDATE passwords SET name = $1, username = $2, password = $3, url = $4, notes = $5, 
         is_favorite = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *`,
        [name, username, pwd, url, notes, is_favorite, id]
      );
      return result;
    },

    delete: async (id: string) => {
      await this.client.query('DELETE FROM passwords WHERE id = $1', [id]);
    },
  };

  // Address operations
  addresses = {
    select: async (userId: string) => {
      const result = await this.client.query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result;
    },

    insert: async (address: any) => {
      const {
        name, full_name, street_address, city, state, postal_code, country,
        email, phone, company, notes, vault_id, user_id
      } = address;
      const result = await this.client.query(
        `INSERT INTO addresses (name, full_name, street_address, city, state, postal_code, 
         country, email, phone, company, notes, vault_id, user_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [name, full_name, street_address, city, state, postal_code, country, 
         email, phone, company, notes, vault_id, user_id]
      );
      return result;
    },
  };
}

export const neonDatabase = new NeonDatabase(neonClient);
