import GeneratedInteractivePriceListPage from "./GeneratedInteractivePriceListPage";

export default async function P6PriceListPage({
  previewAccountNumber,
}: {
  previewAccountNumber?: string;
}) {
  return <GeneratedInteractivePriceListPage code="P6" previewAccountNumber={previewAccountNumber} />;
}
