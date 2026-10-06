import { useMemo, useState } from 'react';
import type { CurrentCyclePreview, DealerCycleSummary, DealerReference, IndentLine } from '@shared/api/generated/models';
import { Button, Modal, Toast } from '@shared/ui';
import { buildIndentCsv, type ExportIndentScope } from '../lib/buildIndentCsv';

export interface ExportModalProps {
  open: boolean;
  lines: IndentLine[];
  dealer: DealerReference;
  cycle: CurrentCyclePreview | DealerCycleSummary;
  scope: ExportIndentScope;
  onClose: () => void;
}

export function ExportModal({ open, lines, dealer, cycle, scope, onClose }: ExportModalProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const csvContent = useMemo(() => buildIndentCsv(lines, dealer, cycle, scope), [cycle, dealer, lines, scope]);
  const subtitle = scope === 'filtered' ? `${lines.length} filtered ${lineWord(lines.length)}` : `All ${lines.length} ${lineWord(lines.length)}`;

  const handleCopy = async () => {
    try {
      const writer = getClipboardWriter();
      if (!writer) throw new Error('Clipboard API unavailable');
      await writer(csvContent);
      setToastMessage('Copied to clipboard');
    } catch {
      setToastMessage('Select the text and copy');
    }
  };

  return (
    <Modal
      open={open}
      title="Export indent CSV"
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:order-2">
            <Toast message={toastMessage} />
          </div>
          <div className="flex gap-2 sm:order-1">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={() => void handleCopy()}>
              Copy to clipboard
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="rounded-card border border-warning/30 bg-warning-soft p-3 text-body-sm text-warning">
          In production this downloads a file; this preview is shown so you can inspect the CSV shape.
        </p>
        <label htmlFor="export-indent-csv" className="block text-body-sm font-medium text-fg">
          CSV preview
        </label>
        <textarea
          id="export-indent-csv"
          readOnly
          value={csvContent}
          rows={10}
          className="min-h-56 w-full resize-y rounded-control border border-border-strong bg-surface p-3 font-mono text-body-sm text-fg"
        />
      </div>
    </Modal>
  );
}

function lineWord(count: number): string {
  return count === 1 ? 'line' : 'lines';
}

function getClipboardWriter(): ((text: string) => Promise<void>) | undefined {
  return [navigator, globalThis.navigator, window.navigator]
    .map((nav) => nav.clipboard?.writeText.bind(nav.clipboard))
    .find((writeText) => writeText !== undefined);
}
