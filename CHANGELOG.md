# Changelog

All notable changes to ProofArcade will be documented in this file.

## [Unreleased]

### Added

- **Weekly Blitz Competition Mode**: Fast-paced 3-minute timed 2048 games
  - Entry fee: 5 PROOF per game
  - Daily limit: 2 runs per UTC day
  - Cumulative weekly scoring (Monday-Sunday UTC)
  - Fee distribution: 60% prize pool, 20% shop, 15% reserve, 5% platform
  - Pool ID 131077 for weekly prize pool
  - On-chain timer enforcement with auto-submit
  - Weekly leaderboard with real-time rankings

- **Monthly Reward Claim System**: Claimable rewards for monthly competition winners
  - Dynamic tier-based distribution (Elite/Champion/Challenger)
  - Top 20% of participants win (minimum 50 players, maximum 100 winners)
  - Elite Tier: Top 2% receive 50% of pool (exponential distribution)
  - Champion Tier: Next 8% receive 30% of pool (linear distribution)
  - Challenger Tier: Next 10% receive 20% of pool (equal distribution)
  - One-time claim enforcement with on-chain validation
  - Frontend claim UI with transaction tracking
  - RPC endpoint: `POST /v1/admin/tx-2048-claim-monthly-reward`
  - Proto message: `MessageClaimMonthlyReward`

- **Weekly Blitz Reward Claim System**: Claimable rewards for Weekly Blitz winners
  - Dynamic tier-based distribution (Elite/Champion/Challenger)
  - Top 30% of participants win (minimum 20 players, maximum 50 winners)
  - Elite Tier: Top 5% receive 40% of pool (exponential distribution)
  - Champion Tier: Next 10% receive 35% of pool (linear distribution)
  - Challenger Tier: Next 15% receive 25% of pool (equal distribution)
  - Week calculation: Monday 00:00 UTC to Sunday 23:59 UTC
  - Frontend claim UI with week display and rank information
  - RPC endpoint: `POST /v1/admin/tx-2048-claim-weekly-blitz-reward`
  - Proto message: `MessageClaimWeeklyBlitzReward`

- **Reward Engine**: Unified reward calculation system
  - Configurable competition parameters (min participants, winner %, tier structure)
  - Dynamic winner count scaling based on actual participants
  - Three-tier distribution system with different algorithms per tier
  - Fallback to DAO pool if competition pool insufficient
  - Shared logic for Monthly and Weekly Blitz rewards
  - Implementation: `plugin/typescript/src/contract/competition/reward-engine.ts`

- **Complete Reward Documentation**: New `docs/REWARDS.md`
  - Comprehensive reward system guide
  - Tier calculation examples
  - Eligibility requirements
  - Claiming instructions
  - Pool information and money flow

### Changed

- **Pool Name Simplification**: Renamed pool constants for consistency
  - `DAILY_REWARD` → `DAILY`
  - `MONTHLY_REWARD` → `MONTHLY`
  - `WEEKLY_BLITZ` (new) → `WEEKLY`

- **Weekly Blitz Simplified**: Removed free retry system
  - Before: 2 paid runs + 3 free retries
  - After: 2 paid runs only
  - Cleaner daily limit enforcement
  - All games contribute to prize pool

- **Weekly Blitz Timer Reduced**: Changed from 5 minutes to 3 minutes
  - Faster-paced gameplay
  - More accessible for casual sessions

- **Weekly Blitz Pool Architecture**: Fixed to use real Pool ID 131077
  - Before: Tracked as metadata without backing tokens
  - After: Uses dedicated Pool 131077 for actual token storage
  - Proper money flow: 60% of entry fees → Pool 131077

### Documentation

- Updated `README.md` with Weekly Blitz mode and reward systems
- Updated `docs/2048-monthly-competition-v1.md` with V2 reward claim section
- Updated `docs/weekly-blitz-requirements.md` with V2 reward claim section
- Updated `docs/ARCHITECTURE.md` with pool information
- Created `docs/REWARDS.md` with comprehensive reward system guide
- Removed 20 redundant implementation/status documentation files

## [0.2.0] - 2026-06-14

### Added

- **PlayerIdentity System**: Complete identity architecture with address-based routing and mutable usernames
  - New protobuf message: `PlayerIdentity` with address and username fields
  - Query-time username enrichment for backward compatibility
  - New RPC endpoints: `getUsernameByAddress`, `setUsername`
  - Dual-write strategy (state + database) for username persistence
  
