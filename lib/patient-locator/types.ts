export type ApprovedPractice = {
  id: string;
  name: string;
  acctId: string;
  accountNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  insurances: string[];
  numberOfLocations: number;
  placeId?: string;
  hasTokai: boolean;
  isEquityPartner: boolean;
};

export type PracticeWithDistance = ApprovedPractice & {
  latitude?: number;
  longitude?: number;
  distanceMiles?: number;
  googleMapsUrl?: string;
  geocodedAddress?: string;
};
