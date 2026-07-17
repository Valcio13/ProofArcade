import {
  applyMove,
  canMove as sharedCanMove,
  createEmptyBoard as sharedCreateEmptyBoard,
  maxTile as sharedMaxTile,
  type Board,
} from '../../../../../../plugin/typescript/src/shared/game2048-board.js'
import { replayGame } from '../../../../../../plugin/typescript/src/shared/game2048-replay.js'
import { DeterministicRng } from '../../../../../../plugin/typescript/src/shared/game2048-rng.js'

export type GameMode = 'daily' | 'classic' | 'weekly-blitz'
export type PlayMode = GameMode | 'training'
export type StopReason = 'player_stopped' | 'no_moves' | 'max_moves' | 'timer_expired'
export type MoveDirection = 'up' | 'right' | 'down' | 'left'

export interface SessionSeed {
  initialSeed: string
}

export interface LocalSession {
  gameId: string
  mode: PlayMode
  seed: string
  utcDate: string
  maxMoves: number
  // Weekly Blitz specific fields
  weekId?: number
  expiresAtUnix?: number
}

export interface ReplayResult {
  board: number[]
  score: number
  maxTile: number
  moveCount: number
  endedReason: StopReason
  canContinue: boolean
}

export function createEmptyBoard(): number[] {
  return sharedCreateEmptyBoard()
}

export function createSeedFromText(text: string): string {
  let h1 = 0xdeadbeef ^ text.length
  let h2 = 0x41c6ce57 ^ text.length
  for (let i = 0; i < text.length; i += 1) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0')
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0')
  return `${part1}${part2}`
}

export function randomSeed(): string {
  const values = crypto.getRandomValues(new Uint32Array(2))
  return Array.from(values)
    .map(value => value.toString(16).padStart(8, '0'))
    .join('')
}

export function initializeBoard(seed: string): number[] {
  const board = sharedCreateEmptyBoard()
  const rng = new DeterministicRng(hexToBytes(seed))
  spawnTile(board, rng)
  spawnTile(board, rng)
  return board
}

export function replaySession(seed: string, moves: MoveDirection[], maxMoves: number, stopReason: StopReason): ReplayResult {
  const replay = replayGame({
    seed: hexToBytes(seed),
    moves: moves.map(moveDirectionToInt),
    maxMoves,
    stopReason: stopReasonToInt(stopReason),
  })

  return {
    board: [...replay.board],
    score: replay.score,
    maxTile: replay.maxTile,
    moveCount: replay.moveCount,
    endedReason: stopReasonFromInt(replay.endedReason),
    canContinue: sharedCanMove(replay.board),
  }
}

export function canMove(board: number[]): boolean {
  return sharedCanMove(board)
}

export function getUtcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function previewMove(board: number[], direction: MoveDirection): { board: number[]; changed: boolean; scoreDelta: number } {
  return applyMove(board as Board, moveDirectionToInt(direction))
}

export function maxTile(board: number[]): number {
  return sharedMaxTile(board)
}

function spawnTile(board: number[], rng: DeterministicRng): void {
  const emptyIndexes = board.flatMap((value, index) => (value === 0 ? [index] : []))
  if (emptyIndexes.length === 0) {
    return
  }
  const index = emptyIndexes[rng.nextInt(emptyIndexes.length)]
  board[index] = rng.nextInt(10) === 0 ? 4 : 2
}

function moveDirectionToInt(direction: MoveDirection): number {
  switch (direction) {
    case 'up':
      return 1
    case 'right':
      return 2
    case 'down':
      return 3
    case 'left':
      return 4
    default:
      return 0
  }
}

function stopReasonToInt(reason: StopReason): number {
  switch (reason) {
    case 'player_stopped':
      return 1
    case 'no_moves':
      return 2
    case 'max_moves':
      return 3
    case 'timer_expired':
      return 4
    default:
      return 1
  }
}

function stopReasonFromInt(reason: number): StopReason {
  switch (reason) {
    case 2:
      return 'no_moves'
    case 3:
      return 'max_moves'
    case 4:
      return 'timer_expired'
    default:
      return 'player_stopped'
  }
}

function hexToBytes(seed: string): Uint8Array {
  const normalized = seed.trim().toLowerCase()
  if (!normalized || normalized.length % 2 !== 0) {
    return new Uint8Array()
  }
  const bytes = new Uint8Array(normalized.length / 2)
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16)
  }
  return bytes
}
