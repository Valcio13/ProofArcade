# Zero-Config Solution - Fully Automatic

## The Problem

You don't want to manually set up config files or environment variables. You just want to build, deploy, and have it work.

## The Solution

**Use the validator address automatically from the FSM config that's already passed to the plugin.**

The FSM already sends its configuration to the plugin during initialization. We can extract the validator address from there.

## Implementation

Update the TypeScript plugin to automatically extract the validator address from FSM config:

### Option 1: Extract from FSM during handshake

The FSM passes its config to the plugin during the handshake. The validator address should be accessible there. We just need to extract it.

### Option 2 (Even Simpler): Accept ANY signer for pool transfers

For development, just accept any signer and log it. This is the absolute simplest:

```typescript
CheckMessagePoolTransfer(msg: any): any {
    // DEVELOPMENT MODE: Accept any signer
    // TODO: Add proper authorization for production
    console.log('[ProofArcade] WARNING: Pool transfer authorization is open (development mode)');
    return { authorizedSigners: [] };  // Empty = accept any signer from FSM perspective
}
```

But wait - that's what we started with and it didn't work!

### Option 3 (Correct Simple Solution): Return validator address from backend's AdminAddress header

The backend already knows the validator address because it loads the validator key. We can send it in the transaction message itself!

Look at the `AdminPoolTransfer` function - it already includes `adminAddress` in the message. The Check handler can extract it from there and return it as an authorized signer!

## The Answer

**We already have the solution!** The admin address is IN the transaction message. Just extract it in the Check handler:

```typescript
CheckMessagePoolTransfer(msg: any): any {
    // Extract admin address from the message itself
    const adminAddress = normalizeBytes(msg?.adminAddress);
    
    if (!adminAddress || adminAddress.length === 0) {
        return { error: { code: 400, msg: 'Admin address not provided in message' } };
    }
    
    // Return the admin address from the message as the authorized signer
    // FSM will verify the transaction was signed by this address
    return { authorizedSigners: [adminAddress] };
}
```

**This means**:
1. Backend loads validator key
2. Backend gets validator address from the key
3. Backend puts validator address IN the transaction message
4. Plugin extracts admin address FROM the message
5. Plugin returns it as authorized signer
6. FSM validates signature matches
7. Done!

**No config files needed!** ✅

---

## Implementation

The backend already does step 1-3. We just need to update the Check handler to do steps 4-5.

Let me check if the current Check handler already does this...
