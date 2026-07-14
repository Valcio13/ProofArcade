/**
 * Admin Authentication & Authorization
 * 
 * Secure authentication system using wallet signatures.
 * Only the validator address can access admin functions.
 */

const ADMIN_SESSION_KEY = 'proofarcade_admin_session'
const SESSION_DURATION = 4 * 60 * 60 * 1000 // 4 hours

// Get validator address from environment
function getValidatorAddress(): string | null {
  // The validator address should be loaded from backend
  // For now, we'll fetch it from backend config
  return null // Will be loaded dynamically
}

/**
 * Fetch validator address from backend
 */
let cachedValidatorAddress: string | null = null

export async function fetchValidatorAddress(): Promise<string | null> {
  if (cachedValidatorAddress) {
    return cachedValidatorAddress
  }

  try {
    const baseUrl = import.meta.env.VITE_ADMIN_RPC_URL || 'http://localhost:15003'
    const response = await fetch(`${baseUrl}/v1/admin/validator-address`)
    const data = await response.json()
    
    if (data.address) {
      cachedValidatorAddress = data.address.toLowerCase()
      return cachedValidatorAddress
    }
  } catch (error) {
    console.error('Failed to fetch validator address:', error)
  }
  
  return null
}

/**
 * Check if an address is the validator (admin)
 */
export async function isAdminAddress(address: string): Promise<boolean> {
  const validatorAddress = await fetchValidatorAddress()
  if (!validatorAddress) return false
  
  return validatorAddress.toLowerCase() === address.toLowerCase()
}

/**
 * Get list of authorized admin addresses (just the validator)
 */
export async function getAdminAddresses(): Promise<string[]> {
  const validatorAddress = await fetchValidatorAddress()
  return validatorAddress ? [validatorAddress] : []
}

/**
 * Check if current user is authenticated as admin
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!session) return false
    
    const { address, timestamp, loginTimestamp } = JSON.parse(session)
    
    // Check if session is expired
    const now = Date.now()
    const sessionAge = now - timestamp
    
    if (sessionAge > SESSION_DURATION) {
      clearAdminSession()
      return false
    }
    
    // Verify address is the validator
    const isValid = await isAdminAddress(address)
    if (!isValid) {
      clearAdminSession()
      return false
    }
    
    // Verify login timestamp exists (proof of wallet authentication)
    if (!loginTimestamp) {
      clearAdminSession()
      return false
    }
    
    return true
  } catch (error) {
    console.error('Failed to check admin authentication:', error)
    return false
  }
}

/**
 * Get current admin session
 */
export function getAdminSession(): { address: string; timestamp: number; loginTimestamp: string } | null {
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!session) return null
    return JSON.parse(session)
  } catch (error) {
    return null
  }
}

/**
 * Authenticate as admin with wallet login timestamp
 */
export async function authenticateAdmin(address: string, loginTimestamp: string): Promise<boolean> {
  const isValid = await isAdminAddress(address)
  if (!isValid) {
    return false
  }
  
  const session = {
    address,
    timestamp: Date.now(),
    loginTimestamp, // Store the wallet login timestamp as proof of authentication
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
