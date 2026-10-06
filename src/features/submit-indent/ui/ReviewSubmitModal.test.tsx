import { http, HttpResponse } from 'msw';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEALER_ID, RECIPIENT } from '@mocks/constants';
import { submitPreviewFixture } from '@mocks/fixtures/submitPreview';
import { apiUrl } from '@mocks/lib';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { renderWithProviders, screen, waitFor, within } from '@test/test-utils';
import { ReviewSubmitModal, type ReviewSubmitModalProps } from './ReviewSubmitModal';

const preloadedState = { session: { token: 'mock-session-token', dealerId: DEALER_ID, authStatus: 'authenticated' as const } };
const unmountViews: Array<() => void> = [];

afterEach(() => {
  for (const unmount of unmountViews) unmount();
  unmountViews.length = 0;
});

type ReviewSubmitModalViewProps = ReviewSubmitModalProps & {
  filteredLineCount?: number;
  addedLineCount?: number;
};

const previewWith = (overrides: Partial<typeof submitPreviewFixture>): typeof submitPreviewFixture => ({
  ...submitPreviewFixture,
  warnings: [],
  status: 'READY',
  ...overrides,
});

const usePreview = (preview: typeof submitPreviewFixture) => {
  server.use(http.get(apiUrl('/dealers/:dealerId/cycles/:cycleId/submit-preview'), () => HttpResponse.json(preview)));
};

const deferred = (): { promise: Promise<void>; resolve: () => void } => {
  let resolve = () => {};
  const promise = new Promise<void>((settle) => {
    resolve = () => settle();
  });

  return { promise, resolve };
};

const renderModal = (props: Partial<ReviewSubmitModalViewProps> = {}) => {
  const defaultProps: ReviewSubmitModalProps = {
    open: true,
    onClose: vi.fn(),
    filtered: false,
    onReviewMissing: vi.fn(),
  };

  const view = renderWithProviders(<ReviewSubmitModal {...defaultProps} {...props} />, { preloadedState });
  unmountViews.push(view.unmount);
  return view;
};

