"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type Language = "en" | "es";

const CONTACT_EMAIL = "sircliffordenterprises@gmail.com";
const SPEC_CHECK_URL = "https://www.speccheckrx.com/";

const sectionReveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.55, ease: "easeOut" },
} as const;

const territoryGroups = {
  en: [
    {
      title: "Northern Caribbean",
      items: [
        "Antigua",
        "Aruba",
        "Bahamas",
        "Bermuda",
        "Cayman Islands",
        "Curacao",
        "Turks & Caicos",
      ],
    },
    {
      title: "Eastern Caribbean",
      items: [
        "Barbados",
        "Grenada",
        "Guadeloupe",
        "Martinique",
        "St. Kitts",
        "St. Lucia",
        "Trinidad & Tobago",
      ],
    },
    {
      title: "Mainland and Greater Antilles",
      items: [
        "Belize",
        "Guyana",
        "Jamaica",
        "Mexico",
        "Suriname",
      ],
    },
    {
      title: "USVI and BVI",
      items: [
        "St. Thomas, USVI",
        "St. Croix, USVI",
        "St. Maarten",
        "Tortola, BVI",
      ],
    },
  ],
  es: [
    {
      title: "Caribe Norte",
      items: [
        "Antigua",
        "Aruba",
        "Bahamas",
        "Bermuda",
        "Islas Caimán",
        "Curazao",
        "Turks & Caicos",
      ],
    },
    {
      title: "Caribe Oriental",
      items: [
        "Barbados",
        "Granada",
        "Guadalupe",
        "Martinica",
        "San Cristóbal",
        "Santa Lucía",
        "Trinidad y Tobago",
      ],
    },
    {
      title: "Territorios Continentales y Antillas Mayores",
      items: [
        "Belice",
        "Guyana",
        "Jamaica",
        "México",
        "Surinam",
      ],
    },
    {
      title: "USVI y BVI",
      items: [
        "St. Thomas, USVI",
        "St. Croix, USVI",
        "St. Maarten",
        "Tortola, BVI",
      ],
    },
  ],
} as const;

