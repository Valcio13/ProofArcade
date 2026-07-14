package main

import (
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"

	"github.com/canopy-network/canopy/lib/crypto"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run generate-admin-key.go <data-directory>")
		fmt.Println("Example: go run generate-admin-key.go ~/.canopy")
		os.Exit(1)
	}

	dataDir := os.Args[1]
	keyPath := filepath.Join(dataDir, "admin.key")

	// Check if key already exists
	if _, err := os.Stat(keyPath); err == nil {
		fmt.Printf("Admin key already exists at: %s\n", keyPath)
		fmt.Println("Loading existing key...")
		
		// Load and display the existing key
		privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(keyPath)
		if err != nil {
			fmt.Printf("Error loading existing key: %v\n", err)
			os.Exit(1)
		}
		
		address := privateKey.PublicKey().Address()
		fmt.Printf("\n=== Existing Admin Key ===\n")
		fmt.Printf("Key file: %s\n", keyPath)
		fmt.Printf("Address (hex): %s\n", hex.EncodeToString(address.Bytes()))
		fmt.Printf("\nUse this address in your plugin config:\n")
		fmt.Printf("\"proofArcadeAdmin\": \"%s\"\n", hex.EncodeToString(address.Bytes()))
		return
	}

	// Generate new BLS12-381 key pair
	fmt.Println("Generating new admin BLS12-381 key pair...")
	privateKey, err := crypto.NewBLS12381PrivateKey()
	if err != nil {
		fmt.Printf("Error generating key: %v\n", err)
		os.Exit(1)
	}

	// Get the public key and address
	publicKey := privateKey.PublicKey()
	address := publicKey.Address()

	// Save the private key to file
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		os.Exit(1)
	}

	if err := os.WriteFile(keyPath, privateKey.Bytes(), 0600); err != nil {
		fmt.Printf("Error writing key file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("\n=== Admin Key Generated Successfully ===\n")
	fmt.Printf("Key file: %s\n", keyPath)
	fmt.Printf("Address (hex): %s\n", hex.EncodeToString(address.Bytes()))
	fmt.Printf("\nUse this address in your plugin config:\n")
	fmt.Printf("\"proofArcadeAdmin\": \"%s\"\n", hex.EncodeToString(address.Bytes()))
	fmt.Printf("\nKeep this key secure! It authorizes all admin operations.\n")
}
