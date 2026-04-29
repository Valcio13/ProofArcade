export type Board = number[];

export const BOARD_SIZE = 4;
export const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE;

export interface MoveOutcome {
    board: Board;
    changed: boolean;
    scoreDelta: number;
}

export function createEmptyBoard(): Board {
    return new Array<number>(BOARD_CELLS).fill(0);
}

export function cloneBoard(board: Board): Board {
    return [...board];
}

export function getEmptyIndexes(board: Board): number[] {
    const empty: number[] = [];
    for (let i = 0; i < board.length; i += 1) {
        if (board[i] === 0) {
            empty.push(i);
        }
    }
    return empty;
}

export function canMove(board: Board): boolean {
    if (getEmptyIndexes(board).length > 0) {
        return true;
    }

    for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
            const idx = row * BOARD_SIZE + col;
            const value = board[idx];
            if (col + 1 < BOARD_SIZE && board[idx + 1] === value) {
                return true;
            }
            if (row + 1 < BOARD_SIZE && board[idx + BOARD_SIZE] === value) {
                return true;
            }
        }
    }
    return false;
}

export function maxTile(board: Board): number {
    return board.reduce((max, value) => (value > max ? value : max), 0);
}

export function applyMove(board: Board, direction: number): MoveOutcome {
    switch (direction) {
        case 1:
            return moveUp(board);
        case 2:
            return moveRight(board);
        case 3:
            return moveDown(board);
        case 4:
            return moveLeft(board);
        default:
            return { board: cloneBoard(board), changed: false, scoreDelta: 0 };
    }
}

function moveLeft(board: Board): MoveOutcome {
    const next = createEmptyBoard();
    let changed = false;
    let scoreDelta = 0;

    for (let row = 0; row < BOARD_SIZE; row += 1) {
        const line = getRow(board, row);
        const merged = compressLine(line);
        setRow(next, row, merged.line);
        if (!arraysEqual(line, merged.line)) {
            changed = true;
        }
        scoreDelta += merged.scoreDelta;
    }

    return { board: next, changed, scoreDelta };
}

function moveRight(board: Board): MoveOutcome {
    const next = createEmptyBoard();
    let changed = false;
    let scoreDelta = 0;

    for (let row = 0; row < BOARD_SIZE; row += 1) {
        const line = getRow(board, row).reverse();
        const merged = compressLine(line);
        const finalLine = [...merged.line].reverse();
        setRow(next, row, finalLine);
        if (!arraysEqual(getRow(board, row), finalLine)) {
            changed = true;
        }
        scoreDelta += merged.scoreDelta;
    }

    return { board: next, changed, scoreDelta };
}

function moveUp(board: Board): MoveOutcome {
    const next = createEmptyBoard();
    let changed = false;
    let scoreDelta = 0;

    for (let col = 0; col < BOARD_SIZE; col += 1) {
        const line = getColumn(board, col);
        const merged = compressLine(line);
        setColumn(next, col, merged.line);
        if (!arraysEqual(line, merged.line)) {
            changed = true;
        }
        scoreDelta += merged.scoreDelta;
    }

    return { board: next, changed, scoreDelta };
}

function moveDown(board: Board): MoveOutcome {
    const next = createEmptyBoard();
    let changed = false;
    let scoreDelta = 0;

    for (let col = 0; col < BOARD_SIZE; col += 1) {
        const line = getColumn(board, col).reverse();
        const merged = compressLine(line);
        const finalLine = [...merged.line].reverse();
        setColumn(next, col, finalLine);
        if (!arraysEqual(getColumn(board, col), finalLine)) {
            changed = true;
        }
        scoreDelta += merged.scoreDelta;
    }

    return { board: next, changed, scoreDelta };
}

function compressLine(values: number[]): { line: number[]; scoreDelta: number } {
    const compact = values.filter((value) => value !== 0);
    const merged: number[] = [];
    let scoreDelta = 0;

    for (let i = 0; i < compact.length; i += 1) {
        const current = compact[i];
        const next = compact[i + 1];
        if (next !== undefined && next === current) {
            const mergedValue = current * 2;
            merged.push(mergedValue);
            scoreDelta += mergedValue;
            i += 1;
        } else {
            merged.push(current);
        }
    }

    while (merged.length < BOARD_SIZE) {
        merged.push(0);
    }

    return { line: merged, scoreDelta };
}

function getRow(board: Board, row: number): number[] {
    const start = row * BOARD_SIZE;
    return board.slice(start, start + BOARD_SIZE);
}

function setRow(board: Board, row: number, values: number[]): void {
    const start = row * BOARD_SIZE;
    for (let i = 0; i < BOARD_SIZE; i += 1) {
        board[start + i] = values[i] ?? 0;
    }
}

function getColumn(board: Board, col: number): number[] {
    const values: number[] = [];
    for (let row = 0; row < BOARD_SIZE; row += 1) {
        values.push(board[row * BOARD_SIZE + col]);
    }
    return values;
}

function setColumn(board: Board, col: number, values: number[]): void {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
        board[row * BOARD_SIZE + col] = values[row] ?? 0;
    }
}

function arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
