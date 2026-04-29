package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/canopy-network/canopy/lib"
	"github.com/canopy-network/canopy/store"
)

func main() {
	dataDir := flag.String("data-dir", lib.DefaultConfig().DataDirPath, "Path to the Canopy data directory")
	target := flag.Uint64("target", 0, "Target height to rollback to")
	flag.Parse()

	if *target == 0 {
		fmt.Fprintln(os.Stderr, "target height must be greater than zero")
		os.Exit(1)
	}

	cfg := lib.DefaultConfig()
	cfg.DataDirPath = *dataDir

	logger := lib.NewDefaultLogger()
	stI, err := store.New(cfg, nil, logger)
	if err != nil {
		fmt.Fprintf(os.Stderr, "open store failed: %s\n", err.Error())
		os.Exit(1)
	}

	st, ok := stI.(*store.Store)
	if !ok {
		fmt.Fprintln(os.Stderr, "unexpected store type")
		os.Exit(1)
	}
	defer func() {
		if closeErr := st.Close(); closeErr != nil {
			fmt.Fprintf(os.Stderr, "close store failed: %s\n", closeErr.Error())
		}
	}()

	fmt.Printf("current height: %d\n", st.Version())
	if err = st.Rollback(*target); err != nil {
		fmt.Fprintf(os.Stderr, "rollback failed: %s\n", err.Error())
		os.Exit(1)
	}
	fmt.Printf("rollback complete: new height %d\n", st.Version())
}
