import { afterEach, describe, expect, it, vi } from 'vitest';
import { dealerCycleSummaryFixture } from '@mocks/fixtures/cycleSummary';
import { indentLineFixtures } from '@mocks/fixtures/indentLine';
import { at } from '@mocks/lib';
import { renderWithProviders, screen, waitFor, within } from '@test/test-utils';
import { ExportModal, type ExportModalProps } from './ExportModal';

const lines = [at(indentLineFixtures, 0), at(indentLineFixtures, 1)];
type ClipboardWriter = (text: string) => Promise<void>;

const renderModal = (props: Partial<ExportModalProps> = {}) => {
  const defaultProps: ExportModalProps = {
    open: true,
    lines,
    dealer: dealerCycleSummaryFixture.dealer,
    cycle: dealerCycleSummaryFixture,
    scope: 'all',
    onClose: vi.fn(),
  };

  return renderWithProviders(<ExportModal {...defaultProps} {...props} />);
};

const mockClipboard = (writeText: ClipboardWriter) => {
  const clipboard = { writeText };
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
  Object.defineProperty(globalThis.navigator, 'clipboard', { configurable: true, value: clipboard });
  Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: clipboard });
};

describe('ExportModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render while closed and renders CSV content with the all-lines scope while open', () => {
    const { rerender } = renderModal({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <ExportModal
        open
        lines={lines}
        dealer={dealerCycleSummaryFixture.dealer}
        cycle={dealerCycleSummaryFixture}
        scope="all"
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Export indent CSV' });
    expect(within(dialog).getByText(/downloads a file/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/all 2 lines/i)).toBeInTheDocument();
    const csvPreview = within(dialog).getByLabelText('CSV preview');
    if (!(csvPreview instanceof HTMLTextAreaElement)) throw new Error('CSV preview must be a textarea');
    expect(csvPreview.value).toContain('FERT Code,Description,Dealer Seg');
    expect(csvPreview.value).toContain(at(lines, 0).product.fertCode);
    expect(csvPreview.value).toContain(at(lines, 1).product.fertCode);
    expect(csvPreview).toHaveAttribute('readonly');
  });

  it('renders the filtered count in the subtitle when scope is filtered', () => {
    renderModal({ lines: [at(lines, 0)], scope: 'filtered' });

    expect(screen.getByRole('dialog', { name: 'Export indent CSV' })).toBeInTheDocument();
    expect(screen.getByText(/1 filtered line/i)).toBeInTheDocument();
  });

  it('copies the generated CSV to the clipboard and shows a success toast', async () => {
    const writeText = vi.fn<ClipboardWriter>(() => Promise.resolve());
    const { user } = renderModal();
    mockClipboard(writeText);

    await user.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining(at(lines, 0).product.fertCode)));
    expect(await screen.findByRole('status')).toHaveTextContent('Copied to clipboard');
  });

  it('shows the manual-copy fallback toast when clipboard writing is denied', async () => {
    const writeText = vi.fn<ClipboardWriter>(() => Promise.reject(new Error('denied')));
    const { user } = renderModal();
    mockClipboard(writeText);

    await user.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('status')).toHaveTextContent('Select the text and copy');
  });

  it('calls onClose from the Close button', async () => {
    const onClose = vi.fn();
    const { user } = renderModal({ onClose });

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
