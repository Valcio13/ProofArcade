# Release Notes - ProofArcade v0.2.0

**Release Date**: June 14, 2026  
**Version**: 0.2.0  
**Branch**: 2048-game  
**Type**: Major Feature Release

---

## 🎯 Overview

This release marks the transition from a single-game prototype to a **multi-game platform foundation**. It introduces a complete identity system, public profiles, major UX improvements, and professional polish across the platform.

**Key Highlights**:
- ✨ Complete PlayerIdentity system with public profiles
- 🎨 Major UX overhaul (Settings, Check-In, mode selection)
- 🏷️ Dynamic page titles across all pages
- 🔗 Clickable usernames with profile discovery
- 🏗️ Zero breaking changes - fully backward compatible

---

## 🆕 New Features

### 1. PlayerIdentity & Public Profiles

**Address-Based Identity System**
- Address remains the immutable primary key
- Username is now a mutable display attribute
- Query-time username enrichment for backward compatibility
- Consistent username display across the entire platform

**Public Profile Pages** (`/player/:address`)
- Persistent player identity accessible to all users
- 6 achievement metrics (Best Score, Highest Tile, Total Games, Daily Challenges, Classic Points, All-Time Rank)
- Recent activity feed (last 10 games with badges)
- All-time ranking card
- Profile sharing button
- Responsive design for mobile and desktop

**Profile Discovery**
- All leaderboard usernames are now clickable
- Click any username → view full public profile
- Leaderboards become social discovery surfaces

**Backend Implementation**
- New protobuf message: `PlayerIdentity`
- New RPC endpoints: `getUsernameByAddress`, `setUsername`
- Dual-write strategy (state + database) for username persistence
- Query-time enrichment ensures all responses include current usernames

---

### 2. Dynamic Page Titles

**Route-Aware Browser Tab Titles**

All major pages now have proper document titles that update based on context:

**Static Titles** (8 pages):
- Home: `ProofArcade | Play 2048 On-Chain`
- Profile: `My Profile | ProofArcade`
- Check-In: `Daily Check-In | ProofArcade`
- Settings: `Settings | ProofArcade`
- Shop: `Shop | ProofArcade`
- Auth: `Wallet Auth | ProofArcade`
- Explorer: `Explorer | ProofArcade`
- Playtest: `Playtest | ProofArcade`

**Dynamic Titles** (3 pages):
- **Play2048**: Updates based on mode parameter
  - `/play?mode=daily` → `Daily Challenge | ProofArcade`
  - `/play?mode=classic` → `Classic Mode | ProofArcade`
  - `/play` → `Training Mode | ProofArcade`
  
- **Leaderboard**: Updates based on active mode
  - `?mode=daily` → `Daily Leaderboard | ProofArcade`
  - `?mode=classic` → `Classic Leaderboard | ProofArcade`
  
- **PublicProfile**: Shows player username
  - `/player/:address` → `{username} | ProofArcade`

**Benefits**:
- Better tab management when multiple pages are open
- Descriptive bookmarks
- Clearer browser history
- Enhanced accessibility for screen readers
- Improved SEO for search engines

---

## 🎨 Major UX Improvements

### Settings Page Refactor

**Focus**: Identity, Security, Recovery

**Removed**:
- ❌ Wallet Nickname (duplicate identity system)
- ❌ Dev Faucet (moved to developer context)

**Enhanced**:
- ✨ Prominent Beta Wallet Notice
- ✨ Elevated Username Management (now "Public Username")
- ✨ Elevated Wallet Backup with "Why Backup?" educational section
- ✨ Recovery best practices and instructions
- ✨ Side-by-side responsive layout
- ✨ CTAs aligned at same horizontal baseline

**New Structure**:
```
⚠️ Beta Wallet Notice (prominent)
├─ Public Username (left)        | Wallet Backup (right)
│  └─ Update Username CTA        | └─ Export Backup CTA  ← Same baseline
└─ Recovery Information (best practices + instructions)
```

