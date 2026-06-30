package main

import (
	"encoding/binary"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/canopy-network/canopy/lib"
	"github.com/canopy-network/canopy/lib/crypto"
	"github.com/canopy-network/canopy/store"
	"github.com/cockroachdb/pebble"
)

// MicroPROOF Migration Script
// Multiplies all Account and Pool balances by 1,000,000 to convert from PROOF to microPROOF
//
// CRITICAL: This is a one-way migration. Creates automatic backup before execution.
//
// Usage:
//   go run migrate_to_microproof.go <db_path>
//
// Example (Windows):
//   go run .\cmd\migrate\migrate_to_microproof.go "C:\Users\valci\.canopy\canopy"
//
// Example (Linux/macOS):
//   go run ./cmd/migrate/migrate_to_microproof.go ~/.canopy/canopy

const (
	MICRO_PER_PROOF = 1_000_000
	BackupSuffix    = "_pre_microproof_backup"
)

func main() {
	if len(os.Args) != 2 {
		log.Fatal("Usage: go run migrate_to_microproof.go <db_path>")
	}

	dbPath := os.Args[1]
	fmt.Printf("=== microPROOF Migration ===\n")
	fmt.Printf("Database: %s\n", dbPath)
	fmt.Printf("Conversion: 1 PROOF = %d microPROOF\n\n", MICRO_PER_PROOF)

	// 1. Verify database exists
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		log.Fatalf("ERROR: Database path does not exist: %s", dbPath)
	}

	// 2. Create backup
	backupPath := dbPath + BackupSuffix + "_" + time.Now().Format("20060102_150405")
	fmt.Printf("Creating backup: %s\n", backupPath)
	if err := copyDir(dbPath, backupPath); err != nil {
		log.Fatalf("ERROR: Failed to create backup: %v", err)
	}
	fmt.Printf("✓ Backup created successfully\n\n")

	// 3. Open database
	fmt.Printf("Opening database...\n")
	db, err := pebble.Open(dbPath, &pebble.Options{})
	if err != nil {
		log.Fatalf("ERROR: Failed to open database: %v", err)
	}
	defer db.Close()
	fmt.Printf("✓ Database opened\n\n")

	// 4. Migrate accounts
	accountsMigrated, accountsTotal := migrateAccounts(db)
	fmt.Printf("✓ Migrated %d/%d accounts\n\n", accountsMigrated, accountsTotal)

	// 5. Migrate pools
	poolsMigrated, poolsTotal := migratePools(db)
	fmt.Printf("✓ Migrated %d/%d pools\n\n", poolsMigrated, poolsTotal)

	// 6. Summary
	fmt.Printf("=== Migration Complete ===\n")
	fmt.Printf("Accounts: %d migrated, %d total\n", accountsMigrated, accountsTotal)
	fmt.Printf("Pools: %d migrated, %d total\n", poolsMigrated, poolsTotal)
	fmt.Printf("Backup: %s\n", backupPath)
	fmt.Printf("\nNext steps:\n")
	fmt.Printf("1. Rebuild TypeScript plugin: cd plugin/typescript && npm run build:all\n")
	fmt.Printf("2. Restart Canopy\n")
	fmt.Printf("3. Verify balances in frontend\n")
}

