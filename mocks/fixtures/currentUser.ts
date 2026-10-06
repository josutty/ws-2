import { faker } from '@faker-js/faker';
import type { CurrentUser } from '@shared/api/generated/models';
import { buildCurrentUser } from '../factories/currentUser';

faker.seed(1001);
export const currentUserFixture: CurrentUser = buildCurrentUser();
