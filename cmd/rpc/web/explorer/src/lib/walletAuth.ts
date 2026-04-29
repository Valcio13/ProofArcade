export interface StoredWalletAuth {
  address: string
  nickname: string
  password: string
  loggedInAt: string
}

const WALLET_AUTH_STORAGE_KEY = 'canopy-2048-wallet-auth-v1'

export function loadStoredWalletAuth(): StoredWalletAuth | null {
  const raw = localStorage.getItem(WALLET_AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as StoredWalletAuth
    if (!parsed?.address || !parsed?.password) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function persistStoredWalletAuth(auth: StoredWalletAuth): void {
  localStorage.setItem(WALLET_AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredWalletAuth(): void {
  localStorage.removeItem(WALLET_AUTH_STORAGE_KEY)
}
