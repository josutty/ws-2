// src/shared/api/generated/models.ts — aliases over generated schema.d.ts. Do not add fields here.
import type { components, operations } from './schema';

type Json<T> = T extends { content: { 'application/json': infer B } } ? B : never;

// ── identity ──
export type LoginRequest = components['schemas']['LoginRequest'];
export type LoginResult = components['schemas']['LoginResult'];
export type LoginResponse = Json<operations['login']['responses']['200']>;

export type CurrentCyclePreview = components['schemas']['CurrentCyclePreview'];
export type GetCurrentCyclePreviewResponse = Json<operations['getCurrentCyclePreview']['responses']['200']>;

export type CurrentUser = components['schemas']['CurrentUser'];
export type GetCurrentUserResponse = Json<operations['getCurrentUser']['responses']['200']>;

// ── dealer profile ──
export type Outlet = components['schemas']['Outlet'];
export type OutletList = components['schemas']['OutletList'];
export type ListDealerOutletsResponse = Json<operations['listDealerOutlets']['responses']['200']>;

// ── dealer indent ──
export type DealerReference = components['schemas']['DealerReference'];
export type CycleTotals = components['schemas']['CycleTotals'];
export type MonthTotal = components['schemas']['MonthTotal'];
export type DealerCycleSummary = components['schemas']['DealerCycleSummary'];
export type GetDealerCycleSummaryResponse = Json<operations['getDealerCycleSummary']['responses']['200']>;

export type ListDealerIndentLinesParams = NonNullable<operations['listDealerIndentLines']['parameters']['query']>;
export type IndentLinePage = components['schemas']['IndentLinePage'];
export type IndentLine = components['schemas']['IndentLine'];
export type ProductReference = components['schemas']['ProductReference'];
export type DealerStockBreakdown = components['schemas']['DealerStockBreakdown'];
export type LivePosBreakdown = components['schemas']['LivePosBreakdown'];
export type PipelineBreakdown = components['schemas']['PipelineBreakdown'];
export type TrendBreakdown = components['schemas']['TrendBreakdown'];
export type IndentPeriodCell = components['schemas']['IndentPeriodCell'];
export type ListDealerIndentLinesResponse = Json<operations['listDealerIndentLines']['responses']['200']>;

export type AddIndentLineRequest = components['schemas']['AddIndentLineRequest'];
export type AddDealerIndentLineResponse = Json<operations['addDealerIndentLine']['responses']['201']>;

export type ListAvailableProductsParams = NonNullable<operations['listAvailableProducts']['parameters']['query']>;
export type AvailableProductPage = components['schemas']['AvailableProductPage'];
export type ListAvailableProductsResponse = Json<operations['listAvailableProducts']['responses']['200']>;

export type IndentCellUpdate = components['schemas']['IndentCellUpdate'];
export type IndentCell = components['schemas']['IndentCell'];
export type UpdateDealerIndentCellResponse = Json<operations['updateDealerIndentCell']['responses']['200']>;

export type IndentBatchUpdate = components['schemas']['IndentBatchUpdate'];
export type IndentBatchResult = components['schemas']['IndentBatchResult'];
export type BatchUpdateDealerIndentCellsResponse = Json<operations['batchUpdateDealerIndentCells']['responses']['200']>;

// ── submission ──
export type SubmitPreview = components['schemas']['SubmitPreview'];
export type SubmissionWarning = components['schemas']['SubmissionWarning'];
export type GetDealerSubmitPreviewResponse = Json<operations['getDealerSubmitPreview']['responses']['200']>;

export type SubmitRequest = components['schemas']['SubmitRequest'];
export type SubmitResult = components['schemas']['SubmitResult'];
export type SubmitDealerIndentResponse = Json<operations['submitDealerIndent']['responses']['200']>;

export type ReopenResult = components['schemas']['ReopenResult'];
export type ReopenDealerIndentResponse = Json<operations['reopenDealerIndent']['responses']['200']>;

// ── accuracy ──
export type GetDealerAccuracyHistoryParams = NonNullable<operations['getDealerAccuracyHistory']['parameters']['query']>;
export type AccuracyHistoryResponse = components['schemas']['AccuracyHistoryResponse'];
export type AccuracyRow = components['schemas']['AccuracyRow'];
export type AccuracyMonth = components['schemas']['AccuracyMonth'];
export type GetDealerAccuracyHistoryResponse = Json<operations['getDealerAccuracyHistory']['responses']['200']>;

// ── errors ──
export type ApiErrorBody = components['schemas']['Error'];
