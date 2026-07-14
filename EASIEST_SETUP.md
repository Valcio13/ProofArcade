# Easiest Setup - Just Build and Deploy

## Option 1: Skip Admin Config Entirely (Temporary)

For testing, you can skip the admin configuration and just hardcode your validator address directly in the plugin code.

### Edit `plugin/typescript/src/contract/contract.ts`

Find the constructor (around line 178) and add your validator address:

```typescript
constructor(config: Config, fsmConfig: any, plugin: Plugin, fsmId: Long) {
    this.Config = config;
    this.FSMConfig = fsmConfig;
    this.plugin = plugin;
    this.fsmId = fsmId;
    
    // TEMPORARY: Hardcode validator address for testing
    // TODO: Move to config file for production
    const HARDCODED_VALIDATOR_ADDRESS = "PUT_YOUR_VALIDATOR_ADDRESS_HERE_IN_HEX";
    
    const adminSource = config.proofArcadeAdmin || config.validatorAddress || HARDCODED_VALIDATOR_ADDRESS;
    
    if (adminSource) {
        this.proofArcadeAdminAddress = normalizeBytes(adminSource);
        console.log('[ProofArcade] Admin address configured:', 
            Buffer.from(this.proofArcadeAdminAddress).toString('hex'));
    }
}
```

Then:
1. Build plugin: `cd plugin/typescript && npm run build`
2. Build backend: `go build -o canopy.exe cmd/main/main.go`
3. Deploy

Done! No config files, no environment variables.

---

## Option 2: Get Validator Address from Backend at Runtime

Even simpler - have the backend tell the plugin what the validator address is during handshake.

### But for now, just use Option 1 or follow the simple guide below:

---

## Simplest Working Setup (3 Steps)

### Step 1: Find Your Validator Address

When your Canopy node starts, it logs something like:

```
Validator address: 0xabc123def456...
```

Copy that hex address.

### Step 2: Create One File

Create `plugin/typescript/plugin_config.json`:

```json
{
  "ChainId": 1,
  "validatorAddress": "PASTE_YOUR_VALIDATOR_ADDRESS_HERE"
}
```

### Step 3: Build and Deploy

```bash
# Build
cd plugin/typescript && npm run build && cd ../..
go build -o canopy.exe cmd/main/main.go

# Set env var (add to your startup script)
export CANOPY_PLUGIN_CONFIG_PATH=/path/to/plugin/typescript/plugin_config.json

# Deploy the built files
# - canopy.exe (backend)
# - plugin/typescript/dist/ (plugin)
# - plugin/typescript/plugin_config.json (config)
```

That's it!

---

## Can't Find Validator Address?

### Get it from the keystore:

```bash
# On your server
cd ~/.canopy
# Look for validator key file (val.key or similar)
# You need to extract the public key and derive the address
```

### Or create a simple Go tool to extract it:

Create `get-validator-address.go`:

```go
package main

import (
    "encoding/hex"
    "fmt"
    "os"
    "path/filepath"
    
    "github.com/canopy-network/canopy/lib"
    "github.com/canopy-network/canopy/lib/crypto"
)

func main() {
    if len(os.Args) < 2 {
        fmt.Println("Usage: go run get-validator-address.go <data-directory>")
        fmt.Println("Example: go run get-validator-address.go ~/.canopy")
        os.Exit(1)
    }
    
    dataDir := os.Args[1]
    keyPath := filepath.Join(dataDir, lib.ValKeyPath)
    
    privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(keyPath)
    if err != nil {
        fmt.Printf("Error loading validator key: %v\n", err)
        os.Exit(1)
    }
    
    address := privateKey.PublicKey().Address()
    fmt.Printf("Validator Address (hex): %s\n", hex.EncodeToString(address.Bytes()))
}
```

Then run:

```bash
go run get-validator-address.go ~/.canopy
```

It will print your validator address.

---

## Summary

**Absolute minimum**:
1. Get validator address
2. Put it in `plugin_config.json`
3. Build and deploy

**Backend automatically**:
- Uses existing validator key (no new key needed)
- Signs admin transactions with it
- Everything just works

**Plugin automatically**:
- Authorizes validator address
- Validates transactions from validator
- Balances update

No complex setup, no key management, just works! ✅
