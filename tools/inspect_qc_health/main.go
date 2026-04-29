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
	count := flag.Uint64("count", 8, "How many recent heights to inspect")
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

	indexer, ok := any(st).(lib.RIndexerI)
	if !ok {
		fmt.Fprintln(os.Stderr, "store does not implement lib.RIndexerI")
		os.Exit(1)
	}

	latest := st.Version()
	if latest == 0 {
		fmt.Println("store is empty")
		return
	}

	start := uint64(1)
	if latest > *count {
		start = latest - *count + 1
	}

	fmt.Printf("latest height: %d\n", latest)
	for height := start; height <= latest; height++ {
		qc, qcErr := indexer.GetQCByHeight(height)
		if qcErr != nil {
			fmt.Printf("height %d: qc error: %s\n", height, qcErr.Error())
			continue
		}
		block, blockErr := indexer.GetBlockByHeight(height)
		if blockErr != nil {
			fmt.Printf("height %d: block error: %s\n", height, blockErr.Error())
			continue
		}
		lastQCResultsNil := false
		if block != nil && block.BlockHeader != nil && block.BlockHeader.LastQuorumCertificate != nil {
			lastQCResultsNil = block.BlockHeader.LastQuorumCertificate.Results == nil
		}
		fmt.Printf(
			"height %d: qc_nil=%t qc_results_nil=%t qc_results_hash_len=%d qc_proposer_key_len=%d qc_block_nil=%t block_last_qc_nil=%t block_last_qc_results_nil=%t block_last_qc_results_hash_len=%d txs=%d\n",
			height,
			qc == nil,
			qc == nil || qc.Results == nil,
			func() int {
				if qc == nil {
					return 0
				}
				return len(qc.ResultsHash)
			}(),
			func() int {
				if qc == nil {
					return 0
				}
				return len(qc.ProposerKey)
			}(),
			qc == nil || qc.Block == nil,
			block == nil || block.BlockHeader == nil || block.BlockHeader.LastQuorumCertificate == nil,
			lastQCResultsNil,
			func() int {
				if block == nil || block.BlockHeader == nil || block.BlockHeader.LastQuorumCertificate == nil {
					return 0
				}
				return len(block.BlockHeader.LastQuorumCertificate.ResultsHash)
			}(),
			len(block.Transactions),
		)
	}
}