const content = {
  en: {
    nav: {
      coverage: "Coverage",
      whyUs: "Why Work With Us",
      offerings: "Offerings",
      ordering: "Ordering",
      contact: "Contact Jeff",
      professionalServices: "Professional Services",
      coatings: "Coatings",
      lenses: "Lenses",
      about: "About Us",
    },
    ui: {
      translate: "Español",
      backToTop: "Back to top",
      emailJeff: "Email Jeff",
      openSpecCheck: "Open SpecCheck",
      exploreResources: "Explore Professional Resources",
      viewCoatings: "View Coatings & Product Info",
      viewLenses: "View Lens Resources",
      learnAboutUs: "Learn About Us",
      territoryLabel: "Territories served",
      coverageLabel: "Regional coverage",
      supportLabel: "Support model",
      islandLabel: "Built for island practices",
    },
    hero: {
      eyebrow: "For Sir Clifford Optical Customers",
      title: "A stronger optical partner for Caribbean and regional practices.",
      body:
        "Sir Clifford Optical customers can connect into a broader Artisan Lab Network offering with premium lenses, modern package options, relensing support, safety solutions, and a workflow designed to stay clear and dependable across territories.",
      badgeOne: "Regional practice support",
      badgeTwo: "Premium lenses and coatings",
      badgeThree: "Relensing with care",
      badgeFour: "SpecCheck ordering workflow",
    },
    heroPanel: {
      title: "Coverage across 23 territories",
      body:
        "From island practices to mainland partners, this page is designed to make the next step feel simple: understand the offering, see the footprint, and contact Jeff when you are ready to move.",
      stats: [
        { value: "23", label: "territories served" },
        { value: "4", label: "service regions" },
        { value: "1", label: "clear point of contact" },
      ],
      calloutTitle: "Designed for distance-friendly support",
      calloutBody:
        "Clear communication, practical product guidance, and a better recommendation flow for teams serving diverse patient needs.",
    },
    coverage: {
      eyebrow: "Regional Coverage",
      title: "Where Sir Clifford Optical support reaches.",
      body:
        "Instead of a map, here is the real footprint: the countries and territories currently served, organized so practices can quickly confirm fit and move forward.",
      noteTitle: "Not seeing your territory here?",
      noteBody:
        "Jeff can still help you understand whether the current ordering and support model fits your location, product needs, and account setup goals.",
    },
    reasons: {
      eyebrow: "Why Work With Us",
      title: "Why practices stay with this relationship.",
      intro:
        "The goal is not only to supply lenses. It is to help your team recommend with more confidence, protect workflow quality, and give patients a stronger finished result.",
      items: [
        {
          title: "Broader lens access",
          body:
            "Single vision, progressives, occupational options, premium designs, and specialty solutions help your office support more patient conversations without narrowing your choices.",
        },
        {
          title: "Modern package structure",
          body:
            "Simplified package thinking helps staff present value more clearly, reduce friction in recommendations, and make optical conversations easier to manage.",
        },
        {
          title: "Regional communication mindset",
          body:
            "Island and multi-territory practices need dependable communication. We focus on clarity, follow-through, and support that keeps orders moving.",
        },
        {
          title: "Relensing capability",
          body:
            "When a patient wants to keep a favorite frame, your team can offer a professional relensing path without compromising care or presentation.",
        },
        {
          title: "Safety and occupational options",
          body:
            "Support for safety-oriented eyewear expands what your practice can offer employers, working patients, and specialty use cases.",
        },
        {
          title: "Product guidance that helps staff sell",
          body:
            "Coatings, premium finishing, and lens design details matter. We help your team understand the story behind the product, not only the price.",
        },
      ],
    },
    offerings: {
      eyebrow: "What You Can Offer",
      title: "Built out for real optical conversations.",
      intro:
        "This is more than a single product line. It is a practical mix of lenses, coatings, packages, and service support your practice can use to build trust and close recommendations.",
      cards: [
        {
          title: "Premium Lens Portfolio",
          body:
            "Support everyday wearers, digitally heavy lifestyles, premium patients, and occupation-specific needs with a more complete optical menu.",
        },
        {
          title: "Modern Optical Package",
          body:
            "A cleaner recommendation path for practices that want current positioning, strong value, and better in-office presentation.",
        },
        {
          title: "Safety Package",
          body:
            "Practical support for worksite and occupational eyewear so your office can respond confidently when safety needs come up.",
        },
        {
          title: "Relensing Existing Frames",
          body:
            "Give patients a way to keep the frame they love while upgrading vision and preserving the quality standard your office expects.",
        },
      ],
      featureTitle: "A partner model, not a one-page price list",
      featureBody:
        "The site is built to guide practices from interest to action with clear next steps, resource links, and a single contact point for setup and product questions.",
      featureBullets: [
        "Cleaner product storytelling for staff",
        "Better support for premium recommendations",
        "Resources that keep the process moving",
      ],
    },
    relensing: {
      eyebrow: "Relensing Support",
      title: "Keep the frame. Elevate the experience.",
      body:
        "Relensing matters because patients often arrive attached to a frame they already trust. This service lets your practice deliver better vision without forcing a full replacement conversation every time.",
      bullets: [
        "Ideal for patients attached to their current frame.",
        "A strong option when the goal is improved vision without replacing the entire pair.",
        "Handled with care so your team can offer it confidently and professionally.",
      ],
    },
    ordering: {
      eyebrow: "Ordering With SpecCheck",
      title: "A clear path from first email to active ordering.",
      body:
        "SpecCheck supports workflow, billing, and account activity. Jeff can help your practice understand the setup path, gather the right details, and move toward an ordering flow that is practical for your location.",
      steps: [
        {
          title: "1. Reach out to Jeff",
          body:
            "Start with a direct email so the conversation can be tailored to your practice, territory, and product goals.",
        },
        {
          title: "2. Share practice details",
          body:
            "Include practice name, territory, main contact, and current ordering needs so setup can move efficiently.",
        },
        {
          title: "3. Align the right offering",
          body:
            "Review account needs, product fit, and the right support path before finalizing the workflow.",
        },
        {
          title: "4. Begin using SpecCheck",
          body:
            "Once setup is complete, your team can move into ongoing account activity and ordering support through SpecCheck.",
        },
      ],
      note:
        "If your office already has an existing workflow, Jeff can help you understand the best way to connect it rather than forcing unnecessary change.",
    },
    links: {
      eyebrow: "Helpful Links",
      title: "Go deeper when your team is ready.",
      body:
        "These links connect Sir Clifford Optical customers to the broader Artisan Lab Network resources, product information, and company background.",
    },
    contact: {
      eyebrow: "Talk With Jeff",
      title: "Ready to explore fit for your practice?",
      body:
        "Jeff is the point of contact for Sir Clifford Optical customers who want to talk through territory coverage, lens options, packages, relensing support, and account setup.",
      emailLabel: "Contact Jeff",
      emailValue: CONTACT_EMAIL,
      supportLine:
        "Send your practice name, territory, and what you want help with, and Jeff can guide the next step.",
    },
  },
  es: {
    nav: {
      coverage: "Cobertura",
      whyUs: "Por Qué Trabajar Con Nosotros",
      offerings: "Oferta",
      ordering: "Pedidos",
      contact: "Contactar a Jeff",
      professionalServices: "Servicios Profesionales",
      coatings: "Tratamientos",
      lenses: "Lentes",
      about: "Sobre Nosotros",
    },
    ui: {
      translate: "English",
      backToTop: "Volver arriba",
      emailJeff: "Enviar correo a Jeff",
      openSpecCheck: "Abrir SpecCheck",
      exploreResources: "Explorar Recursos Profesionales",
      viewCoatings: "Ver Tratamientos e Información",
      viewLenses: "Ver Recursos de Lentes",
      learnAboutUs: "Conocer Más",
      territoryLabel: "Territorios atendidos",
      coverageLabel: "Cobertura regional",
      supportLabel: "Modelo de soporte",
      islandLabel: "Pensado para prácticas isleñas",
    },
    hero: {
      eyebrow: "Para Clientes de Sir Clifford Optical",
      title: "Un socio óptico más sólido para prácticas del Caribe y la región.",
      body:
        "Los clientes de Sir Clifford Optical pueden conectarse con una oferta más amplia de Artisan Lab Network, con lentes premium, paquetes ópticos modernos, soporte de relentes, soluciones de seguridad y un flujo de trabajo claro y confiable entre territorios.",
      badgeOne: "Soporte regional para prácticas",
      badgeTwo: "Lentes y tratamientos premium",
      badgeThree: "Relentes con cuidado",
      badgeFour: "Flujo de pedidos con SpecCheck",
    },
    heroPanel: {
      title: "Cobertura en 23 territorios",
      body:
        "Desde prácticas en islas hasta socios en territorios continentales, esta página está diseñada para facilitar el siguiente paso: entender la oferta, ver la cobertura y contactar a Jeff cuando esté listo.",
      stats: [
        { value: "23", label: "territorios atendidos" },
        { value: "4", label: "regiones de servicio" },
        { value: "1", label: "punto claro de contacto" },
      ],
      calloutTitle: "Pensado para soporte a distancia",
      calloutBody:
        "Comunicación clara, guía práctica de producto y un mejor flujo de recomendación para equipos que atienden necesidades visuales diversas.",
    },
    coverage: {
      eyebrow: "Cobertura Regional",
      title: "Dónde llega el soporte de Sir Clifford Optical.",
      body:
        "En lugar de un mapa, aquí está la cobertura real: los países y territorios que actualmente se atienden, organizados para que una práctica confirme rápidamente si encaja.",
      noteTitle: "¿No ve su territorio aquí?",
      noteBody:
        "Jeff también puede ayudarle a entender si el modelo actual de pedidos y soporte se adapta a su ubicación, necesidades de producto y objetivos de configuración de cuenta.",
    },
    reasons: {
      eyebrow: "Por Qué Trabajar Con Nosotros",
      title: "Por qué las prácticas mantienen esta relación.",
      intro:
        "El objetivo no es solo surtir lentes. Es ayudar a su equipo a recomendar con más confianza, proteger la calidad del flujo de trabajo y entregar un mejor resultado final al paciente.",
      items: [
        {
          title: "Mayor acceso a lentes",
          body:
            "Visión sencilla, progresivos, opciones ocupacionales, diseños premium y soluciones especiales ayudan a su oficina a cubrir más conversaciones de pacientes sin limitar opciones.",
        },
        {
          title: "Estructura moderna de paquetes",
          body:
            "Un enfoque más simple de paquetes ayuda al personal a presentar valor con mayor claridad y a reducir fricción en la recomendación.",
        },
        {
          title: "Comunicación pensada para la región",
          body:
            "Las prácticas en islas y múltiples territorios necesitan comunicación confiable. Nos enfocamos en claridad, seguimiento y soporte que mantenga los pedidos avanzando.",
        },
        {
          title: "Capacidad de relentes",
          body:
            "Cuando un paciente quiere conservar una montura favorita, su equipo puede ofrecer una ruta profesional de relentes sin comprometer atención ni presentación.",
        },
        {
          title: "Opciones de seguridad y uso ocupacional",
          body:
            "El soporte para gafas de seguridad amplía lo que su práctica puede ofrecer a empleadores, pacientes activos y casos de uso especiales.",
        },
        {
          title: "Guía de producto que ayuda a vender",
          body:
            "Los tratamientos, acabados premium y detalles del diseño del lente importan. Ayudamos a su equipo a entender la historia del producto, no solo el precio.",
        },
      ],
    },
    offerings: {
      eyebrow: "Lo Que Puede Ofrecer",
      title: "Construido para conversaciones ópticas reales.",
      intro:
        "Esto es más que una sola línea de producto. Es una mezcla práctica de lentes, tratamientos, paquetes y soporte de servicio que su práctica puede usar para generar confianza y cerrar recomendaciones.",
      cards: [
        {
          title: "Portafolio Premium de Lentes",
          body:
            "Atienda usuarios diarios, estilos de vida digitales, pacientes premium y necesidades ocupacionales con un menú óptico más completo.",
        },
        {
          title: "Paquete Óptico Moderno",
          body:
            "Una ruta de recomendación más clara para prácticas que quieren posicionamiento actual, buen valor y mejor presentación en la oficina.",
        },
        {
          title: "Paquete de Seguridad",
          body:
            "Soporte práctico para gafas de trabajo y seguridad para que su oficina responda con confianza cuando surjan esas necesidades.",
        },
        {
          title: "Relentes en Monturas Existentes",
          body:
            "Dé a sus pacientes una forma de conservar la montura que aman mientras mejoran su visión y mantienen el estándar de calidad que su oficina espera.",
        },
      ],
      featureTitle: "Un modelo de socio, no una simple lista de precios",
      featureBody:
        "El sitio está construido para llevar a las prácticas del interés a la acción con pasos claros, enlaces útiles y un solo punto de contacto para configuración y preguntas de producto.",
      featureBullets: [
        "Mejor narrativa de producto para el personal",
        "Más apoyo para recomendaciones premium",
        "Recursos que mantienen el proceso avanzando",
      ],
    },
    relensing: {
      eyebrow: "Soporte de Relentes",
      title: "Conserve la montura. Eleve la experiencia.",
      body:
        "El relente importa porque muchos pacientes llegan apegados a una montura que ya conocen. Este servicio le permite a su práctica ofrecer mejor visión sin forzar una conversación de reemplazo completo cada vez.",
      bullets: [
        "Ideal para pacientes apegados a su montura actual.",
        "Una opción sólida cuando la meta es mejorar la visión sin reemplazar el par completo.",
        "Se maneja con cuidado para que su equipo lo ofrezca con confianza y profesionalismo.",
      ],
    },
    ordering: {
      eyebrow: "Pedidos Con SpecCheck",
      title: "Un camino claro desde el primer correo hasta pedidos activos.",
      body:
        "SpecCheck apoya el flujo de trabajo, la facturación y la actividad de la cuenta. Jeff puede ayudar a su práctica a entender el proceso de configuración, reunir la información correcta y avanzar hacia un flujo de pedidos práctico para su territorio.",
      steps: [
        {
          title: "1. Escriba a Jeff",
          body:
            "Comience con un correo directo para adaptar la conversación a su práctica, territorio y objetivos de producto.",
        },
        {
          title: "2. Comparta detalles de la práctica",
          body:
            "Incluya nombre de la práctica, territorio, contacto principal y necesidades actuales para que la configuración avance con eficiencia.",
        },
        {
          title: "3. Alinee la oferta correcta",
          body:
            "Revise necesidades de cuenta, ajuste de producto y la mejor ruta de soporte antes de cerrar el flujo.",
        },
        {
          title: "4. Empiece a usar SpecCheck",
          body:
            "Una vez completada la configuración, su equipo puede avanzar a la actividad continua de la cuenta y el soporte de pedidos en SpecCheck.",
        },
      ],
      note:
        "Si su oficina ya tiene un flujo establecido, Jeff puede ayudarle a conectarlo sin forzar cambios innecesarios.",
    },
    links: {
      eyebrow: "Enlaces Útiles",
      title: "Profundice cuando su equipo esté listo.",
      body:
        "Estos enlaces conectan a los clientes de Sir Clifford Optical con los recursos más amplios de Artisan Lab Network, información de producto y antecedentes de la empresa.",
    },
    contact: {
      eyebrow: "Hable Con Jeff",
      title: "¿Listo para explorar si encaja con su práctica?",
      body:
        "Jeff es el punto de contacto para clientes de Sir Clifford Optical que quieran hablar sobre cobertura territorial, opciones de lentes, paquetes, soporte de relentes y configuración de cuenta.",
      emailLabel: "Contactar a Jeff",
      emailValue: CONTACT_EMAIL,
      supportLine:
        "Envíe el nombre de su práctica, territorio y el tipo de ayuda que necesita para que Jeff guíe el siguiente paso.",
    },
  },
} as const;

