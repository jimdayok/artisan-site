export type ArTreatment = {
  slug: string;
  name: string;
  logo: string;
  headline: string;
  overview: string;
  useCases: string[];
  benefits: string[];
};

export const arTreatments: ArTreatment[] = [
  {
    slug: "armour",
    name: "Armour",
    logo: "/ar/armour.png",
    headline: "Durable everyday AR performance.",
    overview:
      "Durable everyday AR performance for patients who need reliable clarity.",
    useCases: ["Everyday eyewear", "Value-conscious premium upgrades", "Patients who need dependable durability"],
    benefits: ["Reliable visual performance", "Durable treatment option", "Clean everyday appearance"],
  },
  {
    slug: "azure",
    name: "Azure",
    logo: "/ar/azure.png",
    headline: "Balanced clarity and appearance.",
    overview:
      "Balanced clarity and appearance with clean visual performance.",
    useCases: ["Daily wear", "Patients who want a polished lens appearance", "General premium AR recommendations"],
    benefits: ["Balanced reflection profile", "Dependable visual comfort", "Strong everyday presentation"],
  },
  {
    slug: "emerald",
    name: "Emerald",
    logo: "/ar/emerald.png",
    headline: "Premium clarity and comfort.",
    overview:
      "Premium clarity and comfort for strong everyday performance.",
    useCases: ["Premium everyday eyewear", "Patients sensitive to glare", "High-use office and driving environments"],
    benefits: ["Enhanced clarity", "Comfortable viewing experience", "Premium patient presentation"],
  },
  {
    slug: "nytopia",
    name: "Nytopia",
    logo: "/ar/nytopia.png",
    headline: "Artisan’s premium AR experience.",
    overview:
      "Artisan’s premium AR experience for advanced clarity, durability, and visual comfort.",
    useCases: ["Demanding visual environments", "Premium lens packages", "Patients who want Artisan’s strongest AR experience"],
    benefits: ["Advanced clarity", "Premium durability", "Elevated visual comfort"],
  },
];

export function getArTreatment(slug: string) {
  return arTreatments.find((treatment) => treatment.slug === slug);
}
