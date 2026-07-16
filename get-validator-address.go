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
		fmt.Println()
		fmt.Println("This tool reads your validator key and displays the validator address.")
		fmt.Println("Use this address in plugin_config.json for admin operations.")
		os.Exit(1)
	}

	dataDir := os.Args[1]
	keyPath := filepath.Join(dataDir, lib.ValKeyPath)

	fmt.Printf("Reading validator key from: %s\n", keyPath)

	privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(keyPath)
	if err != nil {
		fmt.Printf("Error loading validator key: %v\n", err)
		fmt.Println()
		fmt.Println("Make sure:")
		fmt.Println("1. The data directory path is correct")
		fmt.Println("2. The validator key file exists")
		fmt.Println("3. You have permission to read the file")
		os.Exit(1)
	}

	publicKey := privateKey.PublicKey()
	address := publicKey.Address()
	addressHex := hex.EncodeToString(address.Bytes())

	fmt.Println()
	fmt.Println("=== Validator Information ===")
	fmt.Printf("Validator Address (hex): %s\n", addressHex)
	fmt.Println()
	fmt.Println("Use this in plugin_config.json:")
	fmt.Println("{")
	fmt.Println("  \"ChainId\": 1,")
	fmt.Printf("  \"validatorAddress\": \"%s\"\n", addressHex)
	fmt.Println("}")
	fmt.Println()
	fmt.Println("Or use this:")
	fmt.Println("{")
	fmt.Println("  \"ChainId\": 1,")
	fmt.Printf("  \"proofArcadeAdmin\": \"%s\"\n", addressHex)
	fmt.Println("}")
}
