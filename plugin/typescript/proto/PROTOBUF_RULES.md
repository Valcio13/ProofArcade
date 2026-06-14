# Protobuf Schema Modification Rules

## 🚨 CRITICAL: Breaking Changes Prevention

### Golden Rule
**ALWAYS add new fields at the END of a message, NEVER in the middle.**

### Why This Matters
Protobuf uses field numbers for serialization. Changing field numbers breaks compatibility with existing blockchain data, causing data corruption.

---

## ✅ SAFE Operations (Backward & Forward Compatible)

### 1. Adding New Fields at the END
```protobuf
message PlayerStats {
  bytes player_address = 1;
  uint64 daily_games_started = 2;
  uint64 classic_games_started = 3;
  // ... existing fields 4-15 ...
  string new_field = 16;  // ✅ SAFE - Added at end
  uint64 another_field = 17;  // ✅ SAFE - Added at end
}
```

### 2. Marking Fields as Reserved
```protobuf
message Example {
  reserved 5, 8, 10;  // ✅ SAFE - Prevents reuse of old field numbers
  reserved "old_field_name";  // ✅ SAFE - Prevents name collision
  
  bytes field1 = 1;
  uint64 field2 = 2;
  // field 5 was deleted, now reserved
  string field3 = 3;
}
```

### 3. Adding New Message Types
```protobuf
// ✅ SAFE - New message doesn't affect existing ones
message NewFeatureData {
  bytes id = 1;
  string name = 2;
}
```

### 4. Adding New Enum Values
```protobuf
enum GameMode {
  GAME_MODE_UNSPECIFIED = 0;
  GAME_MODE_DAILY = 1;
  GAME_MODE_CLASSIC = 2;
  GAME_MODE_TOURNAMENT = 3;  // ✅ SAFE - Added at end
}
```

---

## ❌ DANGEROUS Operations (Breaking Changes)

### 1. Inserting Fields in the Middle
```protobuf
// ❌ DANGEROUS - Shifts all subsequent field numbers!
message PlayerStats {
  bytes player_address = 1;
  string new_field = 2;  // ❌ INSERTED
  uint64 daily_games_started = 3;  // Was 2, now 3 - BREAKS OLD DATA!
  uint64 classic_games_started = 4;  // Was 3, now 4 - BREAKS OLD DATA!
}
```

### 2. Changing Field Numbers
```protobuf
// ❌ DANGEROUS - Changes data interpretation!
message Example {
  bytes field1 = 1;
  uint64 field2 = 3;  // Was 2, now 3 - BREAKS OLD DATA!
}
```

### 3. Changing Field Types
```protobuf
// ❌ DANGEROUS - Type mismatch causes decoding errors!
message Example {
  bytes field1 = 1;
  string field2 = 2;  // Was uint64, now string - BREAKS OLD DATA!
}
```

### 4. Renumbering Fields
```protobuf
// ❌ DANGEROUS - Completely breaks compatibility!
message Example {
  bytes field1 = 2;  // Was 1, now 2 - BREAKS OLD DATA!
  uint64 field2 = 1;  // Was 2, now 1 - BREAKS OLD DATA!
}
```

### 5. Reusing Field Numbers
```protobuf
// ❌ DANGEROUS - Old data will be misinterpreted!
message Example {
  bytes field1 = 1;
  uint64 new_field = 2;  // Reusing number from deleted field - BREAKS OLD DATA!
  // Field 2 was previously used by a string field
}
```

---

## 📋 Safe Modification Checklist

Before modifying any protobuf message:

- [ ] Is this an existing message? (If yes, be extra careful)
- [ ] Am I adding a new field? (Must be at the END)
- [ ] Am I changing a field number? (NEVER do this)
- [ ] Am I changing a field type? (NEVER do this)
- [ ] Am I removing a field? (Use `reserved` instead)
- [ ] Did I check that no existing field numbers shift?
- [ ] Did I test with existing blockchain data?

---

## 🔧 How to Add New Fields (Step-by-Step)

### Example: Adding "achievements" to PlayerStats

#### Step 1: Find the highest field number
```protobuf
message PlayerStats {
  // ... fields 1-14 ...
  string classic_points_bonus_utc_date = 15;  // Highest is 15
}
```

#### Step 2: Add new field with next number
```protobuf
message PlayerStats {
  // ... fields 1-14 ...
  string classic_points_bonus_utc_date = 15;
  repeated uint64 achievements = 16;  // ✅ New field at end
}
```

