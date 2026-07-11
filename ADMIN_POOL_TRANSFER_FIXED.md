# Admin Pool Transfer - Descriptor Issue Fixed

## Issue Summary
Backend was throwing runtime error: `"invalid plugin schema: message MessagePoolTransfer not found"`

## Root Cause
The `MessagePoolTransfer` message was added to the proto files and TypeScript contract handlers, but the **file descriptor protos** were not regenerated. The `descriptors.ts` file contains base64-encoded proto descriptors that the backend uses at runtime to validate and decode messages. Without regenerating these descriptors, the backend couldn't find the new message type.

## Solution
Regenerated the TypeScript plugin file descriptors to include MessagePoolTransfer:

```bash
# In plugin/typescript/ directory
npm run build:descriptors
npm run build
```

Then rebuilt the Go backend:

```bash
# In canopy-main/ root
go build -o canopy.exe cmd/main/main.go
```

## Technical Details

### What are File Descriptors?
File descriptors are protobuf's metadata about message structures. They're generated from `.proto` files and contain:
- Message names and field definitions
- Enum values
- Type URLs for Any messages
- Dependencies between proto files

### Why They're Needed
The Canopy plugin system uses dynamic message handling via `google.protobuf.Any`. At runtime, the backend needs to:
1. Look up message types by name (e.g., "MessagePoolTransfer")
2. Decode the binary protobuf data into the correct structure
3. Validate message fields

Without the descriptor, step #1 fails with "message not found".

### The Descriptor Generation Process
1. **generate-descriptors.cjs** script reads all `.proto` files
2. Uses protobufjs to parse and extract message definitions
3. Encodes each proto file's descriptor as base64
4. Writes to `src/proto/descriptors.ts`
5. This file is imported by `contract.ts` and included in plugin config

## Files Changed
- `plugin/typescript/src/proto/descriptors.ts` - Regenerated with all 23 game2048.proto messages
- `plugin/typescript/dist/proto/descriptors.js` - Compiled output
- `canopy.exe` - Rebuilt with updated plugin

## Verification Steps
1. ✅ Descriptors regenerated (23 messages in game2048.proto)
2. ✅ TypeScript plugin rebuilt successfully
3. ✅ Go backend rebuilt successfully
4. ⏳ Runtime test: Restart backend and test pool transfer endpoint

## Next Steps
1. Restart the backend: `.\canopy.exe start`
2. Test pool transfer from frontend
3. Verify transaction is created and submitted successfully
4. Push all commits to remote

## Related Files
- `plugin/typescript/proto/game2048.proto` - Proto definition with MessagePoolTransfer
- `plugin/typescript/src/contract/contract.ts` - Contract handlers for pool transfer
- `cmd/rpc/admin.go` - Backend AdminPoolTransfer function
- `cmd/rpc/web/explorer/src/pages/AdminPoolManagement.tsx` - Frontend UI

## Lesson Learned
**Always regenerate descriptors after adding new message types to proto files!**

The build process is:
1. Modify `.proto` file
2. Run `npm run build:proto` (generates TypeScript types)
3. Run `npm run build:descriptors` (generates runtime descriptors) ⚠️ CRITICAL
4. Run `npm run build` (compiles TypeScript)
5. Rebuild Go backend to pick up new plugin

The full `npm run build` command does all three steps automatically.
