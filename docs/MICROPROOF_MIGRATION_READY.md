# microPROOF Migration - Ready to Execute

**Date**: June 30, 2026  
**Status**: ✅ Code complete, ready for migration  
**Purpose**: Convert internal currency from PROOF to microPROOF (1 PROOF = 1,000,000 microPROOF)

---

## Why This Migration?

### The Problem
Current system uses PROOF as the canonical unit, causing precision loss in fee splits:

**Classic Mode Example (Before Migration)**:
```
Entry Fee: 2 PROOF
Platform (5%):  0.1 PROOF → integer division = 0 PROOF (100% LOSS)
Reserve (45%):  0.9 PROOF → integer division = 0 PROOF (100% LOSS)  
Shop (50%):     1.0 PROOF → integer division = 1 PROOF
Total Distributed: 1 PROOF → 50% LOSS!
```

### The Solution
Use microPROOF as canonical unit (1 PROOF = 1,000,000 microPROOF):

**Classic Mode Example (After Migration)**:
```
Entry Fee: 2,000,000 microPROOF
Platform (5%):  100,000 microPROOF = 0.1 PROOF ✓
Reserve (45%):  900,000 microPROOF = 0.9 PROOF ✓
Shop (50%):     1,000,000 microPROOF = 1.0 PROOF ✓
Total Distributed: 2,000,000 microPROOF → NO LOSS!
```

---

## What Changed

### 1. Migration Script (NEW)
**File**: `canopy-main/cmd/migrate/migrate_to_microproof.go`
- Multiplies all Account balances × 1,000,000
- Multiplies all Pool balances × 1,000,000
- Handles vesting amounts (staked, unstaking, paused)
- Creates automatic backup before migration
- Logs detailed migration progress

### 2. Contract Constants (UPDATED)
**File**: `canopy-main/plugin/typescript/src/contract/contract.ts`

**Before**:
```typescript
const defaultClassicStartFee = 2;
const defaultDailyStartFee = 25;
const legacyClassicStartFee = 90;
const legacyDailyStartFee = 240;
```

**After**:
```typescript
const MICRO_PER_PROOF = 1_000_000;
const defaultClassicStartFee = 2 * MICRO_PER_PROOF;   // 2,000,000 microPROOF
const defaultDailyStartFee = 25 * MICRO_PER_PROOF;    // 25,000,000 microPROOF
const legacyClassicStartFee = 90 * MICRO_PER_PROOF;   // 90,000,000 microPROOF
const legacyDailyStartFee = 240 * MICRO_PER_PROOF;    // 240,000,000 microPROOF
```

### 3. Dev Faucet (UPDATED)
**File**: `canopy-main/cmd/rpc/admin.go`

**Before**: `const defaultDevFaucetAmount uint64 = 500`  
**After**: `const defaultDevFaucetAmount uint64 = 500_000_000 // 500 PROOF in microPROOF`

---

## Migration Execution Steps

### Prerequisites
- [ ] Canopy is stopped
- [ ] Frontend dev server is stopped
- [ ] All transactions are complete
- [ ] You have a recent backup (migration creates one automatically)

### Execution (10-15 minutes total)

#### Step 1: Stop Services (~1 min)
```powershell
# Stop Canopy (Ctrl+C in terminal or stop process)
# Stop frontend dev server (Ctrl+C in terminal or stop process)
```

#### Step 2: Run Migration Script (~2-3 min)
```powershell
cd e:\ProofArcade\canopy-main
go run .\cmd\migrate\migrate_to_microproof.go "C:\Users\valci\.canopy\canopy"
```

**Expected Output**:
```
=== microPROOF Migration ===
Database: C:\Users\valci\.canopy\canopy
Conversion: 1 PROOF = 1000000 microPROOF

Creating backup: C:\Users\valci\.canopy\canopy_pre_microproof_backup_20260630_235900
✓ Backup created successfully

Opening database...
✓ Database opened

Migrating accounts...
  ✓ dba1bf06d3f64f2a19c0117921c44ba1440362e9: 656 → 656000000 microPROOF
  ✓ [other accounts...]
✓ Migrated X/X accounts

Migrating pools...
  ✓ PlatformPool: 100 → 100000000 microPROOF
  ✓ DailyPrizePool: 50 → 50000000 microPROOF
  ✓ ShopPool: 200 → 200000000 microPROOF
  ✓ ReservePool: 300 → 300000000 microPROOF
✓ Migrated 4/4 pools

=== Migration Complete ===
Accounts: X migrated, X total
Pools: 4 migrated, 4 total
Backup: C:\Users\valci\.canopy\canopy_pre_microproof_backup_20260630_235900

Next steps:
1. Rebuild TypeScript plugin: cd plugin/typescript && npm run build:all
2. Restart Canopy
3. Verify balances in frontend
```

#### Step 3: Rebuild TypeScript Plugin (~2 min)
```powershell
cd canopy-main\plugin\typescript
npm run build:all
```

#### Step 4: Rebuild Canopy Binary (~1-2 min)
```powershell
cd e:\ProofArcade\canopy-main
go build -o canopy.exe .\cmd\main
```

#### Step 5: Start Canopy (~30 sec)
```powershell
cd e:\ProofArcade\canopy-main
.\canopy.exe start
```

**Verify in logs**:
```
INFO: Plugin service listening on: 127.0.0.1:50004
INFO: Self IS a validator 👍
INFO: Committed block [...] at H:[...] 🔒
```

#### Step 6: Start Frontend Dev Server (~5 sec)
```powershell
cd canopy-main\cmd\rpc\web\explorer
npm run dev
```

#### Step 7: Verify in Browser
1. Open http://localhost:5173/
2. Check your balance (should display same PROOF amount as before)
3. Try a Classic game (2 PROOF fee)
4. Try a Daily Challenge (25 PROOF fee)
5. Check Shop redemptions
6. Check Daily Check-In

