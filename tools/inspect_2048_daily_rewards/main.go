package main

import (
	"encoding/hex"
	"flag"
	"fmt"
	"os"

	"github.com/canopy-network/canopy/lib"
	"github.com/canopy-network/canopy/store"
)

var gamePrefix = []byte{18}

func main() {
	dataDir := flag.String("data-dir", lib.DefaultConfig().DataDirPath, "Path to the Canopy data directory")
	utcDate := flag.String("utc-date", "", "UTC date to inspect, e.g. 2026-04-27")
	addressHex := flag.String("address", "", "Optional hex address filter")
	flag.Parse()

	if *utcDate == "" {
		fmt.Fprintln(os.Stderr, "--utc-date is required")
		os.Exit(1)
	}

	var address []byte
	var err error
	if *addressHex != "" {
		address, err = hex.DecodeString(*addressHex)
		if err != nil {
			fmt.Fprintf(os.Stderr, "decode address failed: %v\n", err)
			os.Exit(1)
		}
	}

	cfg := lib.DefaultConfig()
	cfg.DataDirPath = *dataDir

	logger := lib.NewDefaultLogger()
	st, err := store.New(cfg, nil, logger)
	if err != nil {
		fmt.Fprintf(os.Stderr, "open store failed: %v\n", err)
		os.Exit(1)
	}
	defer func() {
		_ = st.Close()
	}()

	printPrefix(st, "daily-pool", lib.JoinLenPrefix(gamePrefix, []byte("daily-pool"), []byte(*utcDate)))
	printPrefix(st, "daily-leaderboard", lib.JoinLenPrefix(gamePrefix, []byte("daily-leaderboard"), []byte(*utcDate)))
	printPrefix(st, "daily-reward", lib.JoinLenPrefix(gamePrefix, []byte("daily-reward"), []byte(*utcDate)))
	if len(address) > 0 {
		printPrefix(st, "daily-reward-player", lib.JoinLenPrefix(gamePrefix, []byte("daily-reward-player"), address))
		printPrefix(st, "daily-claim", lib.JoinLenPrefix(gamePrefix, []byte("daily-claim"), []byte(*utcDate), address))
		printPrefix(st, "daily-submit", lib.JoinLenPrefix(gamePrefix, []byte("daily-submit"), []byte(*utcDate), address))
	}
}

func printPrefix(st lib.StoreI, label string, prefix []byte) {
	it, err := st.Iterator(prefix)
	if err != nil {
		fmt.Printf("[%s] iterator error: %v\n", label, err)
		return
	}
	defer it.Close()

	fmt.Printf("[%s]\n", label)
	found := false
	for ; it.Valid(); it.Next() {
		found = true
		key := append([]byte(nil), it.Key()...)
		value := append([]byte(nil), it.Value()...)
		fmt.Printf("key=%s\n", hex.EncodeToString(key))
		fmt.Printf("value=%s\n", hex.EncodeToString(value))
	}
	if !found {
		fmt.Println("(none)")
	}
}
