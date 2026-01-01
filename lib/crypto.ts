/**
 * Crypto utilities for password encryption and master password hashing
 */

// Generate a random salt for password hashing
export function generateSalt(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Hash the master password with salt using Web Crypto API
export async function hashMasterPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Verify master password against stored hash
export async function verifyMasterPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const computedHash = await hashMasterPassword(password, salt)
  return computedHash === hash
}

// Derive encryption key from master password
export async function deriveMasterKey(masterPassword: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(masterPassword), "PBKDF2", false, [
    "deriveBits",
    "deriveKey",
  ])

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("passvault-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  )
}

// Encrypt password with master key
export async function encryptPassword(password: string, masterKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, masterKey, encoder.encode(password))

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

// Decrypt password with master key
export async function decryptPassword(encryptedPassword: string, masterKey: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedPassword), (c) => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, masterKey, encrypted)

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

export async function encryptData(data: string, masterPassword: string): Promise<string> {
  const masterKey = await deriveMasterKey(masterPassword)
  return encryptPassword(data, masterKey)
}

export async function decryptData(encryptedData: string, masterPassword: string): Promise<string> {
  const masterKey = await deriveMasterKey(masterPassword)
  return decryptPassword(encryptedData, masterKey)
}
