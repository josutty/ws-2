import { currentCyclePreviewFixture } from './fixtures/cyclePreview';
import { currentUserFixture } from './fixtures/currentUser';
import { accuracyByFertFixtures, accuracyByOutletFixtures } from './fixtures/accuracy';
import { availableProductFixtures } from './fixtures/availableProduct';
import { dealerCycleSummaryFixture } from './fixtures/cycleSummary';
import { indentLineFixtures } from './fixtures/indentLine';
import { outletFixtures } from './fixtures/outlet';
import { submitPreviewFixture } from './fixtures/submitPreview';

const clone = <T>(value: T): T => structuredClone(value);

export const db = {
  user: clone(currentUserFixture),
  cyclePreview: clone(currentCyclePreviewFixture),
  outlets: clone(outletFixtures),
  cycleSummary: clone(dealerCycleSummaryFixture),
  indentLines: clone(indentLineFixtures),
  availableProducts: clone(availableProductFixtures),
  accuracyByOutlet: clone(accuracyByOutletFixtures),
  accuracyByFert: clone(accuracyByFertFixtures),
  submitPreview: clone(submitPreviewFixture),
};

export const resetDb = (): void => {
  db.user = clone(currentUserFixture);
  db.cyclePreview = clone(currentCyclePreviewFixture);
  db.outlets = clone(outletFixtures);
  db.cycleSummary = clone(dealerCycleSummaryFixture);
  db.indentLines = clone(indentLineFixtures);
  db.availableProducts = clone(availableProductFixtures);
  db.accuracyByOutlet = clone(accuracyByOutletFixtures);
  db.accuracyByFert = clone(accuracyByFertFixtures);
  db.submitPreview = clone(submitPreviewFixture);
};
