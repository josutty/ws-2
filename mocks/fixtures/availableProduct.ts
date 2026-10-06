import { faker } from '@faker-js/faker';
import type { ProductReference } from '@shared/api/generated/models';
import { buildProductReference } from '../factories/productReference';

const FUEL_SUFFIXES = ['LPG', 'CNG', 'DSL'] as const;

// Catalogue of FERTs not yet on the dealer's indent — excludes the codes used in indentLineFixtures.
faker.seed(3001);
export const availableProductFixtures: ProductReference[] = Array.from({ length: 12 }, (_, i) =>
  buildProductReference({ fertCode: `V${5000 + i}${faker.helpers.arrayElement(FUEL_SUFFIXES)}`, memberId: `P-FERT-AV${String(i + 1).padStart(2, '0')}` }),
);
