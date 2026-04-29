package main

import (
	"encoding/hex"
	"flag"
	"fmt"
	"os"

	"github.com/canopy-network/canopy/lib"
	"github.com/canopy-network/canopy/store"
)

func main() {
	dataDir := flag.String("data-dir", lib.DefaultConfig().DataDirPath, "Path to the Canopy data directory")
	keyHex := flag.String("key", "", "Hex-encoded state key to delete")
	flag.Parse()

	if *keyHex == "" {
		fmt.Fprintln(os.Stderr, "missing required -key")
		os.Exit(1)
	}

	key, err := hex.DecodeString(*keyHex)
	if err != nil {
		fmt.Fprintf(os.Stderr, "invalid key hex: %v\n", err)
		os.Exit(1)
	}

	cfg := lib.DefaultConfig()
	cfg.DataDirPath = *dataDir

	logger := lib.NewDefaultLogger()
	st, e := store.New(cfg, nil, logger)
	if e != nil {
		fmt.Fprintf(os.Stderr, "open store failed: %s\n", e.Error())
		os.Exit(1)
	}
	defer func() {
		if closeErr := st.Close(); closeErr != nil {
			fmt.Fprintf(os.Stderr, "close store failed: %s\n", closeErr.Error())
		}
	}()

	value, e := st.Get(key)
	if e != nil {
		fmt.Fprintf(os.Stderr, "read key failed: %s\n", e.Error())
		os.Exit(1)
	}
	if value == nil {
		fmt.Printf("key %x not found\n", key)
		return
	}

	if e = st.Delete(key); e != nil {
		fmt.Fprintf(os.Stderr, "delete key failed: %s\n", e.Error())
		os.Exit(1)
	}
	if _, e = st.Commit(); e != nil {
		fmt.Fprintf(os.Stderr, "commit failed: %s\n", e.Error())
		os.Exit(1)
	}

	fmt.Printf("deleted key %x\n", key)
}
