package main

import (
	"bytes"
	"flag"
	"fmt"
	"os"

	"github.com/canopy-network/canopy/fsm"
	"github.com/canopy-network/canopy/lib"
	"github.com/canopy-network/canopy/store"
)

var legacySegments = map[string]struct{}{
	"config":             {},
	"session":            {},
	"daily-attempt":      {},
	"daily-leaderboard":  {},
	"classic-leaderboard": {},
	"player-stats":       {},
}

func main() {
	dataDir := flag.String("data-dir", lib.DefaultConfig().DataDirPath, "Path to the Canopy data directory")
	flag.Parse()

	cfg := lib.DefaultConfig()
	cfg.DataDirPath = *dataDir

	logger := lib.NewDefaultLogger()
	st, err := store.New(cfg, nil, logger)
	if err != nil {
		fmt.Fprintf(os.Stderr, "open store failed: %s\n", err.Error())
		os.Exit(1)
	}
	defer func() {
		if closeErr := st.Close(); closeErr != nil {
			fmt.Fprintf(os.Stderr, "close store failed: %s\n", closeErr.Error())
		}
	}()

	prefix := fsm.ValidatorPrefix()
	it, err := st.Iterator(prefix)
	if err != nil {
		fmt.Fprintf(os.Stderr, "iterator failed: %s\n", err.Error())
		os.Exit(1)
	}
	defer it.Close()

	deleted := 0
	for ; it.Valid(); it.Next() {
		key := append([]byte(nil), it.Key()...)
		if !bytes.HasPrefix(key, prefix) {
			continue
		}
		if len(key) < len(prefix)+1 {
			continue
		}
		segmentLen := int(key[len(prefix)])
		start := len(prefix) + 1
		end := start + segmentLen
		if end > len(key) {
			continue
		}
		segment := string(key[start:end])
		if _, found := legacySegments[segment]; !found {
			continue
		}
		if err = st.Delete(key); err != nil {
			fmt.Fprintf(os.Stderr, "delete key failed %x: %s\n", key, err.Error())
			os.Exit(1)
		}
		fmt.Printf("deleted legacy 2048 key %x (%s)\n", key, segment)
		deleted++
	}

	if deleted == 0 {
		fmt.Println("no legacy 2048 keys found under validator prefix")
		return
	}

	if _, err = st.Commit(); err != nil {
		fmt.Fprintf(os.Stderr, "commit failed: %s\n", err.Error())
		os.Exit(1)
	}
	fmt.Printf("deleted %d legacy 2048 keys\n", deleted)
}
