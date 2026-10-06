import type { CurrentUser } from '@shared/api/generated/models';
import { DEALER_CODE, DEALER_ID, DEALER_NAME } from '../constants';

export const buildCurrentUser = (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
  userId: '11111111-1111-4111-8111-111111111111',
  displayName: 'Vikram Sharma',
  dealerMemberId: DEALER_ID,
  dealerCode: DEALER_CODE,
  dealerName: DEALER_NAME,
  roles: ['DEALER'],
  ...overrides,
});
