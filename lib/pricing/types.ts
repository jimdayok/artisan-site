export type PriceListCode = "P6" | "G6" | "A6" | "B5" | "S5" | "VD";

export type PriceListPricingRow = {
  code: PriceListCode;
  brand: string;
  productNameRaw: string;
  productName: string;
  materialRaw: string;
  material: string;
  colorRaw: string;
  color: string;
  edgedPrice: number;
  uncutDeduct: number;
  uncutPrice: number;
};

export type PriceListGenerationReport = {
  sourceFiles: string[];
  rowCount: number;
  generatedAt: string;
  rawColumns: string[];
  mappedColumns: string[];
  ignoredColumns: string[];
  unmappedProducts: string[];
  unmappedMaterials: string[];
  unmappedColors: string[];
  assumptions: string[];
};

export type GeneratedPriceListData = {
  code: PriceListCode;
  rows: PriceListPricingRow[];
  report: PriceListGenerationReport;
};
