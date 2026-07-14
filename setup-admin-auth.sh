#!/bin/bash
# Admin Pool Transfer Setup Script

set -e

echo "=========================================="
echo "Admin Pool Transfer Setup"
echo "=========================================="
echo ""

# Check if data directory is provided
if [ -z "$1" ]; then
    echo "Usage: ./setup-admin-auth.sh <data-directory>"
    echo "Example: ./setup-admin-auth.sh ~/.canopy"
    exit 1
fi

DATA_DIR="$1"
echo "Data Directory: $DATA_DIR"
echo ""

# Step 1: Generate admin key
echo "Step 1: Generating admin key..."
if [ -f "$DATA_DIR/admin.key" ]; then
    echo "  Admin key already exists. Loading existing key..."
fi

go run generate-admin-key.go "$DATA_DIR" > admin-key-output.txt
cat admin-key-output.txt
echo ""

# Extract admin address from output
ADMIN_ADDRESS=$(grep "Address (hex):" admin-key-output.txt | cut -d: -f2 | tr -d ' ')
echo "Admin Address: $ADMIN_ADDRESS"
echo ""

# Step 2: Create plugin config
echo "Step 2: Creating plugin config..."
PLUGIN_CONFIG="plugin/typescript/plugin_config.json"

if [ -f "$PLUGIN_CONFIG" ]; then
    echo "  Plugin config already exists. Updating admin address..."
    # Use jq to update if available, otherwise manual
    if command -v jq &> /dev/null; then
        jq ".proofArcadeAdmin = \"$ADMIN_ADDRESS\"" "$PLUGIN_CONFIG" > "${PLUGIN_CONFIG}.tmp"
        mv "${PLUGIN_CONFIG}.tmp" "$PLUGIN_CONFIG"
    else
        echo "  Warning: jq not found. Please manually update $PLUGIN_CONFIG"
        echo "  Set: \"proofArcadeAdmin\": \"$ADMIN_ADDRESS\""
    fi
else
    echo "  Creating new plugin config..."
    cat > "$PLUGIN_CONFIG" <<EOF
{
  "ChainId": 1,
  "proofArcadeAdmin": "$ADMIN_ADDRESS"
}
EOF
fi

echo "  Plugin config created/updated: $PLUGIN_CONFIG"
echo ""

# Step 3: Set environment variable
echo "Step 3: Setting environment variable..."
export CANOPY_PLUGIN_CONFIG_PATH="$(pwd)/$PLUGIN_CONFIG"
echo "export CANOPY_PLUGIN_CONFIG_PATH=\"$(pwd)/$PLUGIN_CONFIG\"" >> ~/.bashrc
echo "  Environment variable set in current session and ~/.bashrc"
echo ""

# Step 4: Build TypeScript plugin
echo "Step 4: Building TypeScript plugin..."
cd plugin/typescript
npm run build
cd ../..
echo "  TypeScript plugin built successfully"
echo ""

# Step 5: Build Go backend
echo "Step 5: Building Go backend..."
go build -o canopy.exe cmd/main/main.go
echo "  Go backend built successfully"
echo ""

# Summary
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Admin Address: $ADMIN_ADDRESS"
echo "Admin Key: $DATA_DIR/admin.key"
echo "Plugin Config: $PLUGIN_CONFIG"
echo ""
echo "Next Steps:"
echo "1. Start the backend: ./canopy.exe start"
echo "2. Check logs for: [ProofArcade] Admin address configured: $ADMIN_ADDRESS"
echo "3. Start the frontend: cd cmd/rpc/web/explorer && npm run dev"
echo "4. Navigate to: http://localhost:5173/admin/pool"
echo "5. Test a pool transfer"
echo ""
echo "Troubleshooting:"
echo "- If admin address not configured, check CANOPY_PLUGIN_CONFIG_PATH"
echo "- If transactions not in blocks, verify admin address matches key"
echo "- See ADMIN_POOL_TRANSFER_IMPLEMENTATION.md for full guide"
echo ""

# Clean up temp file
rm -f admin-key-output.txt
