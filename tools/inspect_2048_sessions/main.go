package main

import (
	"encoding/hex"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/canopy-network/canopy/lib"
	"github.com/canopy-network/canopy/store"
)

var (
	gamePrefix    = []byte{18}
	sessionPrefix = lib.JoinLenPrefix(gamePrefix, []byte("session"))
)

func main() {
	dataDir := flag.String("data-dir", lib.DefaultConfig().DataDirPath, "Path to the Canopy data directory")
	gameIDHex := flag.String("game-id", "", "Optional hex game id filter")
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

	it, err := st.Iterator(sessionPrefix)
	if err != nil {
		fmt.Fprintf(os.Stderr, "iterator failed: %s\n", err.Error())
		os.Exit(1)
	}
	defer it.Close()

	found := 0
	for ; it.Valid(); it.Next() {
		key := append([]byte(nil), it.Key()...)
		value := append([]byte(nil), it.Value()...)
		gameID := extractGameID(key)
		if *gameIDHex != "" && !strings.EqualFold(hex.EncodeToString(gameID), *gameIDHex) {
			continue
		}
		fmt.Printf("session_key=%s game_id=%s value_len=%d\n", hex.EncodeToString(key), hex.EncodeToString(gameID), len(value))
		fmt.Printf("value_hex=%s\n", hex.EncodeToString(value))
		found++
	}

	if found == 0 {
		fmt.Println("no 2048 session keys found")
	}
}

func extractGameID(key []byte) []byte {
	if len(key) == 0 {
		return nil
	}
	lastLen := int(key[len(key)-33])
	if lastLen <= 0 || lastLen > len(key)-1 {
		return nil
	}
	return key[len(key)-lastLen:]
}