- **Public Profile Pages**: New `/player/:address` route for persistent player identity
  - 6 achievement metrics (Best Score, Highest Tile, Total Games, Daily Challenges, Classic Points, All-Time Rank)
  - Recent activity feed (last 10 games with badges)
  - All-time ranking card
  - Profile sharing button
  - Responsive design
  
- **Clickable Leaderboard Usernames**: All leaderboards now link to public profiles
  - Daily leaderboard usernames clickable
  - Classic leaderboard usernames clickable
  - Home page top players clickable
  
- **Dynamic Page Titles**: Route-aware browser tab titles (11 pages)
  - Static titles: Home, Profile, CheckIn, Settings, Shop, Auth, Explorer, Playtest
  - Dynamic titles: Play2048 (mode-based), Leaderboard (mode-based), PublicProfile (username-based)
  - Improves tab management, bookmarking, browser history, accessibility, and SEO

### Changed

- **Settings Page Refactor**: Complete redesign focused on identity, security, and recovery
  - Removed: Wallet Nickname (duplicate identity system)
  - Removed: Dev Faucet (moved to developer context)
  - Enhanced: Beta Wallet Notice (more prominent)
  - Elevated: Username Management (now "Public Username")
  - Elevated: Wallet Backup with "Why Backup?" educational section
  - Added: Recovery best practices and instructions
  - Layout: Side-by-side responsive grid with aligned CTAs
  
- **Check-In Page Redesign**: Progression-focused UX overhaul
  - Compact status summary banner (single row, 4 metrics)
  - Reward Track elevated as hero element
  - Integrated claim button directly into active reward tile
  - Removed duplicate Weekly Cycle Progress card
  - Compressed claimed state to inline message
  - Enhanced Day 7 motivation with countdown badges
  
- **Mode Card CTA Alignment**: Visual consistency improvements
  - Home page mode selection cards (Daily, Classic, Training) have aligned CTAs
  - Play2048 compact mode cards have aligned CTAs
  - All CTAs at same horizontal baseline using flexbox layout

### Technical

- **Backend (Go)**:
  - Query-time username enrichment in RPC handlers
  - Dual-write username updates (state + database)
  - Backward compatible dual-write strategy
  
- **Frontend (React/TypeScript)**:
  - New page: `PublicProfile.tsx` (11.54 KB)
  - Updated: 11 pages with new features and titles
  - Type-safe username operations
  - Mock implementations for development
  
- **Contract Layer (TypeScript/Protobuf)**:
  - New protobuf message: `PlayerIdentity`
  - New documentation: `PROTOBUF_RULES.md`
  - Backward compatible schema evolution
  - Username validation (3-20 chars, alphanumeric + underscore)

### Documentation

- Added: `RELEASE_NOTES_v0.2.0.md` - Comprehensive release documentation
- Added: `DYNAMIC_PAGE_TITLES.md` - Page titles implementation details
- Updated: `UNCOMMITTED_CHANGES_SUMMARY.md` - Complete technical breakdown
- Added: `.kiro/specs/platform-architecture-v2/` - Architecture design documents

### Performance

- Main bundle: 409.12 KB (gzip: 132.28 KB) - no significant change
- All component chunks optimized
- Minimal performance impact from new features

### Breaking Changes

**None** - This release maintains full backward compatibility with all existing:
- Data structures
- API endpoints
- Client code
- Player data
- Leaderboard logic

---

## Unreleased

### Added

- **Monthly Competition System**: Complete monthly competitive prize pool for Classic mode
  - Monthly prize pool: 30% of all Classic entry fees (600K uproof per game)
  - Cumulative scoring: Players accumulate scores throughout the month
  - Single entry per player: Automatic deletion of previous entries when new game submitted
  - Monthly leaderboard: Top 50 players displayed with current month focus
  - User ranking display: Shows player's rank if positioned 11th or lower
  - New RPC endpoints: `getMonthlyPool`, `getMonthlyLeaderboard`
  - Migration support: Handles both old (4-byte) and new (36-byte) entry formats
  
- **Uproof Denomination**: Added micro-PROOF denomination support
  - Backend storage in uproof (1 PROOF = 1,000,000 uproof)
  - Frontend conversion utilities: `toCNPY()` and `formatCNPY()`
  - Chain configuration updated across wallet and explorer
  - Denomination hooks for consistent formatting
  
