/**
 * Zero-Knowledge Encryption Utilities
 * 
 * Uses Web Crypto API for:
 * - PBKDF2 key derivation from master password
 * - AES-256-GCM encryption/decryption
 * 
 * The master password never leaves the client. Only encrypted data is stored.
 */

const PBKDF2_ITERATIONS = 600000; // OWASP recommended minimum
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

// Convert string to Uint8Array
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert Uint8Array to string
function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

// Convert ArrayBuffer to base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate a cryptographic salt
export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return bufferToBase64(salt.buffer as ArrayBuffer);
}

// Derive encryption key from master password using PBKDF2
export async function deriveKey(
  password: string,
  salt: string
): Promise<CryptoKey> {
  const passwordBytes = stringToBytes(password);
  const saltBytes = base64ToBuffer(salt);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes.buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Hash password for authentication (separate from encryption key)
export async function hashPassword(password: string, salt: string): Promise<string> {
  const passwordBytes = stringToBytes(password);
  const saltBytes = base64ToBuffer(salt);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes.buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bufferToBase64(derivedBits);
}

// Encrypt plaintext with AES-GCM
export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<string> {
  if (!plaintext) return '';
  
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintextBytes = stringToBytes(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBytes.buffer as ArrayBuffer
  );

  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return bufferToBase64(combined.buffer as ArrayBuffer);
}

// Decrypt ciphertext with AES-GCM
export async function decrypt(
  encryptedData: string,
  key: CryptoKey
): Promise<string> {
  if (!encryptedData) return '';
  
  try {
    const combined = base64ToBuffer(encryptedData);
    
    // Extract IV and ciphertext
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);

    const plaintextBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext.buffer as ArrayBuffer
    );

    return bytesToString(new Uint8Array(plaintextBytes));
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Decryption failed]';
  }
}

// Encrypt an object's sensitive fields
export async function encryptObject<T extends Record<string, unknown>>(
  obj: T,
  key: CryptoKey,
  sensitiveFields: readonly (keyof T)[]
): Promise<T> {
  const encrypted = { ...obj };
  
  for (const field of sensitiveFields) {
    const value = obj[field];
    if (typeof value === 'string' && value) {
      (encrypted as Record<string, unknown>)[field as string] = await encrypt(value, key);
    }
  }
  
  return encrypted;
}

// Decrypt an object's sensitive fields
export async function decryptObject<T extends Record<string, unknown>>(
  obj: T,
  key: CryptoKey,
  sensitiveFields: readonly (keyof T)[]
): Promise<T> {
  const decrypted = { ...obj };
  
  for (const field of sensitiveFields) {
    const value = obj[field];
    if (typeof value === 'string' && value) {
      (decrypted as Record<string, unknown>)[field as string] = await decrypt(value, key);
    }
  }
  
  return decrypted;
}

// Encrypt an array of objects
export async function encryptArray<T extends Record<string, unknown>>(
  arr: T[],
  key: CryptoKey,
  sensitiveFields: readonly (keyof T)[]
): Promise<T[]> {
  return Promise.all(arr.map(obj => encryptObject(obj, key, sensitiveFields)));
}

// Decrypt an array of objects
export async function decryptArray<T extends Record<string, unknown>>(
  arr: T[],
  key: CryptoKey,
  sensitiveFields: readonly (keyof T)[]
): Promise<T[]> {
  return Promise.all(arr.map(obj => decryptObject(obj, key, sensitiveFields)));
}
