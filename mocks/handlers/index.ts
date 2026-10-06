import { identityMockHandlers, identityRealHandlers } from './identity';
import { dealerProfileHandlers } from './dealerProfile';
import { dealerIndentMockHandlers, dealerIndentRealHandlers } from './dealerIndent';
import { accuracyHandlers } from './accuracy';
import { submissionMockHandlers, submissionRealHandlers } from './submission';

// Keep in sync with plan/generated/endpoints-map.json "mock" flags (14 operations, 6 mock-only).
export const allHandlers = [
  ...identityRealHandlers,
  ...identityMockHandlers,
  ...dealerProfileHandlers,
  ...dealerIndentRealHandlers,
  ...dealerIndentMockHandlers,
  ...accuracyHandlers,
  ...submissionRealHandlers,
  ...submissionMockHandlers,
];

export const mockOnlyHandlers = [
  ...identityMockHandlers,
  ...dealerProfileHandlers,
  ...dealerIndentMockHandlers,
  ...accuracyHandlers,
  ...submissionMockHandlers,
];