- Dev testing faucet: "Get Test PROOF" button in Settings (RPC mode only)
- Optimistic UI updates for instant feedback on Check-In claims
- Optimistic UI updates for instant feedback on Shop redemptions
- Optimistic UI updates for instant feedback on Profile reward claims
- Comprehensive diagnostic logging for transaction debugging
- Transaction hash persistence across page refreshes
- Decimal display formatting utility (0-2 decimal places) for CNPY tokens
- Mode-specific navigation from Leaderboard (Daily/Classic tabs link to correct mode)
- Wallet deletion with password confirmation
- Wallet export/import functionality
- Password verification during wallet login
- Playtest onboarding flow for new users
- Leaderboard preview on homepage
- Authenticated vs unauthenticated homepage states
- Player stats dashboard for logged-in users
- Quick action cards for authenticated users
- Session info card on Play page showing wallet and mode details
- URL parameter support for mode selection (`?mode=daily` and `?mode=classic`)

### Changed

- **Leaderboard UI Simplification**: Streamlined monthly leaderboard experience
  - Removed: Month selector dropdown (always shows current month)
  - Removed: All-time leaderboard tab (focus on daily and monthly competitions)
  - Enhanced: Top 10 display with "Show More/Less" toggle
  - Enhanced: Info section simplified from 3-column to 2-column grid
  - Improved: Current month highlighted in tab display

### Technical

- **Backend (Go)**:
  - Monthly pool query handler: `Game2048MonthlyPool()`
  - Monthly leaderboard loader: `loadGame2048MonthlyLeaderboard()`
  - Length-prefixed value parsing for monthly entries
  - Big-endian uint64 extraction for score/tile/moves/timestamp
  - Username enrichment for monthly leaderboard entries
  
- **Plugin (TypeScript)**:
  - Monthly pool allocation in `StartClassicGame` (30% of 2M uproof fee)
  - Cumulative scoring logic in `SubmitGameResult` for Classic mode
  - Previous entry deletion before adding new cumulative entry
  - Key generation: `KeyForMonthlyLeaderboard()`, `KeyForMonthlyPlayerEntry()`
  - Value encoding: Length-prefixed components with big-endian numeric values
  - Score inversion for descending leaderboard sort
  - Migration support: 4-byte (score only) and 36-byte (score + gameId) formats
  
- **Frontend (React/TypeScript)**:
  - New monthly leaderboard tab component
  - API client methods: `getMonthlyPool()`, `getMonthlyLeaderboard()`
  - Type definitions for monthly responses
  - Current month calculation utility
  - Show More/Less pagination for leaderboard

### Fixed

- **7 Critical Monthly Competition Bugs**:
  1. StateRead response handling: Changed to queryId-based lookup with `getQueryValue()`
  2. Key encoding: Fixed monthly keys to use `JoinLenPrefix` for proper length prefixes
  3. Value format mismatch: Rewrote to use length-prefixed components with big-endian encoding
  4. GameId size: Fixed assumption from 8 bytes to correct 32 bytes (SHA256 hash)
  5. StateRead pattern: Updated `StartClassicGame` to use consistent queryId pattern
  6. Parameter name: Fixed `dels` to `deletes` in StateWrite interface
  7. Delete structure: Fixed from raw `Uint8Array` to `{ key: Uint8Array }` objects

### Documentation

- Added: `docs/2048-monthly-competition-v1.md` - Complete monthly competition specification
- Updated: `docs/2048-treasury-v1.md` - Classic fee split with 30% monthly allocation
- Updated: `docs/2048-daily-prize-pool-v1.md` - Treasury flow with monthly pool reference
- All docs updated with uproof denomination details

### Performance

- Monthly leaderboard queries capped at top 50 entries
- Efficient iterator-based loading with early exit
- Single-entry per player prevents database bloat
- Length-prefixed encoding ensures safe parsing

### Breaking Changes

**None** - Classic fee split updated but maintains:
- Same total fee (2,000,000 uproof / 2 PROOF)
- Compatible pool accounting system
- Backward compatible entry format migration
- Existing daily competition unchanged

---

## [0.2.0] - 2026-06-14

### Added

