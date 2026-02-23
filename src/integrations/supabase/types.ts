export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_favorite: boolean | null
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          street_address: string | null
          updated_at: string
          user_id: string
          vault_id: string | null
        }
        Insert: {
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          user_id: string
          vault_id?: string | null
        }
        Update: {
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          user_id?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          bank_name: string | null
          branch_address: string | null
          branch_name: string | null
          created_at: string
          iban: string | null
          id: string
          is_favorite: boolean | null
          name: string
          notes: string | null
          routing_number: string | null
          swift_bic: string | null
          updated_at: string
          user_id: string
          vault_id: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          branch_address?: string | null
          branch_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          notes?: string | null
          routing_number?: string | null
          swift_bic?: string | null
          updated_at?: string
          user_id: string
          vault_id?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          branch_address?: string | null
          branch_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          notes?: string | null
          routing_number?: string | null
          swift_bic?: string | null
          updated_at?: string
          user_id?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          billing_address: string | null
          card_number: string
          card_type: string | null
          cardholder_name: string | null
          created_at: string
          cvv: string | null
          expiry_date: string | null
          id: string
          is_favorite: boolean | null
          name: string
          notes: string | null
          pin: string | null
          updated_at: string
          user_id: string
          vault_id: string | null
        }
        Insert: {
          billing_address?: string | null
          card_number: string
          card_type?: string | null
          cardholder_name?: string | null
          created_at?: string
          cvv?: string | null
          expiry_date?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          notes?: string | null
          pin?: string | null
          updated_at?: string
          user_id: string
          vault_id?: string | null
        }
        Update: {
          billing_address?: string | null
          card_number?: string
          card_type?: string | null
          cardholder_name?: string | null
          created_at?: string
          cvv?: string | null
          expiry_date?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          notes?: string | null
          pin?: string | null
          updated_at?: string
          user_id?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_wallets: {
        Row: {
          created_at: string
          id: string
          is_favorite: boolean | null
          name: string
          notes: string | null
          private_key: string | null
          seed_phrase: string | null
          updated_at: string
          user_id: string
          vault_id: string | null
          wallet_address: string | null
          wallet_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name: string
          notes?: string | null
          private_key?: string | null
          seed_phrase?: string | null
          updated_at?: string
          user_id: string
          vault_id?: string | null
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          notes?: string | null
          private_key?: string | null
          seed_phrase?: string | null
          updated_at?: string
          user_id?: string
          vault_id?: string | null
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_wallets_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      id_cards: {
        Row: {
          country: string | null
          created_at: string
          date_of_birth: string | null
          expiry_date: string | null
          full_name: string | null
          id: string
          id_number: string
          id_type: string | null
          is_favorite: boolean | null
          issue_date: string | null
          issuing_authority: string | null
          name: string
          notes: string | null
          updated_at: string
          user_id: string
          vault_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          expiry_date?: string | null
          full_name?: string | null
          id?: string
          id_number: string
          id_type?: string | null
          is_favorite?: boolean | null
          issue_date?: string | null
          issuing_authority?: string | null
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
          vault_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          expiry_date?: string | null
          full_name?: string | null
          id?: string
          id_number?: string
          id_type?: string | null
          is_favorite?: boolean | null
          issue_date?: string | null
          issuing_authority?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "id_cards_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      login_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          is_primary: boolean | null
          last_active_at: string
          location: string | null
          logged_in_at: string
          os: string | null
          session_token: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_primary?: boolean | null
          last_active_at?: string
          location?: string | null
          logged_in_at?: string
          os?: string | null
          session_token?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_primary?: boolean | null
          last_active_at?: string
          location?: string | null
          logged_in_at?: string
          os?: string | null
          session_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          title: string
          updated_at: string
          user_id: string
          vault_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title: string
          updated_at?: string
          user_id: string
          vault_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      passwords: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          name: string
          notes: string | null
          password: string
          updated_at: string
          url: string | null
          user_id: string
          username: string | null
          vault_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name: string
          notes?: string | null
          password: string
          updated_at?: string
          url?: string | null
          user_id: string
          username?: string | null
          vault_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          notes?: string | null
          password?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          username?: string | null
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passwords_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          encryption_salt: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          encryption_salt?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          encryption_salt?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      shared_items: {
        Row: {
          created_at: string
          encrypted_data: string
          expires_at: string | null
          id: string
          is_accepted: boolean | null
          item_id: string
          item_name: string
          item_type: string
          recipient_id: string
          sender_id: string
          share_key_hint: string | null
          shared_at: string
        }
        Insert: {
          created_at?: string
          encrypted_data: string
          expires_at?: string | null
          id?: string
          is_accepted?: boolean | null
          item_id: string
          item_name: string
          item_type: string
          recipient_id: string
          sender_id: string
          share_key_hint?: string | null
          shared_at?: string
        }
        Update: {
          created_at?: string
          encrypted_data?: string
          expires_at?: string | null
          id?: string
          is_accepted?: boolean | null
          item_id?: string
          item_name?: string
          item_type?: string
          recipient_id?: string
          sender_id?: string
          share_key_hint?: string | null
          shared_at?: string
        }
        Relationships: []
      }
      software_licenses: {
        Row: {
          created_at: string
          email: string | null
          expiry_date: string | null
          id: string
          is_favorite: boolean | null
          license_key: string
          name: string
          notes: string | null
          password: string | null
          purchase_date: string | null
          software_type: string | null
          updated_at: string
          user_id: string
          vault_id: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expiry_date?: string | null
          id?: string
          is_favorite?: boolean | null
          license_key: string
          name: string
          notes?: string | null
          password?: string | null
          purchase_date?: string | null
          software_type?: string | null
          updated_at?: string
          user_id: string
          vault_id?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expiry_date?: string | null
          id?: string
          is_favorite?: boolean | null
          license_key?: string
          name?: string
          notes?: string | null
          password?: string | null
          purchase_date?: string | null
          software_type?: string | null
          updated_at?: string
          user_id?: string
          vault_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "software_licenses_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      ssh_keys: {
        Row: {
          created_at: string
          id: string
          is_favorite: boolean | null
          key_type: string | null
          name: string
          notes: string | null
          passphrase: string | null
          private_key: string
          public_key: string | null
          updated_at: string
          user_id: string
          vault_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          key_type?: string | null
          name: string
          notes?: string | null
          passphrase?: string | null
          private_key: string
          public_key?: string | null
          updated_at?: string
          user_id: string
          vault_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          key_type?: string | null
          name?: string
          notes?: string | null
          passphrase?: string | null
          private_key?: string
          public_key?: string | null
          updated_at?: string
          user_id?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ssh_keys_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      totp_authenticators: {
        Row: {
          created_at: string
          id: string
          is_favorite: boolean | null
          issuer: string | null
          name: string
          secret: string
          updated_at: string
          user_id: string
          vault_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          issuer?: string | null
          name: string
          secret: string
          updated_at?: string
          user_id: string
          vault_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          issuer?: string | null
          name?: string
          secret?: string
          updated_at?: string
          user_id?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "totp_authenticators_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      vaults: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_sessions: { Args: never; Returns: undefined }
      find_user_by_identifier: {
        Args: { p_identifier: string }
        Returns: {
          display_name: string
          user_id: string
          username: string
        }[]
      }
      get_email_by_username: { Args: { p_username: string }; Returns: string }
      get_user_id_by_username: { Args: { p_username: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
