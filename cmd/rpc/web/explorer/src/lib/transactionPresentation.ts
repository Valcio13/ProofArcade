export interface ExplorerDetailRow {
  label: string
  value: string
}

const GAME_TYPE_LABELS: Record<string, string> = {
  startdailygame: '2048 Start Daily',
  startclassicgame: '2048 Start Classic',
  submitgameresult: '2048 Submit Score',
}

export function normalizeTxType(type?: string | null): string {
  return (type || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function is2048Tx(type?: string | null): boolean {
  const normalized = normalizeTxType(type)
  return normalized === 'startdailygame'
    || normalized === 'startclassicgame'
    || normalized === 'submitgameresult'
    || normalized === '2048startdaily'
    || normalized === '2048startclassic'
    || normalized === '2048submitscore'
}

export function formatTxTypeLabel(type?: string | null): string {
  const normalized = normalizeTxType(type)
  if (!normalized) {
    return 'send'
  }
  return GAME_TYPE_LABELS[normalized] || type || 'send'
}

export function getTxTypeIcon(type?: string | null): string {
  const normalized = normalizeTxType(type)
  switch (normalized) {
    case 'startdailygame':
    case '2048startdaily':
      return 'fa-solid fa-calendar-day'
    case 'startclassicgame':
    case '2048startclassic':
      return 'fa-solid fa-gamepad'
    case 'submitgameresult':
    case '2048submitscore':
      return 'fa-solid fa-trophy'
    case 'send':
    case 'transfer':
      return 'bi bi-send'
    case 'stake':
    case 'edit-stake':
    case 'editstake':
      return 'bi bi-file-lock2'
    case 'unstake':
      return 'fa-solid fa-unlock'
    case 'swap':
      return 'bi bi-arrow-left-right'
    case 'governance':
      return 'fa-solid fa-vote-yea'
    case 'delegate':
      return 'bi bi-file-lock2'
    case 'undelegate':
      return 'fa-solid fa-user-times'
    case 'certificateresults':
    case 'certificate':
      return 'bi bi-c-circle-fill'
    default:
      return 'fa-solid fa-circle'
  }
}

export function getTxTypeColor(type?: string | null): string {
  const normalized = normalizeTxType(type)
  switch (normalized) {
    case 'startdailygame':
    case '2048startdaily':
      return 'bg-[#c95f38]/20 text-[#ffcfbf]'
    case 'startclassicgame':
    case '2048startclassic':
      return 'bg-[#53a6ff]/20 text-[#9fd0ff]'
    case 'submitgameresult':
    case '2048submitscore':
      return 'bg-[#f0cf52]/20 text-[#f6df84]'
    case 'transfer':
    case 'send':
      return 'bg-blue-500/20 text-blue-400'
    case 'stake':
      return 'bg-green-500/20 text-green-400'
    case 'unstake':
      return 'bg-orange-500/20 text-orange-400'
    case 'swap':
      return 'bg-purple-500/20 text-purple-400'
    case 'governance':
      return 'bg-indigo-500/20 text-indigo-400'
    case 'delegate':
      return 'bg-cyan-500/20 text-cyan-400'
    case 'undelegate':
      return 'bg-pink-500/20 text-pink-400'
    case 'certificateresults':
      return 'bg-green-500/20 text-primary'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

export function getExplorerFromAddress(tx: any): string {
  return tx?.sender || tx?.from || 'N/A'
}

export function getExplorerToAddress(tx: any): string {
  if (tx?.recipient || tx?.to) {
    return tx.recipient || tx.to
  }

  // Check for pool withdrawal destination address
  const msg = tx?.transaction?.msg
  if (msg?.messagePoolWithdrawal?.toAddress) {
    return msg.messagePoolWithdrawal.toAddress
  }

  // Also check if msg itself is the messagePoolWithdrawal
  if (msg?.toAddress && (tx?.messageType === 'poolWithdrawal' || tx?.transaction?.type === 'poolWithdrawal')) {
    return msg.toAddress
  }

  const type = normalizeTxType(tx?.transaction?.type || tx?.messageType || tx?.type)
  if (is2048Tx(type)) {
    return getExplorerFromAddress(tx)
  }

  return 'N/A'
}

export function getExplorerAmountMicro(tx: any): number {
  if (!tx?.transaction?.msg) {
    return Number(tx?.amount || tx?.value || 0)
  }

  const msg = tx.transaction.msg
  if (msg.messageSend?.amount !== undefined) return Number(msg.messageSend.amount)
  if (msg.messageStake?.amount !== undefined) return Number(msg.messageStake.amount)
  if (msg.messageEditStake?.amount !== undefined) return Number(msg.messageEditStake.amount)
  if (msg.messageDAOTransfer?.amount !== undefined) return Number(msg.messageDAOTransfer.amount)
  if (msg.messageSubsidy?.amount !== undefined) return Number(msg.messageSubsidy.amount)
  if (msg.messageCreateOrder?.amountForSale !== undefined) return Number(msg.messageCreateOrder.amountForSale)
  if (msg.messageEditOrder?.amountForSale !== undefined) return Number(msg.messageEditOrder.amountForSale)
  if (msg.amount !== undefined) return Number(msg.amount)
  return Number(tx?.amount || tx?.value || 0)
}

export function getExplorerDecodedTopics(tx: any): string {
  const type = normalizeTxType(tx?.transaction?.type || tx?.messageType || tx?.type)
  if (type === 'startdailygame') return 'startDailyGame(player, gameId)'
  if (type === 'startclassicgame') return 'startClassicGame(player, gameId)'
  if (type === 'submitgameresult') return 'submitGameResult(player, gameId, score, maxTile, stopReason, moves)'
  return `${tx?.messageType || tx?.type || tx?.transaction?.type || 'send'}(address,address,uint256)`
}

export function getExplorerDecodedData(tx: any): string {
  const type = normalizeTxType(tx?.transaction?.type || tx?.messageType || tx?.type)
  const msg = tx?.transaction?.msg || {}
  if (type === 'startdailygame') return `Daily game • ${msg.gameId || 'unknown game'}`
  if (type === 'startclassicgame') return `Classic game • ${msg.gameId || 'unknown game'}`
  if (type === 'submitgameresult') {
    const score = msg.declaredScore ?? '0'
    const tile = msg.declaredMaxTile ?? '0'
    const moves = Array.isArray(msg.moves) ? msg.moves.length : 0
    return `Score ${score} • Tile ${tile} • ${moves} moves`
  }
  if (type === 'pooltransfer') {
    const amount = msg.amount || '0'
    const amountCNPY = (parseInt(amount, 10) / 1_000_000).toFixed(2)
    return `${amountCNPY} CNPY transferred`
  }
  return '0 PROOF'
}

export function getExplorerDetailRows(tx: any): ExplorerDetailRow[] {
  const type = normalizeTxType(tx?.transaction?.type || tx?.messageType || tx?.type)
  const msg = tx?.transaction?.msg || {}

  if (type === 'startdailygame') {
    return [
      { label: 'Action', value: '2048 Start Daily' },
      { label: 'Player', value: getExplorerFromAddress(tx) },
      { label: 'Game ID', value: msg.gameId || 'N/A' },
    ]
  }

  if (type === 'startclassicgame') {
    return [
      { label: 'Action', value: '2048 Start Classic' },
      { label: 'Player', value: getExplorerFromAddress(tx) },
      { label: 'Game ID', value: msg.gameId || 'N/A' },
    ]
  }

  if (type === 'submitgameresult') {
    return [
      { label: 'Action', value: '2048 Submit Score' },
      { label: 'Player', value: getExplorerFromAddress(tx) },
      { label: 'Game ID', value: msg.gameId || 'N/A' },
      { label: 'Declared Score', value: String(msg.declaredScore ?? '0') },
      { label: 'Declared Max Tile', value: String(msg.declaredMaxTile ?? '0') },
      { label: 'Stop Reason', value: formatStopReason(msg.stopReason) },
      { label: 'Move Count', value: String(Array.isArray(msg.moves) ? msg.moves.length : 0) },
    ]
  }

  if (type === 'pooltransfer') {
    const PoolNames: Record<number, string> = {
      131071: 'DAO Pool',
      131072: 'Platform Pool',
      131073: 'Reserve Pool',
      131074: 'Shop Pool',
      131075: 'Daily Reward Pool',
      131076: 'Monthly Reward Pool',
    }
    const fromPoolId = parseInt(msg.fromPoolId || '0', 10)
    const toPoolId = parseInt(msg.toPoolId || '0', 10)
    const amount = msg.amount || '0'
    const amountCNPY = (parseInt(amount, 10) / 1_000_000).toFixed(2)
    
    return [
      { label: 'Action', value: 'Pool Transfer' },
      { label: 'Admin', value: getExplorerFromAddress(tx) },
      { label: 'From Pool', value: PoolNames[fromPoolId] || `Pool ${fromPoolId}` },
      { label: 'To Pool', value: PoolNames[toPoolId] || `Pool ${toPoolId}` },
      { label: 'Amount', value: `${amountCNPY} CNPY` },
    ]
  }

  return []
}

export function isGameLikeAction(tx: any): boolean {
  return is2048Tx(tx?.transaction?.type || tx?.messageType || tx?.type)
}

function formatStopReason(stopReason?: string): string {
  if (!stopReason) {
    return 'N/A'
  }
  return stopReason
    .replace(/^STOP_REASON_/, '')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