- **Transaction hash display**: Fixed critical bug where TX hashes disappeared after page refresh
  - Fixed plugin field name mismatch (txHash vs tx_hash)
  - Fixed backend field type reader (bytes vs string)
  - Fixed backend descriptor type mismatch
- **Optimistic updates performance**: Reduced UI update latency from 200ms-2s to 30-50ms (40-60x faster)
  - Check-In: Instant points and streak updates
  - Shop: Instant balance and redemption history updates
  - Profile: Instant reward claim and balance updates
- **Decimal display system**: Clean CNPY formatting showing 0-2 decimals (no ".00" for whole numbers)
  - Applied to Profile page (6 locations)
  - Applied to Shop page (5 locations)
- **Play page UI polish**:
  - Changed headline from "Play first." to "Choose Your Mode"
  - Changed "Selected Lane" to "Selected Mode"
  - Redesigned mode selection: selected card shows "✓ Selected" badge, unselected show "Select" button
  - Removed duplicate "Start" buttons from mode cards (kept only in control panel)
  - Fixed excessive whitespace above hero section (xl:items-end → xl:items-start)
  - Removed Daily Cap Progress card (already on Home page)
- **Home page spacing**: Reduced excessive top padding (py-8 → py-2)
- **Leaderboard navigation**: "Start Playing" button now links to correct mode (Daily → /play?mode=daily, Classic → /play?mode=classic)
- Homepage onboarding experience for new users
- New-user journey with clear path to play within 10 seconds
- Playtest visibility and accessibility
- Wallet creation and authentication UX flow
- Navigation between Homepage and Play page modes
- Navbar layout with logo on left, navigation on right
- Navbar responsiveness and visual hierarchy
- Play page mode selection flow with clear Practice vs Competitive sections
- Auth page wallet management with collapsible interface
- Training Mode description and positioning
- Daily Check-In terminology consistency (renamed from Daily Login)
- Check-In page redesigned with progression focus and rewarding experience
- Streak visualization with flame icon and large display
- Progress bar and percentage tracker to Day 7 bonus
- Enhanced claim button with gradient and hover animations
- Day 7 bonus prominently highlighted with trophy icons
- Reward track with completed/current/locked visual states
- Improved claim interaction states (claiming, claimed, ready)
- Final UI polish: strengthened visual hierarchy and progression clarity
- Simplified Check-In page design for clarity and elegance
- Removed decorative arrows, excessive badges, and visual noise
- Clean reward track with clear completed/current/future states
- Streamlined Day 7 bonus presentation
- Minimal status indicators (small checkmarks only)
- Current day badge changed to "NOW" for clarity
- De-emphasized wallet info and UTC date
- Premium, polished look without cluttered gamification
- Profile page refactored with achievement and progression focus
- Hero section highlights Best Score, Best Tile, Current Rank, and Balance
- Claimable rewards prominently displayed with priority styling
- Rewards shown as achievements with rank badges and PROOF amounts
- Game Progress and Classic Points sections with clean stat cards
- Removed dashboard clutter (Daily Pool, ProfilePanel components)
- Player identity emphasized with large nickname display
- Claimed rewards shown in dedicated history section

### Fixed

- **Critical**: Transaction hashes now persist after page refresh
  - Fixed in contract.ts (plugin field name)
  - Fixed in game2048.go (backend reader and descriptor)
- **Critical**: Protobuf system audit completed - verified all 117 fields across 19 messages
- Optimistic update timing and reliability across all transaction types
- Daily Challenge button now correctly opens Daily Challenge mode
- Classic Mode button now correctly opens Classic Mode
- Playtest persistence issues (now always starts fresh)
- Authentication password validation on login
- Mode parameter being overridden during page initialization
- Navbar showing duplicate ProofArcade text
- Wallet panel cluttering the Play page
- Various onboarding and navigation inconsistencies

### Technical

- Complete protobuf field audit and verification (19 messages, 117 fields)
- Backend micro-unit conversion analysis documented (deferred for later)
- Comprehensive testing frameworks created:
  - Failure path audit (26 tests covering all transaction failures)
  - Mobile QA audit (8 pages + 6 mobile-specific checks)
  - Desktop testing checklist (19 tests)
- Performance benchmarking for optimistic updates

### Removed

- Unnecessary footer navigation links (API, Docs, Privacy, Terms)
- Redundant wallet prompts on game mode cards
- Duplicate "Create Wallet" CTAs
- Wallet management UI from Play page (moved to Auth page)