const quickLinks = [
  {
    key: "professionalServices",
    href: "/provider-resources/professional-resources",
  },
  {
    key: "coatings",
    href: "/provider-resources#product-information",
  },
  {
    key: "lenses",
    href: "/provider-resources#artisan-lens-system-resources",
  },
  {
    key: "about",
    href: "/about",
  },
] as const;

function NavLink({ href, children }: { href: string; children: string }) {
  const className =
    "rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm font-medium text-white/86 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#f0d9a6]/60 hover:bg-white/12";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function ResourceLink({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[30px] border border-[#d8c9b5] bg-[#fffaf2] p-6 shadow-[0_18px_52px_rgba(30,24,18,0.08)] transition hover:-translate-y-1 hover:border-[#d0af73] hover:shadow-[0_26px_70px_rgba(30,24,18,0.14)]"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9d7d46]">
        Link
      </div>
      <h3 className="mt-3 text-2xl font-semibold text-[#1f1a17]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#655b51]">{body}</p>
      <span className="mt-5 inline-flex text-sm font-semibold text-[#9d7d46] transition group-hover:translate-x-1">
        Visit section →
      </span>
    </Link>
  );
}

function HeroSignalCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/12 bg-black/18 p-5 backdrop-blur-md">
      <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/62">
        {label}
      </div>
    </div>
  );
}

