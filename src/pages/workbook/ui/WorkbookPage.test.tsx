import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { at } from '@mocks/lib';
import { DEALER_ID } from '@mocks/constants';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { WorkbookPage } from './WorkbookPage';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const renderPage = () => renderWithProviders(<WorkbookPage />, { preloadedState, route: '/workbook' });

describe('WorkbookPage', () => {
  it('renders exactly one h1', async () => {
    renderPage();
    expect(await screen.findAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders TopBar with the workbook view marked current', async () => {
    renderPage();
    const nav = await screen.findByRole('navigation');
    expect(within(nav).getByRole('button', { name: 'Indent workbook' })).toHaveAttribute('aria-current', 'page');
  });

  it('composes WorkbookToolbar, FilterRail, IndentGrid and CommitBar', async () => {
    renderPage();
    expect(await screen.findByRole('button', { name: '+ Add FERT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    const rail = screen.getByRole('complementary', { name: 'Filters' });
    expect(within(rail).getByRole('button', { name: 'Clear all' })).toBeInTheDocument();
    expect(await screen.findByText(at(indentLineFixtures, 0).product.fertCode)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review & submit' })).toBeInTheDocument();
  });

  it('lifts a FilterRail selection up into WorkbookToolbar as a removable token', async () => {
    const fuel = at(indentLineFixtures, 0).product.fuel;
    const { user } = renderPage();

    const rail = await screen.findByRole('complementary', { name: 'Filters' });
    // Filter keys render in the documented order (TASK-004): ...MPG model, Tonnage, Fuel... — "Fuel" is the 7th (index 6).
    const fuelTrigger = at(await within(rail).findAllByRole('button', { name: 'All' }), 6);
    await user.click(fuelTrigger);
    await user.click(within(rail).getByRole('option', { name: new RegExp(fuel, 'i') }));

    expect(await screen.findByRole('button', { name: new RegExp(`remove.*${fuel}`, 'i') })).toBeInTheDocument();
  });

  it('opens AddFertModal from the "+ Add FERT" button', async () => {
    const { user } = renderPage();
    await user.click(await screen.findByRole('button', { name: '+ Add FERT' }));
    expect(await screen.findByRole('dialog', { name: /add fert/i })).toBeInTheDocument();
  });

  it('opens LineDetailDrawer for the clicked line via the "ⓘ" button', async () => {
    const firstLine = at(indentLineFixtures, 0);
    const { user } = renderPage();
    const infoButtons = await screen.findAllByRole('button', { name: 'ⓘ' });
    await user.click(at(infoButtons, 0));

    const drawer = await screen.findByRole('complementary', { name: 'Line detail' });
    expect(within(drawer).getByText(firstLine.product.fertCode)).toBeInTheDocument();
  });

  it('opens ReviewSubmitModal from CommitBar\'s "Review & submit" button', async () => {
    const { user } = renderPage();
    await user.click(await screen.findByRole('button', { name: 'Review & submit' }));
    expect(await screen.findByRole('dialog', { name: /review.*submit/i })).toBeInTheDocument();
  });
});
