import Image from "next/image";

const trustLogos = [
  { name: "SpecCheck", src: "/logos/speccheck.png" },
  { name: "NBN", src: "/logos/nbn-logo.png" },
  { name: "Acquios Alliance", src: "/logos/acquios-alliance.png" },
  { name: "Vision Council", src: "/logos/TheVisionCouncil-logo-IAPB-Member.png" },
  { name: "Ultimate Partner", src: "/logos/ultimate-partners.png" },
  { name: "Global Optics", src: "/logos/globaloptics.png" },
];

export default function TrustBar() {
  return (
    <div className="border-y border-white/10 bg-[#14110f]/92">
      <div className="mx-auto max-w-7xl px-6 py-5 md:px-10">
        <div className="flex gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-6 md:items-center">
          {trustLogos.map((logo) => (
            <div
              key={logo.name}
              className="flex h-14 min-w-[150px] items-center justify-center rounded-2xl border border-white/8 bg-white/[0.035] px-4 opacity-70 transition hover:opacity-90"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={220}
                height={90}
                className="max-h-9 w-auto max-w-[125px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