#### Step 3: Update ALL schema copies
- [ ] TypeScript proto file: `plugin/typescript/proto/game2048.proto`
- [ ] Go descriptors: `cmd/rpc/game2048.go` (messageDescriptor)
- [ ] TypeScript encoding: Plugin contract code
- [ ] Go decoding: Backend query code

#### Step 4: Rebuild
```bash
cd plugin/typescript
npm run build

cd ../../
go build -o canopy.exe .\cmd\main\main.go
```

#### Step 5: Test backward compatibility
- Start node with new schema
- Verify old data still reads correctly
- Create new data with new field
- Verify new data reads correctly

---

## 🎯 Best Practices

### 1. Use Separate Messages for New Features
Instead of adding fields to PlayerStats, create a new message:

```protobuf
// ✅ BEST - Separate message for achievements
message PlayerAchievements {
  bytes player_address = 1;
  repeated uint64 achievement_ids = 2;
  uint64 total_points = 3;
}
```

Benefits:
- No risk to existing PlayerStats
- Clean separation of concerns
- Easier to test and migrate

### 2. Plan for Future Fields
Leave gaps in field numbers for logical grouping:

```protobuf
message Example {
  // Identity fields: 1-10
  bytes id = 1;
  string name = 2;
  // Save 3-10 for future identity fields
  
  // Stats fields: 11-20
  uint64 score = 11;
  uint64 level = 12;
  // Save 13-20 for future stats
  
  // Config fields: 21-30
  bool enabled = 21;
  // Save 22-30 for future config
}
```

### 3. Document Field Numbers
Always add comments explaining field purposes:

```protobuf
message PlayerStats {
  bytes player_address = 1;  // Identity
  uint64 daily_games_started = 2;  // Game counts
  uint64 classic_games_started = 3;  // Game counts
  // ... more game count fields ...
  uint64 best_daily_score = 7;  // High scores
  uint64 best_classic_score = 8;  // High scores
  // ... more score fields ...
}
```

### 4. Use Optional Fields for Nullable Data
```protobuf
message Example {
  bytes required_field = 1;
  optional string nullable_field = 2;  // Can be absent
  optional uint64 optional_count = 3;  // Can be absent
}
```

---

## 🚫 What Went Wrong With Username

### The Mistake
```protobuf
// BEFORE (working)
message PlayerStats {
  bytes player_address = 1;
  uint64 daily_games_started = 2;
  uint64 classic_games_started = 3;
  // ... fields 4-15
}

// AFTER (broken) - username inserted at field 2
message PlayerStats {
  bytes player_address = 1;
  string username = 2;  // ❌ INSERTED
  uint64 daily_games_started = 3;  // SHIFTED from 2!
  uint64 classic_games_started = 4;  // SHIFTED from 3!
  // ... all fields shifted!
}
```

### The Impact
- Old PlayerStats data became unreadable
- All stats showed wrong values
- Check-in page broke
- Profile page showed garbage data

### The Fix
```protobuf
// CORRECT - username removed from PlayerStats
message PlayerStats {
  bytes player_address = 1;
  uint64 daily_games_started = 2;  // ✅ Back to original
  uint64 classic_games_started = 3;  // ✅ Back to original
  // ... fields 4-15 unchanged
}

// Username stored separately
message UsernameRegistration {
  bytes player_address = 1;
  string username = 2;
  uint64 registered_at_unix = 3;
  uint64 last_changed_at_unix = 4;
}
```

### The Lesson
**Never insert fields in the middle. Always add at the end, or use a separate message.**

---

## 📚 Additional Resources

- [Protobuf Language Guide](https://protobuf.dev/programming-guides/proto3/)
- [Protobuf Best Practices](https://protobuf.dev/programming-guides/dos-donts/)
- [Updating Message Types](https://protobuf.dev/programming-guides/proto3/#updating)

---

## ⚠️ Emergency: If You Made a Breaking Change

If you accidentally made a breaking change:

1. **Stop immediately** - Don't deploy
2. **Assess damage** - What data is affected?
3. **Revert changes** - Go back to working schema
4. **Plan migration** - Design proper migration strategy
5. **Test thoroughly** - Verify old data reads correctly

For production deployments, breaking changes require:
- Data migration script
- Schema versioning
- Backward compatibility layer
- User communication
- Rollback plan

---

**Remember: In blockchain development, schema changes are permanent. Always be cautious!**
