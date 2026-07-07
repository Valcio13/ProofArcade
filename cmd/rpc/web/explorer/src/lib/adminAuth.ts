/**
 * Admin Authentication & Authorization
 * 
 * Simple authentication system for admin pages.
 * In production, this should be replaced with proper backend authentication.
 */

const ADMIN_ADDRESSES_KEY = 'proofarcade_admin_addresses'
const ADMIN_SESSION_KEY = 'proofarcade_admin_session'

// Default admin addresses (can be configured via environment or backend)
const DEFAULT_ADMIN_ADDRESSES = [
  // Add default admin addresses here
  // Example: '0x1234567890abcdef1234567890abcdef12345678'
]

/**
 * Check if an address is authorized as admin
 */
export function isAdminAddress(address: string): boolean {
  const adminAddresses = getAdminAddresses()
  return adminAddresses.some(
    (admin) => admin.toLowerCase() === address.toLowerCase()
  )
}

/**
 * Get list of authorized admin addresses
 */
export function getAdminAddresses(): string[] {
  try {
    const stored = localStorage.getItem(ADMIN_ADDRESSES_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load admin addresses:', error)
  }
  return DEFAULT_ADMIN_ADDRESSES
}

/**
 * Add an admin address (requires existing admin privileges)
 */
export function addAdminAddress(address: string): boolean {
  if (!isAdminAuthenticated()) {
    return false
  }
  
  const adminAddresses = getAdminAddresses()
  if (!adminAddresses.some((a) => a.toLowerCase() === address.toLowerCase())) {
    adminAddresses.push(address)
    localStorage.setItem(ADMIN_ADDRESSES_KEY, JSON.stringify(adminAddresses))
    return true
  }
  return false
}

/**
 * Remove an admin address (requires existing admin privileges)
 */
export function removeAdminAddress(address: string): boolean {
  if (!isAdminAuthenticated()) {
    return false
  }
  
  const adminAddresses = getAdminAddresses()
  const filtered = adminAddresses.filter(
    (a) => a.toLowerCase() !== address.toLowerCase()
  )
  
  if (filtered.length < adminAddresses.length) {
    localStorage.setItem(ADMIN_ADDRESSES_KEY, JSON.stringify(filtered))
    return true
  }
  return false
}

/**
 * Check if current user is authenticated as admin
 */
export function isAdminAuthenticated(): boolean {
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!session) return false
    
    const { address, timestamp } = JSON.parse(session)
    
    // Check if session is expired (24 hours)
    const now = Date.now()
    const sessionAge = now - timestamp
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    if (sessionAge > maxAge) {
      clearAdminSession()
      return false
    }
    
    return isAdminAddress(address)
  } catch (error) {
    console.error('Failed to check admin authentication:', error)
    return false
  }
}

/**
 * Get current admin session
 */
export function getAdminSession(): { address: string; timestamp: number } | null {
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!session) return null
    return JSON.parse(session)
  } catch (error) {
    return null
  }
}

/**
 * Authenticate as admin with wallet address
 */
export function authenticateAdmin(address: string): boolean {
  if (!isAdminAddress(address)) {
    return false
  }
  
  const session = {
    address,
    timestamp: Date.now(),
  }
  
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
  return true
}

/**
 * Clear admin session (logout)
 */
export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

/**
 * Initialize admin addresses from environment
 */
export function initializeAdminAddresses(addresses: string[]): void {
  if (addresses.length > 0) {
    localStorage.setItem(ADMIN_ADDRESSES_KEY, JSON.stringify(addresses))
  }
}