func migrateAccounts(db *pebble.DB) (migrated, total int) {
	fmt.Printf("Migrating accounts...\n")

	iter, err := db.NewIter(&pebble.IterOptions{
		LowerBound: []byte{store.AccountPrefix},
		UpperBound: []byte{store.AccountPrefix + 1},
	})
	if err != nil {
		log.Fatalf("ERROR: Failed to create accounts iterator: %v", err)
	}
	defer iter.Close()

	batch := db.NewBatch()
	defer batch.Close()

	for iter.First(); iter.Valid(); iter.Next() {
		total++
		key := iter.Key()
		value := iter.Value()

		// Decode account
		account := &lib.Account{}
		if err := lib.Unmarshal(value, account); err != nil {
			log.Printf("WARNING: Failed to unmarshal account at key %x: %v", key, err)
			continue
		}

		// Check if already migrated (balance >= 1 million suggests already in microPROOF)
		if account.Amount >= 1_000_000 {
			log.Printf("  Account %s appears already migrated (balance: %d), skipping", 
				crypto.NewAddressFromBytes(account.Address), account.Amount)
			continue
		}

		// Multiply balance by 1,000,000
		oldAmount := account.Amount
		account.Amount *= MICRO_PER_PROOF

		// Also migrate vesting amounts if present
		if account.AmountStaked != 0 {
			account.AmountStaked *= MICRO_PER_PROOF
		}
		if account.AmountUnstaking != 0 {
			account.AmountUnstaking *= MICRO_PER_PROOF
		}
		if account.AmountPaused != 0 {
			account.AmountPaused *= MICRO_PER_PROOF
		}

		// Serialize updated account
		newValue, err := lib.Marshal(account)
		if err != nil {
			log.Printf("WARNING: Failed to marshal account: %v", err)
			continue
		}

		// Write to batch
		if err := batch.Set(key, newValue, pebble.Sync); err != nil {
			log.Printf("WARNING: Failed to write account: %v", err)
			continue
		}

		migrated++
		if migrated%100 == 0 {
			fmt.Printf("  Processed %d accounts...\n", migrated)
		}

		// Log first few migrations for verification
		if migrated <= 5 {
			fmt.Printf("  ✓ %s: %d → %d microPROOF\n", 
				crypto.NewAddressFromBytes(account.Address), oldAmount, account.Amount)
		}
	}

	// Commit batch
	if err := batch.Commit(pebble.Sync); err != nil {
		log.Fatalf("ERROR: Failed to commit account migrations: %v", err)
	}

	return migrated, total
}

func migratePools(db *pebble.DB) (migrated, total int) {
	fmt.Printf("Migrating pools...\n")

	iter, err := db.NewIter(&pebble.IterOptions{
		LowerBound: []byte{store.PoolPrefix},
		UpperBound: []byte{store.PoolPrefix + 1},
	})
	if err != nil {
		log.Fatalf("ERROR: Failed to create pools iterator: %v", err)
	}
	defer iter.Close()

	batch := db.NewBatch()
	defer batch.Close()

	for iter.First(); iter.Valid(); iter.Next() {
		total++
		key := iter.Key()
		value := iter.Value()

		// Decode pool
		pool := &lib.Pool{}
		if err := lib.Unmarshal(value, pool); err != nil {
			log.Printf("WARNING: Failed to unmarshal pool at key %x: %v", key, err)
			continue
		}

		// Check if already migrated
		if pool.Amount >= 1_000_000 {
			log.Printf("  Pool %x appears already migrated (amount: %d), skipping", key, pool.Amount)
			continue
		}

		// Multiply amount by 1,000,000
		oldAmount := pool.Amount
		pool.Amount *= MICRO_PER_PROOF

		// Serialize updated pool
		newValue, err := lib.Marshal(pool)
		if err != nil {
			log.Printf("WARNING: Failed to marshal pool: %v", err)
			continue
		}

		// Write to batch
		if err := batch.Set(key, newValue, pebble.Sync); err != nil {
			log.Printf("WARNING: Failed to write pool: %v", err)
			continue
		}

		migrated++

		// Log migrations for verification
		poolName := getPoolName(key)
		fmt.Printf("  ✓ %s: %d → %d microPROOF\n", poolName, oldAmount, pool.Amount)
	}

	// Commit batch
	if err := batch.Commit(pebble.Sync); err != nil {
		log.Fatalf("ERROR: Failed to commit pool migrations: %v", err)
	}

	return migrated, total
}

// Helper to identify known pools by their keys
func getPoolName(key []byte) string {
	if len(key) < 9 {
		return fmt.Sprintf("Pool_%x", key)
	}

	// Pool keys are: [PoolPrefix][8-byte-id]
	poolID := binary.BigEndian.Uint64(key[1:9])
	
	// Known pool IDs from lib/pools.go
	switch poolID {
	case 0: // PlatformPool
		return "PlatformPool"
	case 1: // DailyPrizePool
		return "DailyPrizePool"
	case 2: // ShopPool
		return "ShopPool"
	case 3: // ReservePool
		return "ReservePool"
	default:
		return fmt.Sprintf("Pool_%d", poolID)
	}
}

// copyDir recursively copies a directory
func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Get relative path
		relPath, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		dstPath := filepath.Join(dst, relPath)

		// Create directory or copy file
		if info.IsDir() {
			return os.MkdirAll(dstPath, info.Mode())
		}

		// Copy file
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(dstPath, data, info.Mode())
	})
}
