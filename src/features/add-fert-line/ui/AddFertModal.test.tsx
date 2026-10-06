import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { availableProductFixtures } from '@mocks/fixtures/availableProduct';
import { apiUrl, at } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { DEALER_ID } from '@mocks/constants';
import { renderWithProviders, screen, waitFor, within } from '@test/test-utils';
import { AddFertModal, type AddFertModalProps } from './AddFertModal';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const firstProduct = at(availableProductFixtures, 0);
const secondProduct = at(availableProductFixtures, 1);

const renderModal = (props: Partial<AddFertModalProps> = {}) => {
  const defaultProps: AddFertModalProps = {
    open: true,
    vertical: 'lmd',
    onClose: vi.fn(),
  };

  return renderWithProviders(<AddFertModal {...defaultProps} {...props} />, { preloadedState });
};

describe('AddFertModal', () => {
  it('does not render the dialog while closed and renders it with the catalogue while open', async () => {
    const { rerender } = renderModal({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<AddFertModal open vertical="lmd" onClose={vi.fn()} />);

    const dialog = await screen.findByRole('dialog', { name: 'Add FERT code' });
    expect(within(dialog).getByText(/not ordered in the last 12 months/i)).toBeInTheDocument();
    expect(within(dialog).getByRole('searchbox', { name: 'Search catalogue' })).toBeInTheDocument();
    const firstRow = await within(dialog).findByRole('button', { name: new RegExp(firstProduct.fertCode) });
    expect(firstRow).toHaveAttribute('aria-pressed', 'false');
    expect(within(firstRow).getByText(firstProduct.description)).toBeInTheDocument();
    expect(within(firstRow).getByText(firstProduct.tonnage)).toBeInTheDocument();
    expect(within(firstRow).getByText(firstProduct.fuel)).toBeInTheDocument();
    expect(within(firstRow).getByText(firstProduct.application)).toBeInTheDocument();
    expect(within(dialog).getByText('None selected')).toBeInTheDocument();
  });

  it('shows a labelled loading skeleton while catalogue products load', () => {
    server.use(
      http.get(apiUrl('/dealers/:dealerId/catalogue/available-products'), async () => {
        await delay('infinite');
        return HttpResponse.json({ page: 0, size: 50, totalElements: 0, items: [] });
      }),
    );

    renderModal();

    const loadingList = screen.getByRole('list', { name: 'Loading available FERT codes' });
    expect(loadingList).toHaveAttribute('aria-busy', 'true');
    expect(within(loadingList).getAllByText(/loading/i).length).toBeGreaterThan(0);
  });

  it('searches through the query parameter and renders matching catalogue rows', async () => {
    const observedSearches: string[] = [];
    server.use(
      http.get(apiUrl('/dealers/:dealerId/catalogue/available-products'), ({ request }) => {
        const url = new URL(request.url);
        observedSearches.push(url.searchParams.get('search') ?? '');
        const search = url.searchParams.get('search')?.toLowerCase() ?? '';
        const items = availableProductFixtures.filter(
          (product) => product.fertCode.toLowerCase().includes(search) || product.description.toLowerCase().includes(search),
        );
        return HttpResponse.json({ page: 0, size: 50, totalElements: items.length, items });
      }),
    );
    const { user } = renderModal();

    await screen.findByRole('button', { name: new RegExp(firstProduct.fertCode) });
    await user.type(screen.getByRole('searchbox', { name: 'Search catalogue' }), secondProduct.fertCode);

    await waitFor(() => expect(observedSearches).toContain(secondProduct.fertCode));
    expect(await screen.findByRole('button', { name: new RegExp(secondProduct.fertCode) })).toBeInTheDocument();
  });

  it('shows an empty state when no catalogue products match', async () => {
    server.use(...scenarios.availableProductsEmpty);

    renderModal();

    expect(await screen.findByText('No matching code in the catalogue.')).toBeInTheDocument();
  });

  it('shows an error banner with a working retry inside the modal', async () => {
    server.use(...scenarios.availableProductsServerError);
    const { user } = renderModal();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load the catalogue.')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('button', { name: new RegExp(firstProduct.fertCode) })).toBeInTheDocument();
  });

  it('toggles catalogue rows and updates the selected counter', async () => {
    const { user } = renderModal();

    const firstRow = await screen.findByRole('button', { name: new RegExp(firstProduct.fertCode) });
    await user.click(firstRow);

    expect(firstRow).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 selected')).toBeInTheDocument();

    await user.click(firstRow);
    expect(firstRow).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('None selected')).toBeInTheDocument();
  });

  it('closes without posting a mutation when Add selected is clicked with no selection', async () => {
    const onClose = vi.fn();
    let mutationCalls = 0;
    server.use(
      http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), () => {
        mutationCalls += 1;
        return HttpResponse.json({ lineId: 'unexpected' });
      }),
    );
    const { user } = renderModal({ onClose });

    await screen.findByRole('button', { name: new RegExp(firstProduct.fertCode) });
    await user.click(screen.getByRole('button', { name: 'Add selected' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mutationCalls).toBe(0);
  });

  it('disables Add selected while submitting selected rows', async () => {
    server.use(
      http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), async () => {
        await delay('infinite');
        return HttpResponse.json({ lineId: 'never-resolves' });
      }),
    );
    const { user } = renderModal();

    await user.click(await screen.findByRole('button', { name: new RegExp(firstProduct.fertCode) }));
    await user.click(screen.getByRole('button', { name: 'Add selected' }));

    expect(screen.getByRole('button', { name: 'Adding selected' })).toBeDisabled();
  });

  it('adds every selected product then closes and notifies the parent', async () => {
    const onClose = vi.fn();
    const onAdded = vi.fn();
    const postedProductIds: string[] = [];
    server.use(
      http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/indent-lines'), async ({ request }) => {
        const body = (await request.json()) as { productMemberId: string };
        postedProductIds.push(body.productMemberId);
        return HttpResponse.json({ lineId: `added-${postedProductIds.length}` }, { status: 201 });
      }),
    );
    const { user } = renderModal({ onClose, onAdded });

    await user.click(await screen.findByRole('button', { name: new RegExp(firstProduct.fertCode) }));
    await user.click(await screen.findByRole('button', { name: new RegExp(secondProduct.fertCode) }));
    await user.click(screen.getByRole('button', { name: 'Add selected' }));

    await waitFor(() => expect(postedProductIds).toEqual([firstProduct.memberId, secondProduct.memberId]));
    expect(onAdded).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a toast and closes without an inline banner when the selected product already exists', async () => {
    const onClose = vi.fn();
    server.use(...scenarios.addIndentLineConflict);
    const { user } = renderModal({ onClose });

    await user.click(await screen.findByRole('button', { name: new RegExp(firstProduct.fertCode) }));
    await user.click(screen.getByRole('button', { name: 'Add selected' }));

    expect(await screen.findByRole('status')).toHaveTextContent('already on your indent');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
