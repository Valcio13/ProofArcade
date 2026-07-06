# Validation Module

**Purpose**: Stateless validation of messages before transaction execution

**Owner**: Contract Layer (Pre-execution validation)

---

## Overview

This module contains all "CheckMessage*" validation functions that verify message structure and basic business rules WITHOUT touching blockchain state. These are the first gate-keepers that ensure messages are well-formed before they enter the execution pipeline.

---

## Responsibilities

### ✅ This Module Handles:
- **Message Structure Validation**: Required fields present and correct types
- **Address Format Validation**: 20-byte address format checks
- **Amount Validation**: Non-zero, positive amounts where required
- **Authorized Signers**: Return list of addresses that must sign the transaction

### ❌ This Module Does NOT Handle:
- **Stateful Validation**: Balance checks, game state verification, etc.
- **Business Logic**: Actual game rules, reward calculations, etc.
- **State Modifications**: No state reads or writes
- **Fee Validation**: Handled separately in CheckTx

---

## Validation Functions

### Message Validators

All validators follow this pattern:
```typescript
function checkMessage*(msg: any): {
    error?: PluginError;
    authorizedSigners?: Uint8Array[];
    recipient?: Uint8Array;
}
```

#### `checkMessageSend(msg)`
Validates token transfer messages.

**Checks**:
- Sender address (20 bytes)
- Recipient address (20 bytes)
- Amount (non-zero)

**Returns**: `{ authorizedSigners: [fromAddress], recipient: toAddress }`

---

#### `checkMessageStartDailyGame(msg)`
Validates daily game start messages.

**Checks**:
- Player address (20 bytes)
- UTC date string present
- Game ID non-empty

**Returns**: `{ authorizedSigners: [playerAddress] }`

---

#### `checkMessageStartClassicGame(msg)`
Validates classic game start messages.

**Checks**:
- Player address (20 bytes)
- Game ID non-empty

**Returns**: `{ authorizedSigners: [playerAddress] }`

---

#### `checkMessageSubmitGameResult(msg)`
Validates game result submission messages.

**Checks**:
- Player address (20 bytes)
- Game ID non-empty

**Returns**: `{ authorizedSigners: [playerAddress] }`

**Note**: Move validation happens during execution (stateful)

---

#### `checkMessageClaimDailyReward(msg)`
Validates daily reward claim messages.

**Checks**:
- Player address (20 bytes)
- UTC date string present

**Returns**: `{ authorizedSigners: [playerAddress] }`

---

#### `checkMessageRedeemClassicPoints(msg)`
Validates shop redemption messages.

**Checks**:
- Player address (20 bytes)
- Burn points amount (non-zero)

**Returns**: `{ authorizedSigners: [playerAddress] }`

---

#### `checkMessageClaimDailyLoginReward(msg)`
Validates check-in reward messages.

**Checks**:
- Player address (20 bytes)

**Returns**: `{ authorizedSigners: [playerAddress] }`

---

#### `checkMessageSetUsername(msg)`
Validates username update messages.

**Checks**:
- Player address (20 bytes)

**Returns**: `{ authorizedSigners: [playerAddress] }`

**Note**: Username format validation happens during execution

---

## Usage

### In Contract.ts

```typescript
import {
    checkMessageSend,
    checkMessageStartDailyGame,
    // ... other validators
} from './validation/index.js';

// In CheckTx or Contract class methods
const validation = checkMessageSend(msg);
if (validation.error) {
    return validation;
}
```

### Adding New Validators

When adding a new message type:

1. **Add validator function** to `message-checks.ts`:
```typescript
export function checkMessageNewFeature(msg: any): any {
    const playerAddress = normalizeBytes(msg?.playerAddress);
    if (playerAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    // Add your checks here
    return {
        authorizedSigners: [playerAddress]
    };
}
```

2. **Export from index.ts**:
```typescript
export { checkMessageNewFeature } from './message-checks.js';
```

3. **Use in CheckTx**:
```typescript
case 'MessageNewFeature':
    return checkMessageNewFeature(msg);
```

---

## Design Principles

### 1. Stateless Only
- No state reads or writes
- No database access
- Pure message validation

### 2. Fast Fail
- Return error immediately on first invalid field
- Don't validate further if early checks fail

### 3. Simple and Clear
- Each validator is 5-15 lines
- Easy to understand at a glance
- No complex logic

### 4. Consistent Return Shape
- Always return `{ error?, authorizedSigners?, recipient? }`
- Error OR success, never both

### 5. Type Safety
- Use TypeScript types where possible
- Runtime validation for message shapes

---

## Error Handling

### Common Errors

- **ErrInvalidAddress**: Address is not 20 bytes
- **ErrInvalidAmount**: Amount is zero or negative
- **ErrInvalidMessageCast**: Required field missing or wrong type

### Error Flow
```
Message → Validator → Error? → Return immediately
                  → Success? → Continue to stateful validation
```

---

## Testing

### Validator Testing Pattern

```typescript
test('checkMessageSend validates addresses', () => {
    const msg = {
        fromAddress: new Uint8Array(20),
        toAddress: new Uint8Array(20),
        amount: 100
    };
    const result = checkMessageSend(msg);
    assert.equal(result.error, undefined);
    assert.ok(result.authorizedSigners);
});

test('checkMessageSend rejects invalid sender', () => {
    const msg = {
        fromAddress: new Uint8Array(19), // Wrong length
        toAddress: new Uint8Array(20),
        amount: 100
    };
    const result = checkMessageSend(msg);
    assert.equal(result.error?.msg, 'invalid address');
});
```

---

## Module Structure

```
validation/
├── index.ts              # Barrel export
├── message-checks.ts     # All CheckMessage* functions
└── README.md            # This file
```

### Future Extensions (Optional)

If validation logic grows complex, consider splitting into:
- `validation/message-structure.ts` - Basic message validation
- `validation/business-rules.ts` - Complex business rule checks
- `validation/game-rules.ts` - Game-specific validation

For now, one file (`message-checks.ts`) is sufficient.

---

## Performance

- **Average execution**: <1ms per validator
- **No I/O**: Pure in-memory checks
- **No blocking**: Synchronous, no async operations
- **Negligible overhead**: Simple field checks only

---

## Dependencies

### Internal Dependencies
- `../error.js` - Error constructors
- `../utils/helpers.js` - normalizeBytes, toUint64

### External Dependencies
- `long` - Long integer handling

---

## Change Log

- **2026-07-06**: Initial extraction from contract.ts (Phase 2)
  - Extracted 8 CheckMessage* functions
  - Created validation module structure
  - Added comprehensive documentation

---

## Related Modules

- **contract.ts**: Uses these validators in CheckTx
- **utils/helpers.ts**: Provides normalizeBytes, toUint64
- **error.ts**: Defines error constructors

---

**Status**: ✅ Complete and Production-Ready
