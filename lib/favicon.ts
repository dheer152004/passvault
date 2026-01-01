/**
 * Get favicon URL for a website
 * Uses multiple fallback strategies to fetch website logos/favicons
 */
export function getFaviconUrl(websiteUrl: string | null): string | null {
  if (!websiteUrl) return null

  try {
    const url = new URL(websiteUrl)
    const domain = url.hostname

    // Use Google's favicon service as primary method (reliable and fast)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return null
  }
}

/**
 * Get the domain name from a URL for display
 */
export function getDomainName(websiteUrl: string | null): string | null {
  if (!websiteUrl) return null

  try {
    const url = new URL(websiteUrl)
    return url.hostname.replace("www.", "")
  } catch {
    return null
  }
}
