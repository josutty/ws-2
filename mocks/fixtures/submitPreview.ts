import type { SubmitPreview } from '@shared/api/generated/models';
import { CLOSES_AT, RECIPIENT } from '../constants';
import { dealerCycleSummaryFixture } from './cycleSummary';

export const submitPreviewFixture: SubmitPreview = {
  status: dealerCycleSummaryFixture.totals.blankLines > 0 ? 'HAS_WARNINGS' : 'READY',
  lines: dealerCycleSummaryFixture.lines,
  totals: dealerCycleSummaryFixture.totals,
  warnings:
    dealerCycleSummaryFixture.totals.blankLines > 0
      ? [
          {
            code: 'LINES_WITHOUT_ENTRY',
            message: `${dealerCycleSummaryFixture.totals.blankLines} lines have no entry. They go up as zero.`,
            lineCount: dealerCycleSummaryFixture.totals.blankLines,
          },
        ]
      : [],
  recipient: RECIPIENT,
  reopenUntil: CLOSES_AT,
};
