import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DEALER_ID } from '@mocks/constants';
import { renderWithProviders, screen, within } from '@test/test-utils';
import { HomePage } from './HomePage';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workbook" element={<h2>Workbook route reached</h2>} />
    </Routes>,
    { preloadedState, route: '/' },
  );

describe('HomePage', () => {
  it('renders exactly one h1 for the page greeting', async () => {
    renderPage();

    expect(await screen.findAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders TopBar with the home view marked current', async () => {
    renderPage();

    const nav = await screen.findByRole('navigation');
    expect(within(nav).getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: 'Indent workbook' })).toBeInTheDocument();
  });

  it('renders all dashboard widget zones', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Your July indent — FERT' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Vertical summaries' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Indent vs demand' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Stock aging' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Demand mix' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Not yet available' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Your indent accuracy' })).toBeInTheDocument();
    expect(await screen.findByRole('table', { name: 'Indent rollup' })).toBeInTheDocument();
  });

  it('navigates to the workbook when Continue indent is clicked', async () => {
    const { user } = renderPage();

    await user.click(await screen.findByRole('button', { name: /continue indent/i }));

    expect(await screen.findByRole('heading', { name: 'Workbook route reached' })).toBeInTheDocument();
  });

  it('opens ExportModal from the Export action', async () => {
    const { user } = renderPage();

    await user.click(await screen.findByRole('button', { name: 'Export' }));

    expect(await screen.findByRole('dialog', { name: 'Export indent CSV' })).toBeInTheDocument();
  });
});