---

### Check-In Page Redesign

**Focus**: Progression over status

**Improved**:
- ✨ Compact status summary banner (single row, 4 metrics)
- ✨ Reward Track elevated as hero element
- ✨ Integrated claim button directly into active reward tile
- ✨ Removed duplicate Weekly Cycle Progress card
- ✨ Compressed claimed state to inline message
- ✨ Enhanced Day 7 motivation with countdown badges

**New Hierarchy**:
1. Header with account info
2. Stats Banner (compact, 4 metrics)
3. **Reward Track** (hero element with integrated claiming)
4. All-Time Rewards Card

**Experience**:
- Feels like battle pass progression system
- Primary interaction is clicking the day tile to claim
- Clearer visual hierarchy
- Less duplicated information

---

### Mode Card CTA Alignment

**Consistency across mode selection**:
- ✨ All mode cards (Daily Challenge, Classic Mode, Training Mode) have CTAs at same horizontal baseline
- ✨ Applied to both Home page and Play2048 page
- ✨ Responsive flexbox layout with `auto-rows-fr` for equal heights
- ✨ Professional, polished appearance

**Implementation**:
- CSS Grid with equal row heights
- Flexbox with `justify-between` for bottom-aligned CTAs
- Helper text moved above buttons for alignment

---

## 🔧 Technical Improvements

### Backend (Go)

**New Endpoints**:
- `getUsernameByAddress(address) → PlayerIdentity`
- `setUsername(address, password, username) → TxResponse`

**Query-Time Enrichment**:
- All leaderboard entries now include `PlayerIdentity`
- Responses augmented with current username from database
- No breaking changes to existing message structures

**Dual-Write Strategy**:
- Username stored in both blockchain state and database
- State provides canonical source of truth
- Database enables efficient queries
- Backward compatibility maintained

---

### Frontend (React/TypeScript)

**New Page**:
- `PublicProfile.tsx` (11.54 KB) - Complete public profile implementation

**Updated Pages** (11 total):
- Home, Profile, Settings, CheckIn, Shop, Auth, Explorer, Playtest, Leaderboard, Play2048, ExplorerHome

**Client Libraries**:
- `chain2048.ts` - Added username operations
- `mockChain2048.ts` - Mock username implementations
- `rpcChain2048.ts` - RPC username client

**Type Safety**:
- Full TypeScript types for `PlayerIdentity`
- Username validation (3-20 chars, alphanumeric + underscore)
- Error handling for username operations

---

### Contract Layer (TypeScript/Protobuf)

**Protobuf Changes**:
- New message: `PlayerIdentity { string address = 1; string username = 2; }`
- Backward compatible schema evolution
- All generated files updated

**Documentation**:
- New file: `PROTOBUF_RULES.md` - Guidelines for schema evolution

**Validation**:
- Username length: 3-20 characters
- Allowed characters: a-z, A-Z, 0-9, underscore
- Case-sensitive storage, case-insensitive uniqueness checks

---

## 📦 Build & Performance

### Build Status
- ✅ Go backend compiles successfully
- ✅ TypeScript contract compiles successfully
- ✅ React frontend builds in 5.24s
- ✅ All tests passing
- ✅ No breaking changes

### Bundle Sizes
- **Main bundle**: 409.12 KB (gzip: 132.28 KB)
- **PublicProfile**: 11.54 KB (gzip: 2.90 KB) - NEW
- **Settings**: 12.17 KB (gzip: 3.60 KB) - Refactored
- **CheckIn**: 13.85 KB (gzip: 4.28 KB) - Redesigned
- **Leaderboard**: 13.33 KB (gzip: 3.72 KB) - Enhanced
- **Play2048**: 23.60 KB (gzip: 7.60 KB) - Enhanced

**Performance Impact**: Negligible - minimal code added for page titles

---

## 🔄 Migration Guide

### For Existing Players

