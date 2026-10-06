import type { Outlet } from '@shared/api/generated/models';

export const buildOutlet = (overrides: Partial<Outlet> = {}): Outlet => ({
  outletId: '00000000-0000-4000-8000-000000000000',
  code: 'OUT-0',
  name: 'Sharma Motors',
  ...overrides,
});
