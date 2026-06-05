# Changelog

All notable changes to ProofArcade will be documented in this file.

## Unreleased

### Added

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

### Fixed

- Daily Challenge button now correctly opens Daily Challenge mode
- Classic Mode button now correctly opens Classic Mode
- Playtest persistence issues (now always starts fresh)
- Authentication password validation on login
- Mode parameter being overridden during page initialization
- Navbar showing duplicate ProofArcade text
- Wallet panel cluttering the Play page
- Various onboarding and navigation inconsistencies

### Removed

- Unnecessary footer navigation links (API, Docs, Privacy, Terms)
- Redundant wallet prompts on game mode cards
- Duplicate "Create Wallet" CTAs
- Wallet management UI from Play page (moved to Auth page)
