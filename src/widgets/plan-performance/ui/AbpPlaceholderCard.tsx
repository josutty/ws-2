export interface AbpPlaceholderCardProps {
  readonly children?: never;
}

export function AbpPlaceholderCard() {
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card" aria-labelledby="abp-placeholder-title">
      <div className="flex h-full flex-col gap-3">
        <div>
          <p className="text-caption font-bold uppercase tracking-label text-fg-subtle">Against ABP</p>
          <h2 id="abp-placeholder-title" className="mt-1 text-heading-2 font-semibold text-fg">
            Not yet available
          </h2>
        </div>
        <p className="text-body text-fg-muted">
          Dealer-level ABP targets are being introduced this year and aren&apos;t reliable enough to score against.
          Your ASM sees the cluster figure.
        </p>
      </div>
    </section>
  );
}
