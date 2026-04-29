import { sha256Bytes } from './game2048-hash.js';

export class DeterministicRng {
    private readonly seed: Uint8Array;
    private counter = 0n;
    private buffer = new Uint8Array();
    private offset = 0;

    constructor(seed: Uint8Array) {
        this.seed = new Uint8Array(seed);
    }

    nextByte(): number {
        if (this.offset >= this.buffer.length) {
            this.refill();
        }
        const value = this.buffer[this.offset] ?? 0;
        this.offset += 1;
        return value;
    }

    nextInt(maxExclusive: number): number {
        if (maxExclusive <= 0) {
            return 0;
        }
        return this.nextByte() % maxExclusive;
    }

    private refill(): void {
        const counterBytes = new Uint8Array(8);
        const view = new DataView(counterBytes.buffer);
        view.setBigUint64(0, this.counter, false);
        this.buffer = new Uint8Array(sha256Bytes(this.seed, counterBytes));
        this.offset = 0;
        this.counter += 1n;
    }
}
