# ProofArcade

Blockchain-based 2048 game platform built on Canopy Network with competitive game modes, prize pools, and token economy.

## 📚 Documentation

### 🎯 **[START HERE: docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**
**Comprehensive system architecture guide** - Read this first to understand how everything works!

### Quick Links
- **[docs/README.md](docs/README.md)** - Documentation hub
- **[docs/guides/DEPLOYER_HANDOFF.md](docs/guides/DEPLOYER_HANDOFF.md)** - Deployment guide  
- **[docs/guides/COMPLETE_UPDATE_HISTORY.md](docs/guides/COMPLETE_UPDATE_HISTORY.md)** - Full changelog

### Developer Guides
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Complete architecture analysis
  - System organization
  - Plugin/contract structure  
  - Backend RPC handlers
  - Frontend architecture
  - All game modes explained
  - State management
  - Adding new features

### Module Documentation
Contract modules have detailed READMEs:
- `canopy-main/plugin/typescript/src/contract/checkin/README.md` - Daily login rewards
- `canopy-main/plugin/typescript/src/contract/shop/README.md` - Point redemption
- `canopy-main/plugin/typescript/src/contract/profile/README.md` - Player stats & identity
- `canopy-main/plugin/typescript/src/contract/economy/README.md` - Fee distribution
- `canopy-main/plugin/typescript/src/contract/competition/` - Daily, Weekly, Monthly modes
- `canopy-main/plugin/typescript/src/contract/utils/README.md` - Utilities

## 🏗️ Project Structure

```
ProofArcade/
├── canopy-main/              # Canopy blockchain & ProofArcade plugin
│   ├── plugin/               # Smart contract (TypeScript)
│   ├── cmd/rpc/              # Backend API (Go)
│   │   └── web/explorer/     # Frontend (React + Vite)
│   └── docs/                 # Technical specifications
│
├── docs/                     # Active documentation
│   ├── guides/               # User & deployment guides
│   ├── features/             # Feature specifications
│   ├── ARCHITECTURE.md       # Main architecture doc
│   └── README.md             # Doc hub
│
├── .archive/                 # Historical documentation (gitignored)
│   ├── completed-features/   # Finished feature docs
│   ├── old-docs/             # Historical status/debug docs
│   └── feature-backups/      # Removed feature code
│
├── .kiro/                    # Kiro IDE configuration
├── admin_config.json         # Admin configuration (gitignored)
└── restart-services.ps1      # Service restart script
```

## 🚀 Quick Start

### Local Development
```powershell
# Terminal 1: Start blockchain
cd canopy-main
.\canopy.exe start

# Terminal 2: Start frontend
cd canopy-main\cmd\rpc\web\explorer
npm run dev
```

Visit: http://localhost:5173

### Key URLs
- **Frontend**: http://localhost:5173
- **RPC API**: http://localhost:15002
- **Admin API**: http://localhost:15003

## 🎮 Game Modes

### Classic Mode
- **Entry Fee**: 2 PROOF
- **Unlimited moves**
- Earn Classic Points based on score
- Redeem points for PROOF in Shop
- Contribute to monthly leaderboard

### Daily Challenge
- **Entry Fee**: 25 PROOF  
- **80 moves limit**
- Shared board for all players (same UTC day)
- Prize pool distributed to top 10 players
- Rankings reset daily at midnight UTC

### Weekly Blitz ⚡ NEW!
- **Entry Fee**: 5 PROOF per game
- **3-minute timer** with auto-submit
- **2 runs per UTC day**
- Cumulative weekly scoring (Monday-Sunday)
- Prize pool distributed to top 30%:
  - **Elite**: Top 5% (40% of pool, exponential)
  - **Champion**: Next 10% (35% of pool, linear)
  - **Challenger**: Next 15% (25% of pool, equal)
- Minimum 20 participants to activate rewards

### Monthly Competition
- **Based on Classic Mode** gameplay
- Leaderboard tracks lifetime Classic points
- Top 50 players win monthly prizes
- Resets first day of each month

## 💰 Token Economics

### PROOF Token
- **Denomination**: 1 PROOF = 1,000,000 uproof (micro-denomination)
- **Faucets**: 
  - 100 PROOF on registration
  - 100 PROOF daily faucet (24h cooldown)

### Fee Distribution

**Classic Mode (2 PROOF):**
- 5% Platform
- 45% Reserve Pool
- 50% Shop Treasury

**Daily Challenge (25 PROOF):**
- 5% Platform  
- 80% Prize Pool (distributed to winners)
- 10% Reserve Pool
- 5% Shop Treasury

**Weekly Blitz (5 PROOF):**
- 5% Platform
- 60% Prize Pool (distributed to winners)
- 10% Reserve Pool
- 25% Shop Treasury

**Monthly Competition:**
- No entry fees (uses Classic games)
- Prize pool funded by platform treasury

## 🔧 Recent Major Updates

### Version 0.2.0 - Weekly Blitz Competition
- Fast-paced 3-minute timed games
- Daily limit: 2 runs per UTC day
- Tier-based reward distribution
- Auto-submit countdown modal
- Prize pool display on leaderboard
- Full claim flow with eligibility checking

See [docs/guides/COMPLETE_UPDATE_HISTORY.md](docs/guides/COMPLETE_UPDATE_HISTORY.md) for the full changelog.

## 📖 Additional Documentation

### Feature Specifications
- `canopy-main/docs/2048-daily-prize-pool-v1.md` - Daily competition spec
- `canopy-main/docs/2048-treasury-v1.md` - Treasury & fee distribution

### Archived Documentation
Historical documentation is archived in `.archive/`:
- **completed-features/** - Finished feature implementation docs
- **old-docs/** - Historical status, debug, and phase documentation
- **feature-backups/** - Code from removed features (e.g., ban system)

### External Documentation
- [Canopy Network Docs](https://docs.canopy.network)
- [Canopy GitHub](https://github.com/canopy-network/canopy)

## 🛠️ Tech Stack

- **Blockchain**: Canopy Network (Go)
- **Smart Contract**: TypeScript Plugin
- **Backend**: Go (REST API)
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Game Engine**: Custom 2048 implementation with deterministic replay
- **Cryptography**: BLS12-381 signatures
- **State Storage**: RocksDB via FSM

## 📝 Development Notes

### Wallet System
- BLS12-381 cryptography
- Keystore-based (password protected)
- Browser storage for session persistence
- Multi-wallet support

### Testing
- Local validator node for development
- All transactions validated on-chain
- Deterministic game seeds for fairness
- Replay verification system

### Build Commands
```powershell
# Backend
cd canopy-main
go build -o canopy.exe ./cmd/main

# Frontend
cd canopy-main/cmd/rpc/web/explorer
npm run build
```

## 🔐 Security

- Smart contract validates all transactions
- Cryptographic signatures required
- Atomic state updates (all-or-nothing)
- Consensus-validated by multiple validators
- Grace periods prevent timer manipulation
- Session recovery prevents loss of progress

## 📞 Support

For deployment issues, see [docs/guides/DEPLOYER_HANDOFF.md](docs/guides/DEPLOYER_HANDOFF.md)

---

**Last Updated**: September 2, 2026  
**Version**: 0.2.0 (Weekly Blitz)  
**See**: [docs/guides/COMPLETE_UPDATE_HISTORY.md](docs/guides/COMPLETE_UPDATE_HISTORY.md)
