# Guide: Adding New Proto Messages to Canopy

This guide explains how to properly add new protobuf message types to the Canopy blockchain system.

## The Dual-Descriptor Challenge

Canopy uses **two separate descriptor systems** that must both be updated when adding new message types:

1. **TypeScript Plugin Descriptors** (auto-generated)
2. **Go Backend Descriptors** (manually constructed)

Forgetting either one causes "message not found" runtime errors.

## Step-by-Step Process

### 1. Add Message to Proto Files

Edit **both** proto files (keep them in sync):

```bash
# TypeScript plugin proto
plugin/typescript/proto/game2048.proto

# Go plugin proto  
plugin/go/proto/game2048.proto
```

Add your message definition:
```protobuf
message MessageYourFeature {
  bytes player_address = 1; // @gotags: json:"playerAddress"
  uint64 some_amount = 2;    // @gotags: json:"someAmount"
  string some_data = 3;
}
```

### 2. Regenerate TypeScript Descriptors

```bash
cd plugin/typescript
npm run build:descriptors  # Regenerates src/proto/descriptors.ts
npm run build              # Full rebuild
```

This auto-generates the base64-encoded descriptor that includes your new message.

### 3. Add to Go Backend Descriptors

Edit `cmd/rpc/game2048.go` and find the `game2048FileDescriptor()` function.

Add your message to the `MessageType` array:

```go
MessageType: []*descriptorpb.DescriptorProto{
    // ... existing messages ...
    
    messageDescriptor("MessageYourFeature", []*descriptorpb.FieldDescriptorProto{
        bytesFieldDescriptor("player_address", 1),
        uint64FieldDescriptor("some_amount", 2),
        stringFieldDescriptor("some_data", 3),
    }),
    
    // ... more messages ...
}
```

**Field descriptor helpers:**
- `bytesFieldDescriptor(name, number)`
- `uint64FieldDescriptor(name, number)`  
- `stringFieldDescriptor(name, number)`
- `boolFieldDescriptor(name, number)`
- `enumFieldDescriptor(name, number, typeName, repeated)`

### 4. Add Contract Handlers (TypeScript)

Edit `plugin/typescript/src/contract/contract.ts`:

```typescript
// Check handler - validates message before execution
function CheckMessageYourFeature(
  ctx: StateContext,
  msg: IMessageYourFeature
): MessageCheckResult {
  // Validation logic
  const authorizedSigners = [msg.playerAddress];
  return {
    authorizedSigners,
    error: undefined
  };
}

// Deliver handler - executes the message
function DeliverMessageYourFeature(
  ctx: StateContext,
  msg: IMessageYourFeature
): MessageDeliverResult {
  // Execution logic
  // Update state, emit events, etc.
  return {
    events: [],
    error: undefined
  };
}

// Register handlers
export const messageHandlers: MessageHandlers = {
  // ... existing handlers ...
  MessageYourFeature: {
    check: CheckMessageYourFeature,
    deliver: DeliverMessageYourFeature
  }
};
```

### 5. Add Backend RPC Endpoint (Optional)

If you need an HTTP endpoint to create this message:

#### a. Define request/response types in `cmd/rpc/types.go`:
```go
type yourFeatureRequest struct {
    addressRequest
    passwordRequest
    SomeAmount uint64 `json:"someAmount"`
    SomeData   string `json:"someData"`
}

type yourFeatureResponse struct {
    TxHash string `json:"txHash"`
    // ... other response fields ...
}
```

#### b. Add RPC handler in `cmd/rpc/admin.go` or `cmd/rpc/game2048.go`:
```go
func (s *Server) YourFeature(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
    req := new(yourFeatureRequest)
    if !unmarshal(w, r, req) {
        return
    }

    // Create message using game2048AnyMessage
    msg, err := game2048AnyMessage("MessageYourFeature", func(message protoreflect.Message) {
        setBytesField(message, "player_address", req.Address)
        setUint64Field(message, "some_amount", req.SomeAmount)
        setStringField(message, "some_data", req.SomeData)
    })
    if err != nil {
        write(w, err, http.StatusInternalServerError)
        return
    }

    // Create transaction, sign, submit...
    // (similar to other RPC handlers)
}
```

#### c. Register route in `cmd/rpc/routes.go`:
```go
router.POST("/v1/your-feature", s.YourFeature)
```

### 6. Rebuild Everything

```bash
# Rebuild TypeScript plugin (if not already done)
cd plugin/typescript
npm run build

# Rebuild Go backend
cd ../..
go build -o canopy.exe cmd/main/main.go
```

### 7. Restart Backend

```bash
# Stop existing process
# (Ctrl+C or Stop-Process)

# Start with new build
.\canopy.exe start
```

### 8. Test

