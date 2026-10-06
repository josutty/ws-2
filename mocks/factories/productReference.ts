import { faker } from '@faker-js/faker';
import type { ProductReference } from '@shared/api/generated/models';

const MODELS = ['Pro 2110', 'Pro 3015', 'Pro 6028', 'Skyline Pro 1049'] as const;
const TONNAGES = ['5T', '7T', '9T', '14T', '19T', '25T'] as const;
const FUELS = ['Diesel', 'CNG', 'LPG'] as const;
const SEGMENTS = ['Repeater', 'Runner', 'Stranger'] as const;
const SUB_VERTICALS = ['<5T', '5-16T', '16-25T', '>25T'] as const;
const AC_TYPES = ['AC', 'Non-AC'] as const;
const BODY_LENGTHS = ['14FT', '16FT', '19FT', '22FT'] as const;

export const buildProductReference = (overrides: Partial<ProductReference> = {}): ProductReference => {
  const model = faker.helpers.arrayElement(MODELS);
  const fuel = faker.helpers.arrayElement(FUELS);
  return {
    memberId: `P-FERT-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
    fertCode: `V${faker.string.numeric(4)}${fuel === 'Diesel' ? 'DSL' : fuel}`,
    description: `${model} Flatbed ${faker.helpers.arrayElement(BODY_LENGTHS)} BSVI`,
    model,
    mpg: model,
    eicherSegment: faker.helpers.arrayElement(SEGMENTS),
    subVertical: faker.helpers.arrayElement(SUB_VERTICALS),
    tonnage: faker.helpers.arrayElement(TONNAGES),
    fuel,
    application: faker.helpers.arrayElement(SEGMENTS),
    acType: faker.helpers.arrayElement(AC_TYPES),
    ...overrides,
  };
};
