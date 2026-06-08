# Changelog

All notable changes to ProofArcade will be documented in this file.

## Unreleased

### Added

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

### Improved

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
