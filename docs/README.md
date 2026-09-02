# ProofArcade Documentation Hub

Welcome to the ProofArcade documentation! This directory contains all active documentation for the project.

## 📖 Documentation Structure

```
docs/
├── README.md              # This file - documentation hub
├── ARCHITECTURE.md        # 🎯 START HERE - Complete system architecture
├── QUICK_REFERENCE.md     # Quick reference for common tasks
│
├── guides/                # User and deployment guides
│   ├── DEPLOYER_HANDOFF.md         # Production deployment guide
│   ├── COMPLETE_UPDATE_HISTORY.md  # Full changelog
│   └── CURRENT_STATE_ANALYSIS.md   # Current system state
│
└── features/              # Feature specifications
    └── (feature spec docs)
```

## 🎯 Start Here

### New to the Project?
1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Read this first! Complete system overview.
2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick commands and common tasks.
3. **[guides/CURRENT_STATE_ANALYSIS.md](guides/CURRENT_STATE_ANALYSIS.md)** - Current system capabilities.

### Deploying?
- **[guides/DEPLOYER_HANDOFF.md](guides/DEPLOYER_HANDOFF.md)** - Production deployment guide

### Looking for History?
- **[guides/COMPLETE_UPDATE_HISTORY.md](guides/COMPLETE_UPDATE_HISTORY.md)** - Full changelog

## 📚 Module Documentation

Detailed documentation exists within the codebase:

### Smart Contract Modules
Located in `canopy-main/plugin/typescript/src/contract/`:

- **[checkin/README.md](../canopy-main/plugin/typescript/src/contract/checkin/README.md)** - Daily login rewards system
- **[shop/README.md](../canopy-main/plugin/typescript/src/contract/shop/README.md)** - Point redemption system  
- **[profile/README.md](../canopy-main/plugin/typescript/src/contract/profile/README.md)** - Player stats & identity
- **[economy/README.md](../canopy-main/plugin/typescript/src/contract/economy/README.md)** - Fee distribution & treasury
- **[competition/](../canopy-main/plugin/typescript/src/contract/competition/)** - Daily, Weekly, Monthly modes
- **[utils/README.md](../canopy-main/plugin/typescript/src/contract/utils/README.md)** - Shared utilities

### Technical Specifications
Located in `canopy-main/docs/`:

- **[2048-daily-prize-pool-v1.md](../canopy-main/docs/2048-daily-prize-pool-v1.md)** - Daily competition specification
- **[2048-treasury-v1.md](../canopy-main/docs/2048-treasury-v1.md)** - Treasury & fee model

## 🎮 Game Mode Documentation

### Classic Mode
- Entry: 2 PROOF
- Unlimited moves
- Earn Classic Points
- Monthly leaderboard

### Daily Challenge
- Entry: 25 PROOF
- 80 moves limit
- Shared board (UTC day)
- Top 10 win prizes

### Weekly Blitz ⚡
- Entry: 5 PROOF per game
- 3-minute timer
- 2 runs per UTC day
- Top 30% win prizes (tiered)

### Monthly Competition
- No entry fee
- Based on Classic points
- Top 50 win monthly prizes

## 🔧 Development Documentation

### Architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Full system architecture
  - Directory structure
  - Module organization
  - Data flow
  - State management
  - Adding features

### API Documentation
- Backend RPC handlers: `canopy-main/cmd/rpc/`
- Smart contract methods: `canopy-main/plugin/typescript/src/contract/`
- Frontend API client: `canopy-main/cmd/rpc/web/explorer/src/lib/`

## 📦 Archived Documentation

Historical documentation is archived at the project root:

```
.archive/
├── completed-features/      # Finished feature docs (Weekly Blitz, Monthly, etc.)
├── old-docs/               # Historical status/debug/phase docs
│   ├── monthly-competition/  # Monthly competition implementation history
│   └── [other historical docs]
└── feature-backups/        # Code from removed features
    └── ban-feature/          # Removed ban/moderation system
```

## 🔗 External Resources

- **[Canopy Network Docs](https://docs.canopy.network)** - Blockchain documentation
- **[Canopy GitHub](https://github.com/canopy-network/canopy)** - Core blockchain repo
- **[ProofArcade GitHub](https://github.com/Valcio13/ProofArcade)** - This project

## 📝 Documentation Guidelines

### When to Create Documentation

1. **New Feature**: Create spec in `features/` before implementation
2. **System Change**: Update `ARCHITECTURE.md`
3. **Deployment Change**: Update `guides/DEPLOYER_HANDOFF.md`
4. **Feature Complete**: Move implementation docs to `.archive/completed-features/`

### Documentation Best Practices

- Use clear, descriptive filenames
- Include date and version in headers
- Link related documents
- Archive old docs, don't delete
- Keep README files updated in modules

---

**Last Updated**: September 2, 2026  
**Questions?** See [ARCHITECTURE.md](ARCHITECTURE.md) or check module-specific READMEs