function TerritoryColumn({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <article className="rounded-[28px] border border-[#dbcab4] bg-white/82 p-6 shadow-[0_18px_48px_rgba(30,24,18,0.07)]">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9d7d46]">
        {title}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[#e2d3bf] bg-[#fbf5eb] px-4 py-2 text-sm font-semibold text-[#2f2924]"
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function SirCliffordOpticalLandingPage() {
  const [language, setLanguage] = useState<Language>("en");
  const text = content[language];
  const groupedTerritories = territoryGroups[language];

  return (
    <main className="bg-[#f4ede3] text-[#1f1a17]">
      <section
        id="top"
        data-theme="dark"
        className="relative overflow-hidden border-b border-white/10 bg-[#081f2c] text-white"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(53,166,193,0.34),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(240,217,166,0.16),transparent_20%),radial-gradient(circle_at_55%_78%,rgba(32,112,104,0.22),transparent_26%),linear-gradient(180deg,#0f3f52_0%,#0f2736_46%,#0d1820_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent,rgba(244,237,227,0.16))]" />
        <div className="pointer-events-none absolute left-[-12%] top-[18%] h-72 w-72 rounded-full bg-[#3aa2be]/18 blur-3xl" />
        <div className="pointer-events-none absolute right-[-10%] top-[8%] h-80 w-80 rounded-full bg-[#efcc85]/12 blur-3xl" />

        <header className="relative z-20 border-b border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8 lg:px-10">
            <Link href="/" className="flex shrink-0 items-center" aria-label="Artisan Lab Network">
              <Image
                src="/aln-white-logo.png"
                alt="Artisan Lab Network"
                width={1000}
                height={471}
                priority
                className="h-12 w-auto object-contain md:h-[60px]"
              />
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <NavLink href="#coverage">{text.nav.coverage}</NavLink>
              <NavLink href="#why-us">{text.nav.whyUs}</NavLink>
              <NavLink href="#offerings">{text.nav.offerings}</NavLink>
              <NavLink href="#ordering">{text.nav.ordering}</NavLink>
              <NavLink href="#contact">{text.nav.contact}</NavLink>
              <button
                type="button"
                onClick={() => setLanguage((current) => (current === "en" ? "es" : "en"))}
                className="rounded-full border border-[#f0d9a6]/60 bg-[#f0d9a6] px-4 py-2 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#f5e2b6]"
                aria-label={text.ui.translate}
              >
                {text.ui.translate}
              </button>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-18 pt-16 md:px-8 md:pb-24 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28 lg:pt-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#f0d9a6]">
              {text.hero.eyebrow}
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl">
              {text.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              {text.hero.body}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f0d9a6] px-7 py-3 text-sm font-semibold text-[#171311] shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-[#f5e2b6]"
              >
                {text.ui.emailJeff}
              </a>
              <a
                href={SPEC_CHECK_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/8 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#f0d9a6]/70 hover:bg-white/14"
              >
                {text.ui.openSpecCheck}
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {[text.hero.badgeOne, text.hero.badgeTwo, text.hero.badgeThree, text.hero.badgeFour].map(
                (badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/14 bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/86 backdrop-blur-md"
                  >
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="lg:pt-3">
            <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(240,217,166,0.18),transparent_24%),radial-gradient(circle_at_10%_90%,rgba(75,182,199,0.2),transparent_26%)]" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f0d9a6]">
                  {text.ui.coverageLabel}
                </p>
                <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight md:text-4xl">
                  {text.heroPanel.title}
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-white/72 md:text-base">
                  {text.heroPanel.body}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {text.heroPanel.stats.map((stat) => (
                    <HeroSignalCard key={stat.label} label={stat.label} value={stat.value} />
                  ))}
                </div>

                <div className="mt-8 rounded-[28px] border border-white/12 bg-black/18 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0d9a6]">
                    {text.heroPanel.calloutTitle}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/74">
                    {text.heroPanel.calloutBody}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
                  <span>{text.ui.territoryLabel}</span>
                  <span className="text-[#f0d9a6]">Antigua</span>
                  <span className="text-[#f0d9a6]">Jamaica</span>
                  <span className="text-[#f0d9a6]">Mexico</span>
                  <span className="text-[#f0d9a6]">Trinidad & Tobago</span>
                  <span className="text-[#f0d9a6]">USVI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <motion.section
        id="coverage"
        data-theme="light"
        className="border-b border-[#e6d6c0] bg-[#f4ede3] px-5 py-16 md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9d7d46]">
                {text.coverage.eyebrow}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
                {text.coverage.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#655b51] md:text-lg">
                {text.coverage.body}
              </p>

              <div className="mt-8 rounded-[30px] border border-[#d8c7b2] bg-[#fbf5eb] p-6 shadow-[0_18px_48px_rgba(30,24,18,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9d7d46]">
                  {text.coverage.noteTitle}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#655b51]">{text.coverage.noteBody}</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mt-5 inline-flex rounded-full border border-[#d0af73] px-4 py-2 text-sm font-semibold text-[#5b4725] transition hover:-translate-y-0.5 hover:bg-[#f3e5c7]"
                >
                  {text.ui.emailJeff}
                </a>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {groupedTerritories.map((group) => (
                <TerritoryColumn key={group.title} title={group.title} items={group.items} />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="why-us"
        data-theme="light"
        className="bg-[#fbf7f0] px-5 py-16 md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9d7d46]">
              {text.reasons.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {text.reasons.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#655b51] md:text-lg">
              {text.reasons.intro}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {text.reasons.items.map((item) => (
              <article
                key={item.title}
                className="rounded-[30px] border border-[#e2d3bf] bg-white p-6 shadow-[0_18px_52px_rgba(30,24,18,0.06)] transition hover:-translate-y-1 hover:border-[#d0af73] hover:shadow-[0_24px_62px_rgba(30,24,18,0.12)]"
              >
                <h3 className="text-2xl font-semibold text-[#1f1a17]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#655b51]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="offerings"
        data-theme="dark"
        className="border-y border-white/10 bg-[#15120f] px-5 py-16 text-white md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f0d9a6]">
              {text.offerings.eyebrow}
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              {text.offerings.title}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 md:text-lg">
              {text.offerings.intro}
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {text.offerings.cards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[28px] border border-white/12 bg-white/[0.065] p-6 shadow-[0_18px_56px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#f0d9a6]/60 hover:bg-white/[0.09]"
                >
                  <h3 className="text-2xl font-semibold">{card.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/72">{card.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_76px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f0d9a6]">
              {text.ui.supportLabel}
            </p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight">
              {text.offerings.featureTitle}
            </h3>
            <p className="mt-5 text-base leading-8 text-white/72">{text.offerings.featureBody}</p>
            <div className="mt-8 grid gap-4">
              {text.offerings.featureBullets.map((bullet) => (
                <div
                  key={bullet}
                  className="rounded-[24px] border border-white/10 bg-black/18 p-5 text-sm leading-7 text-white/82"
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="relensing"
        data-theme="light"
        className="bg-[#f4ede3] px-5 py-16 md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="rounded-[34px] border border-[#dbcab4] bg-[linear-gradient(180deg,#f9f2e5_0%,#f0e2cc_100%)] p-8 shadow-[0_18px_58px_rgba(30,24,18,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9d7d46]">
              {text.relensing.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {text.relensing.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#655b51] md:text-lg">{text.relensing.body}</p>
          </div>

          <div className="grid gap-4">
            {text.relensing.bullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-[26px] border border-[#e2d3bf] bg-white/88 p-5 shadow-[0_16px_42px_rgba(30,24,18,0.06)]"
              >
                <p className="text-base leading-7 text-[#1f1a17]">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="ordering"
        data-theme="light"
        className="border-y border-[#e6d6c0] bg-[#fbf7f0] px-5 py-16 md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9d7d46]">
              {text.ordering.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {text.ordering.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#655b51] md:text-lg">
              {text.ordering.body}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {text.ordering.steps.map((step) => (
              <article
                key={step.title}
                className="rounded-[28px] border border-[#e2d3bf] bg-white p-6 shadow-[0_18px_48px_rgba(30,24,18,0.06)]"
              >
                <h3 className="text-xl font-semibold text-[#1f1a17]">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#655b51]">{step.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[26px] border border-[#dbcab4] bg-[#f4e8d6] p-5 text-sm leading-7 text-[#52483d]">
            {text.ordering.note}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1f1a17] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3d3129]"
            >
              {text.ui.emailJeff}
            </a>
            <a
              href={SPEC_CHECK_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d0af73] bg-white px-7 py-3 text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:border-[#d0af73] hover:bg-[#f3e5c7]"
            >
              {text.ui.openSpecCheck}
            </a>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="links"
        data-theme="light"
        className="bg-[#f2eadf] px-5 py-16 md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9d7d46]">
              {text.links.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {text.links.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#655b51] md:text-lg">{text.links.body}</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <ResourceLink
              href={quickLinks[0].href}
              title={text.nav.professionalServices}
              body={text.ui.exploreResources}
            />
            <ResourceLink
              href={quickLinks[1].href}
              title={text.nav.coatings}
              body={text.ui.viewCoatings}
            />
            <ResourceLink
              href={quickLinks[2].href}
              title={text.nav.lenses}
              body={text.ui.viewLenses}
            />
            <ResourceLink
              href={quickLinks[3].href}
              title={text.nav.about}
              body={text.ui.learnAboutUs}
            />
          </div>
        </div>
      </motion.section>

      <motion.section
        id="contact"
        data-theme="dark"
        className="border-t border-white/10 bg-[linear-gradient(180deg,#171311_0%,#0d1013_100%)] px-5 py-16 text-white md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-5xl rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f0d9a6]">
            {text.contact.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {text.contact.title}
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/74 md:text-lg">
            {text.contact.body}
          </p>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-black/18 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0d9a6]">
              {text.contact.emailLabel}
            </p>
            <a
              href={`mailto:${text.contact.emailValue}`}
              className="mt-3 block text-2xl font-semibold text-white transition hover:text-[#f0d9a6] md:text-3xl"
            >
              {text.contact.emailValue}
            </a>
            <p className="mt-3 text-sm leading-7 text-white/68">{text.contact.supportLine}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f0d9a6] px-7 py-3 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#f5e2b6]"
            >
              {text.ui.emailJeff}
            </a>
            <a
              href="#top"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/8 px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#f0d9a6]/60 hover:bg-white/12"
            >
              {text.ui.backToTop}
            </a>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
