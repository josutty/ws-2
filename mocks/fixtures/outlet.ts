import { faker } from '@faker-js/faker';
import type { Outlet } from '@shared/api/generated/models';
import { buildOutlet } from '../factories/outlet';

faker.seed(1101);
export const outletFixtures: Outlet[] = [
  buildOutlet({ outletId: faker.string.uuid(), code: 'OUT-1', name: 'Sharma Motors — GT Road' }),
  buildOutlet({ outletId: faker.string.uuid(), code: 'OUT-2', name: 'Sharma Motors — Sadar Bazaar' }),
  buildOutlet({ outletId: faker.string.uuid(), code: 'OUT-3', name: 'Sharma Motors — Ring Road' }),
];