Test the new message:
1. Call the RPC endpoint (if you added one)
2. Verify the transaction is created
3. Check that Check handler validates correctly
4. Verify Deliver handler executes successfully
5. Confirm state changes are applied

## Common Mistakes

### ❌ Only regenerating TypeScript descriptors
**Error**: "message YourFeature not found" in backend logs  
**Fix**: Add message to Go descriptor in `game2048.go`

### ❌ Only adding to Go descriptors
**Error**: Plugin fails to decode message or "message not found" in plugin logs  
**Fix**: Regenerate TypeScript descriptors with `npm run build:descriptors`

### ❌ Forgetting field descriptors
**Error**: "field xyz not found" or "cannot get field"  
**Fix**: Ensure all proto fields are in the Go descriptor

### ❌ Wrong field numbers
**Error**: Fields decode as wrong values or zero values  
**Fix**: Match field numbers exactly between proto definition and Go descriptor

### ❌ Not rebuilding backend
**Error**: Old backend still running without new descriptors  
**Fix**: Rebuild `canopy.exe` and restart the process

## Checklist

Before testing your new message:

- [ ] Added message to both `plugin/typescript/proto/game2048.proto` and `plugin/go/proto/game2048.proto`
- [ ] Ran `npm run build:descriptors` in `plugin/typescript/`
- [ ] Ran `npm run build` in `plugin/typescript/`
- [ ] Added message descriptor to `MessageType` array in `cmd/rpc/game2048.go`
- [ ] Added Check handler in `plugin/typescript/src/contract/contract.ts`
- [ ] Added Deliver handler in `plugin/typescript/src/contract/contract.ts`
- [ ] Registered handlers in `messageHandlers` export
- [ ] Added RPC endpoint (if needed)
- [ ] Rebuilt Go backend with `go build`
- [ ] Restarted backend process
- [ ] Tested message creation and execution

## Example: MessagePoolTransfer

Here's the complete example from the pool transfer feature:

### Proto Definition
```protobuf
message MessagePoolTransfer {
  uint64 from_pool_id = 1;
  uint64 to_pool_id = 2;
  uint64 amount = 3;
  bytes admin_address = 4;
}
```

### Go Descriptor
```go
messageDescriptor("MessagePoolTransfer", []*descriptorpb.FieldDescriptorProto{
    uint64FieldDescriptor("from_pool_id", 1),
    uint64FieldDescriptor("to_pool_id", 2),
    uint64FieldDescriptor("amount", 3),
    bytesFieldDescriptor("admin_address", 4),
}),
```

### TypeScript Handlers
```typescript
function CheckMessagePoolTransfer(
  ctx: StateContext,
  msg: IMessagePoolTransfer
): MessageCheckResult {
  // Only admin can sign pool transfers
  const authorizedSigners = [msg.adminAddress];
  return {
    authorizedSigners,
    error: undefined
  };
}

function DeliverMessagePoolTransfer(
  ctx: StateContext,
  msg: IMessagePoolTransfer
): MessageDeliverResult {
  const result = transferBetweenPools(
    ctx.state,
    msg.fromPoolId,
    msg.toPoolId,
    msg.amount
  );
  
  if (result.error) {
    return { events: [], error: result.error };
  }
  
  return {
    events: [result.event],
    error: undefined
  };
}

export const messageHandlers: MessageHandlers = {
  // ...
  MessagePoolTransfer: {
    check: CheckMessagePoolTransfer,
    deliver: DeliverMessagePoolTransfer
  }
};
```

### Backend RPC Handler
```go
func (s *Server) AdminPoolTransfer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
    // ... validation logic ...
    
    msg, err := game2048AnyMessage("MessagePoolTransfer", func(message protoreflect.Message) {
        setUint64Field(message, "from_pool_id", req.FromPoolId)
        setUint64Field(message, "to_pool_id", req.ToPoolId)
        setUint64Field(message, "amount", req.Amount)
        setBytesField(message, "admin_address", req.AdminAddress)
    })
    
    // ... transaction signing and submission ...
}
```

## Tips

1. **Keep proto files in sync** - Both TypeScript and Go proto files should be identical
2. **Field numbers matter** - Never change field numbers, always add new ones
3. **Test incrementally** - Test after each step rather than at the end
4. **Check backend logs** - Detailed error messages show exactly what's missing
5. **Use existing messages as templates** - Copy patterns from working messages

## Further Reading

- [Protocol Buffers Language Guide](https://protobuf.dev/programming-guides/proto3/)
- Canopy plugin documentation in `plugin/typescript/README.md`
- Message handler patterns in `plugin/typescript/src/contract/contract.ts`

---

**Summary**: Adding new proto messages requires updates to 2 descriptor systems (TypeScript auto-generated + Go manual), contract handlers, and optionally RPC endpoints. Follow all steps to avoid "message not found" errors.
