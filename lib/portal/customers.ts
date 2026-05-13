export type PortalCustomer = {
  accountNumber: string;
  practiceName: string;
  emails: string[];
  priceLists: string[];
};

export const customers: PortalCustomer[] = [
  {
    accountNumber: "0001",
    practiceName: "Artisan Lab Network Test Account",
    emails: ["jimdayok@me.com", "jim.day@artisanlabnetwork.com"],
    priceLists: ["P6", "G6", "B5", "A6", "S5", "VD"],
  },
  {
    accountNumber: "1000",
    practiceName: "ABC Optical",
    emails: ["doctor@abcoptical.com"],
    priceLists: ["P6"],
  },
  {
    accountNumber: "1002",
    practiceName: "Eyes Optical",
    emails: ["optician@eyes.com"],
    priceLists: ["G6", "B5"],
  },
];

export function getCustomerByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) return undefined;

  return customers.find((customer) =>
    customer.emails.some(
      (customerEmail) => customerEmail.trim().toLowerCase() === normalizedEmail
    )
  );
}