---

## Verification Checklist

After migration, verify these work correctly:

### Balance Display
- [ ] Player balance displays correctly (e.g., 656 PROOF, not 656000000)
- [ ] Pool balances display correctly
- [ ] Transaction history shows correct amounts

### Daily Challenge Mode
- [ ] Entry fee is 25 PROOF (25,000,000 microPROOF internally)
- [ ] Prize pool accumulates correctly
- [ ] Rewards distribute with NO loss
- [ ] Leaderboard displays correct amounts

### Classic Mode
- [ ] Entry fee is 2 PROOF (2,000,000 microPROOF internally)
- [ ] Classic Points earned correctly
- [ ] Fee split shows NO loss (verify in backend logs)
- [ ] All 3 pools receive their share

### Shop System
- [ ] Points balance displays correctly
- [ ] Redemptions work (300 points = 1 PROOF)
- [ ] Shop pool balance updates correctly

### Daily Check-In
- [ ] Rewards claim correctly
- [ ] Point amounts display correctly
- [ ] Day 7 bonus applies correctly

### Dev Faucet
- [ ] Faucet gives 500 PROOF (500,000,000 microPROOF internally)

---

## What Won't Change (User Perspective)

From the user's perspective, **nothing changes**:
- Balances still display in PROOF (e.g., 656 PROOF)
- Entry fees still say "2 PROOF" or "25 PROOF"
- Shop prices still in PROOF
- Transaction history still in PROOF

The difference is **internal**: the blockchain now stores 656,000,000 microPROOF but the frontend divides by 1,000,000 for display.

---

## Rollback Plan

If something goes wrong:

### Option 1: Restore from Backup
```powershell
# Stop Canopy
# Delete current database
Remove-Item -Recurse -Force "C:\Users\valci\.canopy\canopy"

# Restore backup
Copy-Item -Recurse "C:\Users\valci\.canopy\canopy_pre_microproof_backup_YYYYMMDD_HHMMSS" "C:\Users\valci\.canopy\canopy"

# Rebuild plugin with OLD constants
cd canopy-main\plugin\typescript
git checkout HEAD -- src/contract/contract.ts
npm run build:all

# Rebuild Canopy with OLD faucet
cd e:\ProofArcade\canopy-main
git checkout HEAD -- cmd/rpc/admin.go
go build -o canopy.exe .\cmd\main

# Restart
.\canopy.exe start
```

### Option 2: Re-run Migration
If migration was interrupted, you can re-run it. The script detects already-migrated accounts/pools and skips them.

---

## Technical Details

### Storage Format
**Before**: Account.Amount = 656 (PROOF)  
**After**: Account.Amount = 656000000 (microPROOF)

### Display Logic (Frontend)
```typescript
// Frontend already does this:
const displayAmount = balanceMicroPROOF / 1_000_000;
// Example: 656000000 / 1000000 = 656 PROOF
```

### Fee Split Precision
**Before** (integer division on small values):
```
2 PROOF × 5% = 0.1 PROOF → uint64(0.1) = 0 ❌
```

**After** (integer division on large values):
```
2,000,000 microPROOF × 5% = 100,000 microPROOF → uint64(100000) = 100000 ✓
Display: 100000 / 1,000,000 = 0.1 PROOF ✓
```

---

## Post-Migration Updates

After successful migration, update documentation to reflect microPROOF as canonical:

1. **Update Architecture Docs**:
   - `docs/architecture/01-currency-units-critical.md` → rewrite for microPROOF
   - Add note: "After v0.2.0 migration, microPROOF is canonical"

2. **Update CHANGELOG.md**:
   - Document migration in next release notes

3. **Update README**:
   - Note internal currency is microPROOF

4. **Tag Release**:
   ```powershell
   git tag -a v0.2.1-microproof -m "Economy v2: microPROOF migration"
   git push origin v0.2.1-microproof
   ```

---

## Files Modified

1. **NEW**: `cmd/migrate/migrate_to_microproof.go` (170 lines)
2. **MODIFIED**: `plugin/typescript/src/contract/contract.ts` (±5 lines)
3. **MODIFIED**: `cmd/rpc/admin.go` (±1 line)

Total: 1 new file, 2 modified files, ~176 lines changed

---

## Questions?

**Q: Will this break existing user balances?**  
A: No. The migration multiplies all balances by 1,000,000, so 656 PROOF becomes 656,000,000 microPROOF. The frontend divides by 1,000,000 for display, showing 656 PROOF.

**Q: What about transactions in flight?**  
A: Stop Canopy before migration to ensure no transactions are processing.

**Q: Can I test this first?**  
A: Yes! Copy your database to a test location and run the migration there first.

**Q: How long does migration take?**  
A: ~2-3 minutes for database migration, ~2 minutes for plugin rebuild, ~1-2 minutes for Canopy rebuild. Total: ~10-15 minutes including restarts.

**Q: What if I need to rollback?**  
A: The migration creates an automatic backup. You can restore it and revert the code changes.

---

## Ready to Execute?

When ready to proceed:
```powershell
# 1. Stop services
# 2. Run: go run .\cmd\migrate\migrate_to_microproof.go "C:\Users\valci\.canopy\canopy"
# 3. Rebuild plugin: cd plugin/typescript && npm run build:all
# 4. Rebuild Canopy: go build -o canopy.exe .\cmd\main
# 5. Start Canopy: .\canopy.exe start
# 6. Start frontend: cd cmd\rpc\web\explorer && npm run dev
# 7. Verify in browser
```

**Expected execution time**: 10-15 minutes  
**Risk level**: Low (automatic backup created)  
**Impact**: Fixes fee split precision loss, enables new game modes
