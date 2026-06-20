export interface StoredWalletAuth {
  address: string
  nickname: string
  password: string
  loggedInAt: string
  expiresAt: string
  lastActivityAt: string
}

const WALLET_AUTH_STORAGE_KEY = 'canopy-2048-wallet-auth-v1'
const LAST_WALLET_KEY = 'canopy-2048-last-wallet'

// Session timeout configuration
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Check if a session has expired based on max age or inactivity
 */
function isSessionExpired(auth: StoredWalletAuth): boolean {
  const now = Date.now()
  
  // Check absolute expiration
  if (auth.expiresAt && now > new Date(auth.expiresAt).getTime()) {
    return true
  }
  
  // Check inactivity timeout
  if (auth.lastActivityAt && now - new Date(auth.lastActivityAt).getTime() > INACTIVITY_TIMEOUT_MS) {
    return true
  }
  
  return false
}

export function loadStoredWalletAuth(): StoredWalletAuth | null {
  // Changed to sessionStorage for better security
  const raw = sessionStorage.getItem(WALLET_AUTH_STORAGE_KEY)
  
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as StoredWalletAuth
    
    if (!parsed?.address || !parsed?.password) {
      return null
    }
    
    // Check if session has expired
    if (isSessionExpired(parsed)) {
      sessionStorage.removeItem(WALLET_AUTH_STORAGE_KEY)
      return null
    }
    
    // Update last activity timestamp
    const updated: StoredWalletAuth = {
      ...parsed,
      lastActivityAt: new Date().toISOString()
    }
    sessionStorage.setItem(WALLET_AUTH_STORAGE_KEY, JSON.stringify(updated))
    
    return updated
  } catch (error) {
    console.error('[loadStoredWalletAuth] Parse error:', error)
    return null
  }
}

export function persistStoredWalletAuth(auth: Omit<StoredWalletAuth, 'expiresAt' | 'lastActivityAt'>): void {
  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + MAX_SESSION_AGE_MS)
    
    const fullAuth: StoredWalletAuth = {
      ...auth,
      expiresAt: expiresAt.toISOString(),
      lastActivityAt: now.toISOString()
    }
    
    const serialized = JSON.stringify(fullAuth)
    // Changed to sessionStorage for better security (clears on browser close)
    sessionStorage.setItem(WALLET_AUTH_STORAGE_KEY, serialized)
    
    // Also save just the address as "last used wallet" in localStorage
    localStorage.setItem(LAST_WALLET_KEY, auth.address)
  } catch (error) {
    console.error('[persistStoredWalletAuth] Error saving:', error)
  }
}

export function clearStoredWalletAuth(): void {
  sessionStorage.removeItem(WALLET_AUTH_STORAGE_KEY)
  // Don't clear LAST_WALLET_KEY - we want to remember which wallet was used
}

export function getLastUsedWalletAddress(): string | null {
  return localStorage.getItem(LAST_WALLET_KEY)
}

/**
 * Get wallet password from provided arg or session storage
 * @throws Error if password not available or session expired
 */
export function getWalletPassword(address: string, providedPassword?: string): string {
  // Try provided password first
  if (providedPassword) {
    return providedPassword
  }
  
  // Try session storage (with expiration check)
  const auth = loadStoredWalletAuth()
  if (auth?.address === address && auth.password) {
    return auth.password
  }
  
  throw new Error('Wallet password required. Please log in again.')
}

/**
 * Get session info for debugging/display purposes
 */
export function getSessionInfo(): { 
  isActive: boolean
  expiresAt?: string
  lastActivityAt?: string
  minutesUntilExpiry?: number
  minutesUntilInactivityTimeout?: number
} | null {
  const auth = loadStoredWalletAuth()
  if (!auth) {
    return { isActive: false }
  }
  
  const now = Date.now()
  const expiresAt = new Date(auth.expiresAt).getTime()
  const lastActivity = new Date(auth.lastActivityAt).getTime()
  
  return {
    isActive: true,
    expiresAt: auth.expiresAt,
    lastActivityAt: auth.lastActivityAt,
    minutesUntilExpiry: Math.floor((expiresAt - now) / (60 * 1000)),
    minutesUntilInactivityTimeout: Math.floor((lastActivity + INACTIVITY_TIMEOUT_MS - now) / (60 * 1000))
  }
}
