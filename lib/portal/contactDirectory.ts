export type DirectoryContact = {
  name: string;
  title?: string;
  email: string;
  phone?: string;
  extension?: string;
  contactLabel?: string;
};

export type DirectoryLab = {
  id: string;
  name: string;
  shortName: string;
  customerServicePhone: string;
  customerServiceEmail: string;
  customerServiceTeam: DirectoryContact[];
  leadership: DirectoryContact[];
};

export const executiveDirectory: DirectoryContact[] = [
  {
    name: "Brandon Butler",
    title: "President & CEO",
    email: "brandon.butler@artisanlabnetwork.com",
    phone: "720-841-9237",
  },
  {
    name: "Rachel Ahlson",
    title: "VP & COO",
    email: "rahlson@artisanlabnetwork.com",
    phone: "971-222-5028",
  },
  {
    name: "Jim Day",
    title: "EVP, Sales & Marketing",
    email: "jim.day@artisanlabnetwork.com",
    phone: "269-352-3960",
  },
  {
    name: "Shelley Witmer",
    title: "Director of Customer Service",
    email: "switmer@artisanlabnetwork.com",
    phone: "360-773-7523",
  },
];

export const labDirectory: DirectoryLab[] = [
  {
    id: "pacific",
    name: "Pacific Artisan Labs",
    shortName: "Pacific",
    customerServicePhone: "877-390-6900",
    customerServiceEmail: "cspacific@pacificartisanlabs.com",
    customerServiceTeam: [
      { name: "Jill Curry", extension: "105", email: "jcurry@pacificartisanlabs.com" },
      { name: "Clareta Brant", extension: "101", email: "cbrant@pacificartisanlabs.com" },
      { name: "Leanne Rose", extension: "106", email: "leanne@pacificartisanlabs.com" },
      { name: "Noelle Pribeagu", extension: "100", email: "noelle@pacificartisanlabs.com" },
    ],
    leadership: [
      { name: "Josh Hinckley", title: "Production Manager", email: "jhinckley@pacificartisanlabs.com" },
      { name: "Jeff Asa", title: "Finish Manager", email: "jeff@pacificartisanlabs.com" },
    ],
  },
  {
    id: "peak",
    name: "Peak Artisan Labs",
    shortName: "Peak",
    customerServicePhone: "833-690-4321",
    customerServiceEmail: "cspeak@peakartisanlabs.com",
    customerServiceTeam: [
      { name: "Jennifer Conca", extension: "200", email: "jenn@peakartisanlabs.com" },
      { name: "Chasity Stowell", extension: "201", email: "chasity@peakartisanlabs.com" },
      { name: "Megan Medina", extension: "202", email: "megan@peakartisanlabs.com" },
    ],
    leadership: [
      { name: "John Castillo", title: "Lab Lead", email: "johnc@peakartisanlabs.com" },
      { name: "Jennifer Freelong", title: "Lab Lead", email: "jenf@peakartisanlabs.com" },
    ],
  },
  {
    id: "pike",
    name: "Pike Artisan Labs",
    shortName: "Pike",
    customerServicePhone: "888-239-0303",
    customerServiceEmail: "cspike@pikeartisanlabs.com",
    customerServiceTeam: [
      { name: "Savannah Reed", extension: "302", email: "sreed@pikeartisanlabs.com" },
      { name: "Jamila Jones", extension: "303", email: "jjones@pikeartisanlabs.com" },
    ],
    leadership: [
      {
        name: "Jess Dinnebeck",
        title: "Lab Manager",
        email: "JessD@pikeartisanlabs.com",
        phone: "971-303-2072",
        contactLabel: "Cell",
      },
    ],
  },
];

