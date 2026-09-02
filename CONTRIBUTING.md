# Contributing to ProofArcade

Thank you for your interest in contributing to ProofArcade! This guide will help you understand the project structure and development workflow.

## 📚 First Steps

1. **Read the Architecture**: Start with [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. **Understand the Structure**: See [project structure](#project-structure) below
3. **Set Up Locally**: Follow [setup instructions](#local-development-setup)

## 🏗️ Project Structure

```
ProofArcade/
├── canopy-main/                    # Main codebase
│   ├── plugin/typescript/          # Smart contract (TypeScript)
│   │   ├── src/contract/           # Contract logic
│   │   │   ├── competition/        # Game modes (Daily, Weekly, Monthly)
│   │   │   ├── economy/            # Fee distribution & treasury
│   │   │   ├── shop/               # Point redemption
│   │   │   ├── checkin/            # Daily rewards
│   │   │   └── profile/            # Player identity & stats
│   │   └── proto/                  # Protobuf definitions
│   │
│   ├── cmd/rpc/                    # Backend API (Go)
│   │   ├── admin.go                # Admin endpoints
│   │   ├── game2048.go             # Game query endpoints
│   │   ├── routes.go               # Route definitions
│   │   └── web/explorer/           # Frontend application
│   │       └── src/
│   │           ├── pages/          # React pages
│   │           ├── components/     # React components
│   │           └── lib/            # API client & utilities
│   │
│   └── docs/                       # Technical specifications
│
├── docs/                           # Project documentation
│   ├── ARCHITECTURE.md             # Start here!
│   ├── guides/                     # User & deployment guides
│   └── features/                   # Feature specifications
│
└── .archive/                       # Historical documentation (not in git)
```

## 🔧 Local Development Setup

### Prerequisites
- Go 1.21+
- Node.js 20+
- Git

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/Valcio13/ProofArcade.git
cd ProofArcade/canopy-main
```

2. **Build the blockchain**
```bash
go build -o canopy.exe ./cmd/main
```

3. **Install frontend dependencies**
```bash
cd cmd/rpc/web/explorer
npm install
```

4. **Start development**

Terminal 1 - Blockchain:
```bash
cd canopy-main
.\canopy.exe start
```

Terminal 2 - Frontend:
```bash
cd canopy-main/cmd/rpc/web/explorer
npm run dev
```

Visit: http://localhost:5173

## 🎯 Development Workflow

### Making Changes

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** following the [code style](#code-style)

3. **Test thoroughly** (see [testing](#testing))

4. **Commit with clear messages**
```bash
git add .
git commit -m "feat: Add feature description

- Detail 1
- Detail 2"
```

5. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test changes

Example:
```
feat: Add weekly prize pool display

- Add backend endpoint for pool queries
- Create frontend UI component
- Update leaderboard to show current pool
```

## 🧪 Testing

### Backend (Go)
```bash
cd canopy-main
go test ./...
```

### Smart Contract (TypeScript)
```bash
cd canopy-main/plugin/typescript
npm test
```

### Frontend (React)
```bash
cd canopy-main/cmd/rpc/web/explorer
npm run build  # Verify build succeeds
```

### Manual Testing Checklist
- [ ] Wallet creation works
- [ ] Game modes load correctly
- [ ] Transactions submit successfully
- [ ] UI displays data correctly
- [ ] No console errors

## 📝 Code Style

### Go (Backend)
- Follow standard Go formatting (`go fmt`)
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

### TypeScript (Contract & Frontend)
- Use TypeScript strict mode
- Prefer functional components (React)
- Use async/await over promises
- Add JSDoc comments for exported functions

### File Organization
- Group related functionality
- Keep files under 500 lines
- Extract utilities to separate files
- Use index files for clean imports

## 🎮 Adding New Features

### 1. Planning
- Create feature spec in `docs/features/`
- Discuss approach (if major change)
- Break down into tasks

### 2. Implementation Order
1. **Smart Contract** - Core logic first
2. **Backend API** - Query/mutation endpoints
3. **Frontend** - UI and API integration
4. **Documentation** - Update relevant docs

### 3. Smart Contract Changes

**Location**: `canopy-main/plugin/typescript/src/contract/`

Steps:
1. Add message types to proto files
2. Regenerate proto: `npm run build:proto`
3. Add handler in `contract.ts`
4. Update contract exports
5. Test with replay tests

### 4. Backend API Changes

**Location**: `canopy-main/cmd/rpc/`

Steps:
1. Add types in `types.go` or `game2048.go`
2. Add route in `routes.go`
3. Implement handler
4. Test endpoint manually

### 5. Frontend Changes

**Location**: `canopy-main/cmd/rpc/web/explorer/src/`

Steps:
1. Add types in `lib/mockChain2048.ts`
2. Add API method in `lib/rpcChain2048.ts`
3. Create/update page components
4. Test in browser

## 📚 Documentation

### When to Document

- **New Feature**: Create spec before implementing
- **API Change**: Update relevant module README
- **Architecture Change**: Update `docs/ARCHITECTURE.md`
- **Deployment Change**: Update `docs/guides/DEPLOYER_HANDOFF.md`

### Documentation Locations

- **Architecture**: `docs/ARCHITECTURE.md`
- **Feature Specs**: `docs/features/FEATURE_NAME.md`
- **User Guides**: `docs/guides/GUIDE_NAME.md`
- **Module Docs**: `canopy-main/plugin/typescript/src/contract/[module]/README.md`
- **API Specs**: `canopy-main/docs/`

### After Feature Complete

Move implementation docs to archive:
```bash
mv docs/features/FEATURE_NAME.md .archive/completed-features/
```

## 🐛 Bug Reports

### Reporting Bugs

Include:
1. **Description**: What happened?
2. **Expected**: What should happen?
3. **Steps to Reproduce**: How to trigger the bug?
4. **Environment**: Browser, OS, versions
5. **Screenshots**: If UI related
6. **Logs**: Console errors or backend logs

### Bug Fix Process

1. Create issue with reproduction steps
2. Create branch: `fix/bug-description`
3. Add test that fails
4. Fix the bug
5. Verify test passes
6. Submit PR with "fixes #issue-number"

## 🔒 Security

### Reporting Security Issues

**Do NOT create public issues for security vulnerabilities.**

Instead:
- Email: [security contact]
- Include detailed description
- We'll respond within 48 hours

### Security Best Practices

- Never commit private keys
- Never commit passwords or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Follow principle of least privilege

## 📦 Release Process

### Version Numbering

We use Semantic Versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example: `0.2.0` → `0.3.0` (new feature)

### Release Checklist

1. Update `docs/guides/COMPLETE_UPDATE_HISTORY.md`
2. Update version in package.json
3. Create release notes
4. Tag release: `git tag v0.X.0`
5. Build and test
6. Deploy

## 💬 Getting Help

### Resources
- **Documentation**: Start with `docs/ARCHITECTURE.md`
- **Module READMEs**: Check specific module docs
- **GitHub Issues**: Search existing issues
- **Code Comments**: Check inline documentation

### Questions?
- Check docs first
- Search closed issues
- Create new issue with "question" label

## 🎉 Your First Contribution

Good first issues:
- Documentation improvements
- UI/UX enhancements
- Test coverage
- Bug fixes (labeled "good first issue")

Not sure where to start? Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`

## 📋 Pull Request Checklist

Before submitting:
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] PR description explains changes

## 🙏 Code of Conduct

### Be Respectful
- Treat everyone with respect
- Welcome newcomers
- Be patient and helpful
- Focus on constructive feedback

### Be Professional
- Keep discussions on topic
- Avoid inflammatory language
- Respect different opinions
- Collaborate, don't compete

---

**Questions?** Open an issue or check the [docs](docs/)

**Thank you for contributing to ProofArcade! 🎮**