describe('ReviewSubmitModal', () => {
  it('does not render while closed and renders the summary from getDealerSubmitPreview while open', async () => {
    const { rerender } = renderModal({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<ReviewSubmitModal open onClose={vi.fn()} filtered={false} />);

    const dialog = await screen.findByRole('dialog', { name: 'Review and submit indent' });
    expect(within(dialog).getByText(/S&OP-1A · July 2026/i)).toBeInTheDocument();
    expect(within(dialog).getByText(`${submitPreviewFixture.lines}`)).toBeInTheDocument();
    expect(within(dialog).getByText('July (W1-W4)')).toBeInTheDocument();
    expect(within(dialog).getByText('August')).toBeInTheDocument();
    expect(within(dialog).getByText('September')).toBeInTheDocument();
    expect(within(dialog).getByText(new RegExp(RECIPIENT))).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Submit indent' })).toBeEnabled();
  });

  it('shows an error banner with retry and keeps Submit disabled until the preview loads', async () => {
    server.use(...scenarios.submitPreviewServerError);
    const { user } = renderModal();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Could not load the submission preview.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit indent' })).toBeDisabled();

    server.resetHandlers();
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('July (W1-W4)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit indent' })).toBeEnabled();
  });

  it('renders the filtered-view warning from the filteredLineCount prop, not the preview response', async () => {
    usePreview(previewWith({ lines: 99 }));
    renderModal({ filtered: true, filteredLineCount: 17 });

    expect(await screen.findByText('Submitting sends your full indent, not just the 17 on screen.')).toBeInTheDocument();
    expect(screen.queryByText('Submitting sends your full indent, not just the 99 on screen.')).not.toBeInTheDocument();
  });

  it('does not render the filtered-view warning when filteredLineCount is absent', async () => {
    usePreview(previewWith({ lines: 17 }));
    renderModal({ filtered: true });

    await screen.findByText('July (W1-W4)');
    expect(screen.queryByText(/Submitting sends your full indent/i)).not.toBeInTheDocument();
  });

  it('renders the missing-entries warning and Review them first action independently', async () => {
    const onClose = vi.fn();
    const onReviewMissing = vi.fn();
    usePreview(
      previewWith({
        status: 'HAS_WARNINGS',
        warnings: [{ code: 'LINES_WITHOUT_ENTRY', message: '6 lines have no entry. They go up as zero.', lineCount: 6 }],
      }),
    );
    const { user } = renderModal({ onClose, onReviewMissing });

    expect(await screen.findByText('6 lines have no entry. They go up as zero.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Review them first' }));

    expect(onReviewMissing).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the added-lines notice from the addedLineCount prop, not the preview response', async () => {
    usePreview(previewWith({ lines: 99 }));
    renderModal({ addedLineCount: 2 });

    expect(await screen.findByText('2 lines added by you this cycle — flagged for your ASM')).toBeInTheDocument();
    expect(screen.queryByText('99 lines added by you this cycle — flagged for your ASM')).not.toBeInTheDocument();
  });

  it('does not render the added-lines notice when addedLineCount is absent', async () => {
    usePreview(previewWith({ lines: 2 }));
    renderModal();

    await screen.findByText('July (W1-W4)');
    expect(screen.queryByText(/lines added by you this cycle/i)).not.toBeInTheDocument();
  });

  it('keeps view-local notice counts out of the SubmitPreview shape', () => {
    const forbiddenPattern = new RegExp([
      'preview',
      '\\.',
      'filteredLineCount',
      '|',
      'preview',
      '\\.',
      'addedLineCount',
      '|',
      'SubmitPreview',
      'WithViewFlags',
    ].join(''));
    const paths = [
      'src/features/submit-indent/ui/ReviewSubmitModal.tsx',
      'src/features/submit-indent/ui/ReviewSubmitModal.test.tsx',
    ];

    const matches = paths.filter((path) => forbiddenPattern.test(readFileSync(path, 'utf8')));

    expect(matches).toEqual([]);
  });

  it('shows loading and disables Submit indent while submitting', async () => {
    const submitResponse = deferred();
    const onClose = vi.fn();
    server.use(
      http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/submit'), async () => {
        await submitResponse.promise;
        return HttpResponse.json({ taskId: 'task-submit', status: 'SUBMITTED', submittedAt: '2026-07-01T06:00:00+05:30', recipient: RECIPIENT });
      }),
    );
    const { user } = renderModal({ onClose });

    await user.click(await screen.findByRole('button', { name: 'Submit indent' }));

    expect(screen.getByRole('button', { name: 'Submitting indent' })).toBeDisabled();
    submitResponse.resolve();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('posts submitDealerIndent then closes and shows a confirmation toast', async () => {
    const onClose = vi.fn();
    const submitRequests: string[] = [];
    server.use(
      http.post(apiUrl('/dealers/:dealerId/cycles/:cycleId/submit'), async ({ request }) => {
        submitRequests.push(await request.text());
        return HttpResponse.json({ taskId: 'task-submit', status: 'SUBMITTED', submittedAt: '2026-07-01T06:00:00+05:30', recipient: RECIPIENT });
      }),
    );
    const { user } = renderModal({ onClose });

    await user.click(await screen.findByRole('button', { name: 'Submit indent' }));

    await waitFor(() => expect(submitRequests).toHaveLength(1));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('status')).toHaveTextContent('Indent submitted');
  });

  it('shows a conflict banner and removes Submit indent so only Cancel remains', async () => {
    server.use(...scenarios.submitConflict);
    const { user } = renderModal();

    await user.click(await screen.findByRole('button', { name: 'Submit indent' }));

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('This indent has already been submitted.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit indent' })).not.toBeInTheDocument();
  });
});
