// Badge style constants for consistent styling across components

export const WALLET_BADGE_CLASS = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium';

export const WALLET_BADGE_TONE = 'bg-amber-500/15 text-amber-500 border border-amber-500/20';

// Additional badge styles for different states
export const BADGE_STYLES = {
  primary: 'bg-primary/15 text-primary border border-primary/20',
  success: 'bg-green-500/15 text-green-500 border border-green-500/20',
  warning: 'bg-amber-500/15 text-amber-500 border border-amber-500/20',
  danger: 'bg-red-500/15 text-red-500 border border-red-500/20',
  muted: 'bg-muted/40 text-muted-foreground border border-border/60',
} as const;
