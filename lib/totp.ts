// TOTP (Time-based One-Time Password) implementation
// Based on RFC 6238

/**
 * Generate a TOTP code from a secret key
 * @param secret - Base32 encoded secret key
 * @param timeStep - Time step in seconds (default: 30)
 * @param digits - Number of digits in the code (default: 6)
 * @returns The current TOTP code
 */
export async function generateTOTP(secret: string, timeStep = 30, digits = 6): Promise<string> {
  try {
    // Decode base32 secret to bytes
    const secretBytes = base32Decode(secret.replace(/\s/g, "").toUpperCase())

    // Calculate time counter (number of time steps since epoch)
    const counter = Math.floor(Date.now() / 1000 / timeStep)

    // Convert counter to 8-byte buffer
    const counterBuffer = new ArrayBuffer(8)
    const counterView = new DataView(counterBuffer)
    counterView.setBigUint64(0, BigInt(counter), false) // Big-endian

    // Import secret key for HMAC
    const key = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"])

    // Generate HMAC
    const signature = await crypto.subtle.sign("HMAC", key, counterBuffer)
    const signatureArray = new Uint8Array(signature)

    // Dynamic truncation
    const offset = signatureArray[signatureArray.length - 1] & 0x0f
    const binary =
      ((signatureArray[offset] & 0x7f) << 24) |
      ((signatureArray[offset + 1] & 0xff) << 16) |
      ((signatureArray[offset + 2] & 0xff) << 8) |
      (signatureArray[offset + 3] & 0xff)

    // Generate code
    const code = binary % Math.pow(10, digits)
    return code.toString().padStart(digits, "0")
  } catch (error) {
    console.error("Error generating TOTP:", error)
    throw error
  }
}

/**
 * Get remaining seconds until next TOTP code
 * @param timeStep - Time step in seconds (default: 30)
 * @returns Remaining seconds
 */
export function getRemainingSeconds(timeStep = 30): number {
  return timeStep - (Math.floor(Date.now() / 1000) % timeStep)
}

/**
 * Decode base32 string to Uint8Array
 */
function base32Decode(input: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  const cleanInput = input.replace(/[^A-Z2-7]/g, "")

  let bits = ""
  for (const char of cleanInput) {
    const index = alphabet.indexOf(char)
    if (index === -1) continue
    bits += index.toString(2).padStart(5, "0")
  }

  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2))
  }

  return new Uint8Array(bytes)
}

/**
 * Parse otpauth:// URI to extract secret and issuer
 */
export function parseOTPAuthURI(uri: string): {
  secret: string
  issuer?: string
  account?: string
} | null {
  try {
    const url = new URL(uri)
    if (url.protocol !== "otpauth:") return null

    const secret = url.searchParams.get("secret")
    if (!secret) return null

    const issuer = url.searchParams.get("issuer") || url.hostname
    const account = url.pathname.slice(1) // Remove leading /

    return { secret, issuer, account }
  } catch {
    return null
  }
}
