# Admin UI Standardization Plan

**Date**: 2026-07-14  
**Sub-task**: 3.5 - UI Standardization Across Admin Pages  
**Status**: In Progress

## Current State Analysis

### Inconsistencies Found

1. **Currency Display**:
   - ❌ Some pages still use `formatCNPY()` function name
   - ❌ Some display "CNPY" in labels
   - ✅ Pool Management uses `formatPROOF()` and displays "PROOF"

2. **Back Button Styles**:
   - Admin.tsx: No back button (dashboard)
   - AdminEconomy.tsx: Uses `<Link>` with inline flex and arrow
   - AdminPlayers.tsx: Uses `<Link>` with inline flex and arrow
   - AdminPoolManagement.tsx: Uses arrow icon in flex container

3. **Container Styles**:
   - **Consistent**: All use `rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm`
   - This is good! Keep this pattern.

4. **Header Styles**:
   - **Consistent**: All use similar header with title + subtitle
   - Titles: `text-4xl font-bold text-white`
   - Subtitles: `text-slate-400 text-lg`

5. **Card Padding**:
   - **Mostly Consistent**: Most use `p-6` for cards
   - Keep this pattern

6. **Animation Patterns**:
   - **Consistent**: All use framer-motion with same variants
   - `containerVariants` and `itemVariants`
   - This is good!

## Standard Design System

### Colors & Theme
```typescript
// Background
bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900

// Cards
rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm p-6

// Text Colors
- Primary Headings: text-white
- Secondary Text: text-slate-400
- Tertiary Text: text-slate-500
- Label Text: text-slate-300

// Status Colors
- Success: bg-green-500/10 text-green-400
- Warning: bg-amber-500/10 text-amber-400
- Error: bg-red-500/10 text-red-400
- Info: bg-blue-500/10 text-blue-400
- Pending: bg-yellow-500/10 text-yellow-400
```

### Typography
```typescript
// Page Titles
className="text-4xl font-bold text-white mb-2"

// Section Headings
className="text-xl font-semibold text-white mb-4"

// Card Titles
className="text-lg font-semibold text-white"

// Body Text
className="text-sm text-slate-400"

// Labels
className="text-sm font-medium text-slate-300"
```

### Components

#### Back Button (Standardized)
```typescript
<Link
  to="/admin"
  className="text-slate-400 hover:text-white transition-colors"
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
</Link>
```

#### Currency Formatting
```typescript
const formatPROOF = (amount: number) => {
  return (amount / 1_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Usage: {formatPROOF(balance)} PROOF
```

#### Action Buttons
```typescript
// Primary Action
className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"

// Secondary Action
className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors font-medium"

// Danger Action
className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"

// Success Action
className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
```

#### Stat Cards
```typescript
<div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-400">Label</p>
      <p className="mt-2 text-3xl font-bold text-white">Value</p>
    </div>
    <div className="rounded-lg bg-blue-500/10 p-3">
      <svg className="h-6 w-6 text-blue-400">...</svg>
    </div>
  </div>
</div>
```

#### Info Banners
```typescript
// Success
<div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
  <div className="flex items-start gap-3">
    <svg className="w-6 h-6 text-green-400 flex-shrink-0">...</svg>
    <div>
      <h3 className="text-sm font-semibold text-green-400">Title</h3>
      <p className="text-sm text-green-300/80">Message</p>
    </div>
  </div>
</div>

// Warning
<div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">...</div>

// Error
<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">...</div>

// Info
<div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">...</div>
```

## Implementation Checklist

### Phase 1: Currency Standardization (CRITICAL)
- [ ] Admin.tsx - Change `formatCNPY` to `formatPROOF`
- [ ] AdminEconomy.tsx - Change `formatCNPY` to `formatPROOF`
- [ ] AdminPlayers.tsx - Change `formatCNPY` to `formatPROOF`
- [ ] AdminCompetitions.tsx - Change `formatCNPY` to `formatPROOF`
- [ ] AdminShop.tsx - Change `formatCNPY` to `formatPROOF`
- [ ] AdminMonitoring.tsx - Change `formatCNPY` to `formatPROOF`
- [ ] AdminModeration.tsx - Change `formatCNPY` to `formatPROOF`
- ✅ AdminPoolManagement.tsx - Already uses `formatPROOF`

### Phase 2: Back Button Consistency
- [x] Admin.tsx - No back button (dashboard, correct)
- [ ] AdminEconomy.tsx - Standardize back button
- [ ] AdminPlayers.tsx - Standardize back button
- [ ] AdminCompetitions.tsx - Standardize back button
- [ ] AdminShop.tsx - Standardize back button
- [ ] AdminModeration.tsx - Standardize back button
- [ ] AdminMonitoring.tsx - Standardize back button
- ✅ AdminPoolManagement.tsx - Already standardized

### Phase 3: Verify Card Styles
- [ ] Admin.tsx - Verify all cards use standard style
- [ ] AdminEconomy.tsx - Verify all cards use standard style
- [ ] AdminPlayers.tsx - Verify all cards use standard style
- [ ] AdminCompetitions.tsx - Verify all cards use standard style
- [ ] AdminShop.tsx - Verify all cards use standard style
- [ ] AdminModeration.tsx - Verify all cards use standard style
- [ ] AdminMonitoring.tsx - Verify all cards use standard style
- ✅ AdminPoolManagement.tsx - Already standardized

### Phase 4: Button Consistency
- [ ] Review all pages for button style consistency
- [ ] Apply standard button classes
- [ ] Ensure hover states are consistent

## Files to Modify (Priority Order)

1. **Admin.tsx** - Dashboard (most visible)
2. **AdminEconomy.tsx** - Economy stats
3. **AdminPlayers.tsx** - Player search
4. **AdminCompetitions.tsx** - Competition management
5. **AdminShop.tsx** - Shop management
6. **AdminModeration.tsx** - Moderation tools
7. **AdminMonitoring.tsx** - System monitoring

## Design Reference

Use `AdminPoolManagement.tsx` as the reference implementation for:
- Currency display (PROOF not CNPY)
- Back button styling
- Card layouts
- Button styles
- Color scheme
- Typography
- Spacing

## Implementation Strategy

1. **Create utility function** for common formatting
2. **One page at a time** - test after each change
3. **Commit after each page** - easier to review/rollback
4. **Visual testing** - check each page in browser
5. **Responsive testing** - verify mobile/tablet views

## Expected Outcome

After standardization:
- ✅ All pages display "PROOF" not "CNPY"
- ✅ Consistent back button style
- ✅ Uniform card layouts
- ✅ Consistent button styles
- ✅ Professional, cohesive admin interface
- ✅ Easier maintenance and updates
