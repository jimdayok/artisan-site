export type PriceListCode = string;

export type PriceListPricingRow = {
  code: PriceListCode;
  id: string;
  brand: string;
  designType: string;
  designStyle: string;
  rawProductNames: string[];
  sourceCodes: string[];
  materialRaw: string;
  material: string;
  materialColor: string;
  colorRaw: string[];
  availableColors: string[];
  colorBrand: string;
  edgedPrice: number;
  uncutDeduct: number;
  uncutPrice: number;
  recommended: boolean;
  outsourced: boolean;
  serviceNotes: string[];
  duplicateSourceRows: number;
  coatingScheduleRef?: string;
  coatingOptions?: Array<{
    code: string;
    name: string;
    brandFamily: string;
    price: number;
    sourceSchedule: string;
    unresolved?: boolean;
  }>;
};

export type PriceListArCoating = {
  code?: string;
  name: string;
  brandFamily: string;
  price: number;
  sourceSchedule?: string;
  unresolved?: boolean;
  notes?: string;
  recommended: boolean;
  outsourced: boolean;
};

export type PriceListAddOnItem = {
  name: string;
  price: number | string;
  href?: string;
  notes?: string;
  recommended?: boolean;
  outsourced?: boolean;
};

export type PriceListAddOnSection = {
  title: string;
  items: PriceListAddOnItem[];
};

export type PriceListGenerationReport = {
  sourceFiles: string[];
  rowCount: number;
  rawSourceRowsProcessed: number;
  rowsExcludedMissingLookup: number;
  displayRowCount: number;
  generatedAt: string;
  rawColumns: string[];
  mappedColumns: string[];
  ignoredColumns: string[];
  unmappedProducts: string[];
  unmappedMaterials: string[];
  unmappedColors: string[];
  duplicatePriceConflictCount: number;
  duplicatePriceConflicts: string[];
  colorVariantsCollapsedCount: number;
  hiddenBronzeRowsCount?: number;
  unmappedArCodes?: string[];
  missingCoatSchedules?: string[];
  assumptions: string[];
};

export type GeneratedPriceListData = {
  code: PriceListCode;
  canonicalCode?: string;
  sourceCodesMerged?: string[];
  rows: PriceListPricingRow[];
  arCoatings: PriceListArCoating[];
  materialAddOns?: Array<{
    material: string;
    addOn: number;
  }>;
  addOnSections: PriceListAddOnSection[];
  report: PriceListGenerationReport;
};
