import { skipToken } from '@reduxjs/toolkit/query';
import { useState } from 'react';
import { getErrorMessage, type ApiError, type ProductReference } from '@shared/api';
import { Button, Input, Modal, Toast } from '@shared/ui';
import { useAddDealerIndentLineMutation, useListAvailableProductsQuery } from '../api/addFertApi';

export interface AddFertModalProps {
  open: boolean;
  vertical: 'lmd' | 'hd';
  onClose: () => void;
  onAdded?: () => void;
}

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'code' in error && 'message' in error;

const productText = (product: ProductReference) =>
  `${product.fertCode} ${product.description} ${product.tonnage} ${product.fuel} ${product.application}`;

export function AddFertModal({ open, vertical, onClose, onAdded }: AddFertModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addLine, { isLoading: isSubmitting, isError: isMutationError, error: mutationError }] =
    useAddDealerIndentLineMutation();
  const { data, isLoading, isFetching, isError, error, refetch } = useListAvailableProductsQuery(
    open ? { vertical, search: query } : skipToken,
  );

  const products = data?.items ?? [];
  const selectedCount = selected.size;
  const mutationApiError = isApiError(mutationError) ? mutationError : undefined;
  const showMutationError = isMutationError && mutationApiError?.code !== 'ERR_LINE_EXISTS' && mutationApiError?.status !== 409;

  const toggleProduct = (memberId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selected.size === 0) {
      onClose();
      return;
    }

    try {
      for (const productMemberId of selected) {
        await addLine({ productMemberId }).unwrap();
      }
      setSelected(new Set());
      onAdded?.();
      onClose();
    } catch (caughtError) {
      if (isApiError(caughtError) && (caughtError.code === 'ERR_LINE_EXISTS' || caughtError.status === 409)) {
        setToastMessage('This FERT code is already on your indent.');
        onClose();
      }
    }
  };

  return (
    <>
      <Modal
        open={open}
        title="Add FERT code"
        subtitle="These are codes not ordered in the last 12 months and will be flagged for your ASM."
        onClose={onClose}
        footer={
          <div className="flex items-center justify-between gap-3 border-t border-border-soft pt-3">
            <span className="text-body-sm text-fg-muted">{selectedCount === 0 ? 'None selected' : `${selectedCount} selected`}</span>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>Cancel</Button>
              <Button variant="primary" disabled={isSubmitting} onClick={() => void handleConfirm()}>
                {isSubmitting ? 'Adding selected' : 'Add selected'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <Input id="fert-catalogue-search" label="Search catalogue" type="search" value={query} onChange={setQuery} autoComplete="off" />
          {isLoading ? <CatalogueSkeleton /> : null}
          {isError ? <CatalogueError message={getErrorMessage(error)} onRetry={() => void refetch()} /> : null}
          {!isLoading && !isError ? <CatalogueList products={products} selected={selected} onToggle={toggleProduct} busy={isFetching} /> : null}
          {showMutationError ? (
            <p role="alert" className="rounded-card border border-danger/30 bg-danger-soft px-4 py-2 text-body-sm text-danger">
              {getErrorMessage(mutationApiError)}
            </p>
          ) : null}
        </div>
      </Modal>
      <Toast message={toastMessage} />
    </>
  );
}

function CatalogueList({
  products,
  selected,
  onToggle,
  busy,
}: {
  products: ProductReference[];
  selected: Set<string>;
  onToggle: (memberId: string) => void;
  busy: boolean;
}) {
  if (products.length === 0) return <p className="rounded-card border border-border bg-surface-muted p-4 text-body-sm text-fg-muted">No matching code in the catalogue.</p>;

  return (
    <ul aria-label="Available FERT codes" aria-busy={busy} className="max-h-80 space-y-2 overflow-y-auto">
      {products.map((product) => {
        const isSelected = selected.has(product.memberId);
        const className = isSelected
          ? 'w-full rounded-card border border-primary/40 bg-primary-soft p-3 text-left text-primary'
          : 'w-full rounded-card border border-border bg-surface p-3 text-left text-fg hover:bg-surface-muted';

        return (
          <li key={product.memberId}>
            <button type="button" aria-pressed={isSelected} onClick={() => onToggle(product.memberId)} className={className}>
              <span className="block font-mono text-body-sm font-semibold tabular-nums">{product.fertCode}</span>
              <span className="block text-body-sm font-medium">{product.description}</span>
              <span className="mt-1 flex flex-wrap gap-1 text-caption text-fg-subtle">
                <span>{product.tonnage}</span>
                <span aria-hidden="true">·</span>
                <span>{product.fuel}</span>
                <span aria-hidden="true">·</span>
                <span>{product.application}</span>
              </span>
              <span className="sr-only">{productText(product)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CatalogueSkeleton() {
  return (
    <ul aria-label="Loading available FERT codes" aria-busy="true" className="space-y-2">
      {Array.from({ length: 4 }, (_, index) => (
        <li key={index} aria-hidden="true" className="rounded-card border border-border bg-surface p-3">
          <span className="block h-4 w-24 rounded-control bg-surface-muted animate-pulse">Loading</span>
          <span className="mt-2 block h-4 w-4/5 rounded-control bg-surface-muted animate-pulse">Loading</span>
        </li>
      ))}
    </ul>
  );
}

function CatalogueError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-card border border-danger/30 bg-danger-soft p-4 text-body-sm text-danger">
      <p>{message}</p>
      <Button variant="ghost" size="sm" onClick={onRetry}>Retry</Button>
    </div>
  );
}
