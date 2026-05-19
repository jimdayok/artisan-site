export type PriceListCode = "P6" | "G6" | "A6" | "B5" | "S5" | "VD";

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
};

export type PriceListArCoating = {
  name: string;
  brandFamily: string;
  price: number;
  notes?: string;
  recommended: boolean;
  outsourced: boolean;
};

export type PriceListGenerationReport = {
  sourceFiles: string[];
  rowCount: number;
  rawSourceRowsProcessed: number;
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
  assumptions: string[];
};

export type GeneratedPriceListData = {
  code: PriceListCode;
  rows: PriceListPricingRow[];
  arCoatings: PriceListArCoating[];
  report: PriceListGenerationReport;
};