**No action required** - All changes are backward compatible.

- ✅ Existing usernames continue to work
- ✅ All scores and stats preserved
- ✅ Wallet addresses remain primary identifiers
- ✅ Leaderboard rankings unchanged

**New Features Available**:
- Set your username in Settings if you haven't already
- Visit `/player/{your-address}` to see your public profile
- Click other players' usernames on leaderboards to view their profiles

---

### For Developers

**Backend**:
- No breaking changes to existing RPC endpoints
- New endpoints are additive only
- Database schema changes are backward compatible
- Protobuf changes use highest available field numbers

**Frontend**:
- `PlayerIdentity` type now available in all contexts
- Username operations available via `createGame2048Client()`
- Public profile route: `/player/:address`
- Page titles update automatically via `useEffect` hooks

**Testing**:
- Verify username operations work correctly
- Test public profile access and rendering
- Confirm leaderboard username clicks navigate properly
- Check dynamic page titles update on route changes

---

## 📝 Breaking Changes

**None** - This release maintains full backward compatibility.

All existing:
- ✅ Data structures remain compatible
- ✅ API endpoints continue to function
- ✅ Client code works without changes
- ✅ Player data is preserved
- ✅ Leaderboard logic unchanged

---

## 🐛 Bug Fixes

None in this release - focus was on new features and UX improvements.

---

## 🔮 What's Next

### Phase B: Deferred Features (Future)

The following were designed but intentionally deferred until product need:

- **Seasons System**: Time-bound competitive periods
- **Achievements System**: Milestone tracking and badges
- **Multi-Game Support**: Additional game types beyond 2048
- **Cross-Game Inventory**: Shared items and cosmetics
- **Social Features**: Following, guilds, friend lists

**Rationale**: Architecture and schemas are ready, but implementation waits for concrete product requirements.

---

## 📊 Impact Summary

### Code Changes
- **27 files modified**
- **2 files added**
- **~3,150 lines added**
- **~1,750 lines deleted**
- **Net: +1,400 lines**

### User-Facing Changes
- **1 new page** (Public Profile)
- **4 pages redesigned** (Settings, Check-In, Home mode cards, Play2048 mode cards)
- **11 pages** with dynamic titles
- **All leaderboards** enhanced with clickable usernames

### Architecture Progress
- ✅ Phase A Complete: Identity & Profile Foundation
- ⏳ Phase B-F: Deferred until product need (Seasons, Achievements, Multi-Game, etc.)

---

## 🙏 Acknowledgments

This release represents the **largest single update** to ProofArcade since initial implementation:
- Complete identity system implementation
- Major UX improvements across 4 key pages
- Professional polish with dynamic titles
- Zero breaking changes

The platform now has a **solid foundation** for multi-game expansion while maintaining the focused experience players expect.

---

## 📚 Additional Documentation

- `UNCOMMITTED_CHANGES_SUMMARY.md` - Complete technical breakdown
- `DYNAMIC_PAGE_TITLES.md` - Page title implementation details
- `READY_TO_COMMIT.md` - Quick reference for this release
- `.kiro/specs/platform-architecture-v2/` - Architecture design documents

---

## 🚀 Upgrade Instructions

### For Production Deployment

1. **Pull latest changes** from `2048-game` branch
2. **Rebuild backend**:
   ```bash
   cd canopy-main
   go build -o canopy cmd/main/main.go
   ```
3. **Rebuild TypeScript contract**:
   ```bash
   cd plugin/typescript
   npm run build
   ```
4. **Rebuild frontend**:
   ```bash
   cd cmd/rpc/web/explorer
   npm run build
   ```
5. **Restart services**
6. **Verify**:
   - Check public profiles load: `/player/{address}`
   - Verify dynamic page titles work
   - Test username operations in Settings
   - Confirm leaderboard usernames are clickable

---

**Version**: 0.2.0  
**Released**: June 14, 2026  
**Status**: ✅ Production Ready
