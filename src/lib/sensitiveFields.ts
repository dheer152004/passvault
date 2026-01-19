export const SENSITIVE_FIELDS = {
  passwords: ['password', 'username', 'url', 'notes'] as const,
  notes: ['content'] as const,
  cards: ['card_number', 'cvv', 'pin', 'billing_address', 'notes'] as const,
  addresses: ['street_address', 'phone', 'email', 'notes'] as const,
  totp_authenticators: ['secret'] as const,
  id_cards: ['id_number', 'notes'] as const,
  ssh_keys: ['public_key', 'private_key', 'passphrase', 'notes'] as const,
  crypto_wallets: ['wallet_address', 'private_key', 'seed_phrase', 'notes'] as const,
  bank_accounts: ['account_number', 'routing_number', 'iban', 'swift_bic', 'notes'] as const,
  software_licenses: ['license_key', 'password', 'notes'] as const,
} as const;

export type SensitiveFieldsMap = typeof SENSITIVE_FIELDS;
