import PasswordGate from "../../../src/components/private-price/PasswordGate";
import { unlockPrivatePriceList } from "./actions";

export default function PrivatePricePasswordGate({ error, nextPath }: { error: boolean; nextPath: string }) {
  return <PasswordGate error={error} nextPath={nextPath} action={unlockPrivatePriceList} />;
}
