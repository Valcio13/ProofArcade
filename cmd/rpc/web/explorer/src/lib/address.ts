export function shortAddress(address: string): string {
  if (!address) {
    return 'No wallet'
  }
  if (address.length <= 18) {
    return address
  }
  return `${address.slice(0, 10)}...${address.slice(-6)}`
}
