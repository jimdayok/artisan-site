export type ArTreatment = {
  slug: string;
  name: string;
  logo: string;
  headline: string;
  overview: string;
  warranty: string;
  icon: "moon" | "shield" | "blue" | "emerald";
  useCases: string[];
  benefits: string[];
  specs: string[];
};

export const arTreatments: ArTreatment[] = [
  {
    slug: "nytopia",
    name: "Artisan Nytopia",
    logo: "/ar/nytopia.png",
    headline: "Flagship nighttime performance with ultra premium optics.",
    overview:
      "Our flagship AR treatment uses targeted light wavelength manipulation to maximize nighttime driving performance with minimal reflectance. Scratch resistance is nearly as strong as Armour, with improved optics and a refined color residual that makes Nytopia our most preferred ultra premium option. Includes backside UV coating for safer vision and skin health.",
    warranty: "2 year warranty",
    icon: "moon",
    useCases: ["Nighttime driving", "Ultra premium lens recommendations", "Patients who want the best optics in the Artisan AR portfolio"],
    benefits: ["Targeted nighttime light management", "Near-Armour scratch resistance", "Backside UV protection included"],
    specs: ["Targeted wavelength manipulation", "Minimal reflectance", "Improved color residual"],
  },
  {
    slug: "armour",
    name: "Artisan Armour",
    logo: "/ar/armour.png",
    headline: "Our strongest ultra premium AR treatment.",
    overview:
      "Ultra durable, easy to clean, hydrophobic, oleophobic, anti-static, and made to last over 25,000 cleanings. Armour is the strongest ultra premium AR treatment in our portfolio and includes backside UV coating for safer vision and skin health.",
    warranty: "2 year warranty",
    icon: "shield",
    useCases: ["Patients who are hard on eyewear", "Ultra premium durability conversations", "High-cleaning or high-use lens environments"],
    benefits: ["Over 25,000 cleanings", "Hydrophobic and oleophobic performance", "Backside UV protection included"],
    specs: ["Anti-static surface", "Easy-clean lens experience", "Strongest Artisan durability"],
  },
  {
    slug: "azure",
    name: "Artisan Azure",
    logo: "/ar/azure.png",
    headline: "Blue light reflection and absorption with better cosmetics.",
    overview:
      "Azure is uniquely designed with a gentle, cosmetically appealing blue hue on the front surface while maintaining a minimal light tan reflection on the backside. This helps eliminate the backside reflections common with blue light focused coatings. Azure focuses on the most impactful blue light wavelengths while preserving optimal color and visual components. Includes backside UV coating.",
    warranty: "2 year warranty",
    icon: "blue",
    useCases: ["Blue light focused recommendations", "Patients who want a refined blue hue", "Patients bothered by backside reflections"],
    benefits: ["Blue light reflection and absorption", "Minimal backside light tan reflection", "Backside UV protection included"],
    specs: ["Front surface blue hue", "Backside reflection control", "Color-preserving visual profile"],
  },
  {
    slug: "emerald",
    name: "Artisan Emerald",
    logo: "/ar/emerald.png",
    headline: "Premium everyday AR with best-in-class anti-reflectance.",
    overview:
      "A premium everyday AR treatment with great scratch resistance, a terrific color hue for excellent cosmetics, and best-in-class anti-reflectance for the best vision possible, equal to Armour. Emerald is a strong contender for your everyday AR option and includes backside UV coating.",
    warranty: "2 year warranty",
    icon: "emerald",
    useCases: ["Premium everyday eyewear", "Everyday AR upgrade paths", "Patients who value cosmetics and clarity"],
    benefits: ["Best-in-class anti-reflectance", "Great scratch resistance", "Backside UV protection included"],
    specs: ["Excellent cosmetic hue", "Anti-reflectance equal to Armour", "Premium everyday performance"],
  },
];

export const arComparisonRows = [
  {
    artisan: "Artisan Nytopia",
    positioning: "Flagship ultra premium nighttime optics",
    peers: ["Crizal Sapphire", "Hoya Meiryo EX4+", "Shamir Glacier Expressions"],
  },
  {
    artisan: "Artisan Armour",
    positioning: "Ultra premium durability",
    peers: ["Crizal Rock", "Hoya EX3+", "Shamir Glacier Plus"],
  },
  {
    artisan: "Artisan Azure",
    positioning: "Blue light focused AR",
    peers: ["Hoya Recharge", "Crizal Prevencia"],
  },
  {
    artisan: "Artisan Emerald",
    positioning: "Premium everyday AR",
    peers: ["Crizal Easy Pro", "Hoya Super HiVision", "Shamir Glacier"],
  },
];

export function getArTreatment(slug: string) {
  return arTreatments.find((treatment) => treatment.slug === slug);
}
