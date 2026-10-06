import { useGetDealerCycleSummaryQuery } from '@entities/cycle';
import { sessionSlice, signedOut, useGetCurrentUserQuery } from '@entities/session';
import type { DealerCycleSummary } from '@shared/api';
import { useAppDispatch, useAppSelector } from '@shared/lib/store';
import { applyTheme } from '@shared/ui/theme';

export interface TopBarProps {
  activeView: 'home' | 'workbook';
  onNavigate: (view: 'home' | 'workbook') => void;
}

const FALLBACK_SUMMARY: Pick<DealerCycleSummary, 'cycleLabel' | 'closesAt' | 'status'> = {
  cycleLabel: 'S&OP-1A · July 2026',
  closesAt: '2026-07-15T23:59:00+05:30',
  status: 'DRAFT',
};

export function TopBar({ activeView, onNavigate }: TopBarProps) {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(sessionSlice.selectors.selectAuthStatus);
  const token = useAppSelector(sessionSlice.selectors.selectToken);
  const { data: user, isLoading: isUserLoading, isFetching: isUserFetching } = useGetCurrentUserQuery({});
  const {
    data: summary,
    isLoading: isCycleLoading,
    isFetching: isCycleFetching,
    isError: isCycleError,
    refetch,
  } = useGetDealerCycleSummaryQuery({});
  const shownSummary = summary ?? FALLBACK_SUMMARY;
  const isCycleBusy = isCycleLoading || isCycleFetching;
  const isUserBusy = isUserLoading || isUserFetching;
  const isTopBarLoading = (summary === undefined && isCycleBusy) || (user === undefined && isUserBusy);
  const role = formatRole(user?.roles.at(0));
  const isSubmitted = shownSummary.status === 'SUBMITTED';

  const handleToggleTheme = () => {
    const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
  };

  const handleSignOut = () => {
    if (authStatus === 'authenticated' || token !== null) dispatch(signedOut());
  };

  return (
    <header
      role={isTopBarLoading ? 'status' : 'banner'}
      aria-label={isTopBarLoading ? 'Loading topbar' : undefined}
      aria-busy={isTopBarLoading || undefined}
      className="bg-topbar text-topbar-fg"
    >
      <div className="flex min-h-14 flex-wrap items-center gap-3 px-4 py-2 text-body md:flex-nowrap md:px-6">
        <div className="mr-1 flex shrink-0 items-baseline font-bold tracking-tight" aria-label="VECV plan">
          <span className="text-heading-3">VECV</span>
          <span className="text-heading-3 text-primary">plan</span>
        </div>

        <nav aria-label="Primary" className="flex items-center gap-2">
          <NavButton active={activeView === 'home'} onClick={() => onNavigate('home')}>
            Home
          </NavButton>
          <NavButton active={activeView === 'workbook'} onClick={() => onNavigate('workbook')}>
            Indent workbook
          </NavButton>
        </nav>

        <div className="flex min-w-0 flex-1 items-center gap-2 text-body-sm" aria-busy={isCycleBusy} aria-label="Cycle status">
          {isCycleBusy ? <span className="sr-only">Loading cycle summary</span> : null}
          <span className="truncate rounded-control bg-surface/10 px-2 py-1 font-medium">{shownSummary.cycleLabel}</span>
          <span className="hidden rounded-control bg-surface/10 px-2 py-1 md:inline-flex">Closes {formatCutoff(shownSummary.closesAt)}</span>
          <span
            className={`hidden rounded-control px-2 py-1 font-bold md:inline-flex ${
              isSubmitted ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
            }`}
          >
            Status: {isSubmitted ? 'Submitted' : 'Not submitted'}
          </span>
          {isCycleError ? (
            <button
              type="button"
              aria-label="Retry cycle summary"
              onClick={() => void refetch()}
              className="rounded-control border border-border px-2 py-1 text-caption font-bold uppercase tracking-label hover:bg-surface-muted"
            >
              Retry
            </button>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={handleToggleTheme}
            className="flex size-8 items-center justify-center rounded-control bg-surface/10 text-body hover:bg-surface/20"
          >
            ◐
          </button>
          <div className="flex items-center gap-2 rounded-pill bg-surface/10 px-3 py-1.5" aria-busy={isUserBusy}>
            {isUserBusy ? <span className="sr-only">Loading current user</span> : null}
            <span className="font-medium">{user?.dealerName ?? 'Dealer'}</span>
            <span className="font-mono text-caption tabular-nums text-topbar-fg/80">
              {user?.dealerCode ?? '—'} · {role}
            </span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={handleSignOut}
            className="flex size-8 items-center justify-center rounded-control bg-surface/10 text-body hover:bg-surface/20"
          >
            ⎋
          </button>
        </div>
      </div>
    </header>
  );
}

interface NavButtonProps {
  active: boolean;
  children: string;
  onClick: () => void;
}

function NavButton({ active, children, onClick }: NavButtonProps) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={active ? NAV_BUTTON_CLASSES.active : NAV_BUTTON_CLASSES.inactive}
    >
      {children}
    </button>
  );
}

const NAV_BUTTON_CLASSES = {
  active: 'rounded-control px-3 py-1.5 font-medium bg-primary text-primary-fg',
  inactive: 'rounded-control px-3 py-1.5 font-medium bg-surface hover:bg-surface-muted text-fg-muted',
} as const;

function formatRole(role: string | undefined): string {
  if (role === undefined) return 'Dealer';
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatCutoff(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}
