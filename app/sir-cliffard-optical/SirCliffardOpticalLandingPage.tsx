"use client";

import { useState } from "react";
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

const content = {
  en: {
    nav: {
      home: "Home",
      whyUs: "Why Work With Us",
      packages: "Packages",
      relensing: "Relensing",
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
    },
    hero: {
      eyebrow: "For Sir Cliffard Optical Customers",
      title: "Caribbean-focused optical support for practices that want quality, flexibility, and dependable service.",
      body:
        "From premium lenses to modern package options, safety solutions, and precise relensing of your existing patients' frames, we help Caribbean practices keep their optical offering strong and their workflow smooth.",
      badgeOne: "Caribbean-minded support",
      badgeTwo: "Modern lenses and coatings",
      badgeThree: "Accurate relensing of existing frames",
    },
    map: {
      eyebrow: "Regional Focus",
      title: "Built for Caribbean optical relationships.",
      body:
        "We understand the needs of practices serving island communities: dependable communication, clean ordering workflows, strong product support, and consistent lens accuracy.",
      panelTitle: "Where this page is focused",
      panelBody:
        "This landing page was designed with Caribbean customers in mind, with a visual direction inspired by the region and messaging centered on practical optical partnership.",
      points: [
        "Jamaica",
        "Puerto Rico",
        "Dominican Republic",
        "Trinidad & Tobago",
        "Barbados",
        "The Bahamas",
      ],
    },
    reasons: {
      eyebrow: "Why Work With Us",
      title: "Why practices choose to work with us.",
      intro:
        "You need more than a lab. You need a partner that helps your team recommend confidently, order clearly, and deliver eyewear your patients can trust.",
      items: [
        {
          title: "A broader lens offering",
          body:
            "We support lens options that help you serve everyday wearers, premium patients, occupational needs, and modern lifestyle demands.",
        },
        {
          title: "Modern package structure",
          body:
            "Our modern optical package helps simplify product conversations so staff can recommend with more clarity and less friction.",
        },
        {
          title: "Safety package support",
          body:
            "We help practices support workplace and occupational eyewear with practical safety package options and related resources.",
        },
        {
          title: "Accurate relensing",
          body:
            "When patients want to keep their current frames, we can relens existing frames with care and attention to accuracy.",
        },
        {
          title: "Coatings and premium finishing",
          body:
            "Strong lens performance is not only about design. Coatings, treatments, and finishing details matter, and we help you navigate them well.",
        },
        {
          title: "Responsive support",
          body:
            "We want communication to feel straightforward. Your team should know where to go, who to contact, and how to keep work moving.",
        },
      ],
    },
    packages: {
      eyebrow: "Offer Highlights",
      title: "What you can offer your patients.",
      cards: [
        {
          title: "Lenses",
          body:
            "Single vision, progressive, occupational, premium, and lifestyle-focused lens options that help practices meet a wide range of patient needs.",
        },
        {
          title: "Modern Optical Package",
          body:
            "A cleaner product path for practices that want a current, more intentional optical presentation with strong value and better recommendation flow.",
        },
        {
          title: "Safety Package",
          body:
            "Support for jobsite and occupational eyewear needs, including safety-oriented product paths and related ordering support.",
        },
        {
          title: "Relensing Existing Frames",
          body:
            "Patients often want to keep a frame they already love. We can help your practice relens existing patient frames accurately and professionally.",
        },
      ],
    },
    relensing: {
      eyebrow: "Relensing Support",
      title: "Keep the frame. Upgrade the vision.",
      body:
        "Relensing is especially valuable when a patient already owns a frame they love. Our team can help your practice upgrade the lenses while protecting the integrity of the frame and keeping measurements and prescription details in focus.",
      bullets: [
        "Ideal for patients attached to their current frame.",
        "Useful when the goal is better vision without replacing the full pair.",
        "Handled with care so your team can offer the option with confidence.",
      ],
    },
    ordering: {
      eyebrow: "Ordering With SpecCheck",
      title: "How ordering works.",
      body:
        "SpecCheck gives your team a practical way to manage lab workflow, billing, and account-related activity. If your practice wants to get started, Jeff can help guide the setup conversation.",
      steps: [
        {
          title: "Step 1: Contact Jeff",
          body:
            "Email Jeff to let him know your practice wants to learn more about ordering and account setup.",
        },
        {
          title: "Step 2: Share your practice details",
          body:
            "Include your practice name, island or location, main contact, and any current ordering needs so the setup process can move faster.",
        },
        {
          title: "Step 3: Create your account",
          body:
            "Once your information is reviewed, your team can be guided through account creation and the right ordering path for your practice.",
        },
        {
          title: "Step 4: Start ordering through SpecCheck",
          body:
            "After setup, your office can use SpecCheck for account workflow and ongoing ordering support.",
        },
      ],
      note:
        "If your team already has an established ordering workflow, Jeff can help you understand the best way to connect it.",
    },
    links: {
      eyebrow: "Helpful Links",
      title: "Explore more of the website.",
      body:
        "Use these links to move deeper into professional tools, product information, and company background.",
    },
    contact: {
      eyebrow: "Talk With Jeff",
      title: "Ready to learn more?",
      body:
        "Jeff is the contact for Sir Cliffard Optical customers who want to discuss lenses, packages, relensing support, and how to get started.",
      emailLabel: "Contact Jeff",
      emailValue: CONTACT_EMAIL,
      supportLine: "Email Jeff to learn more about setup, products, and next steps.",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      whyUs: "Por Qué Trabajar Con Nosotros",
      packages: "Paquetes",
      relensing: "Relentes",
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
    },
    hero: {
      eyebrow: "Para Clientes de Sir Cliffard Optical",
      title: "Soporte óptico enfocado en el Caribe para prácticas que buscan calidad, flexibilidad y servicio confiable.",
      body:
        "Desde lentes premium hasta opciones de paquete óptico moderno, soluciones de seguridad y relentes precisos en monturas existentes de sus pacientes, ayudamos a las prácticas del Caribe a mantener una oferta óptica fuerte y un flujo de trabajo ordenado.",
      badgeOne: "Soporte pensado para el Caribe",
      badgeTwo: "Lentes y tratamientos modernos",
      badgeThree: "Relentes precisos en monturas existentes",
    },
    map: {
      eyebrow: "Enfoque Regional",
      title: "Pensado para relaciones ópticas en el Caribe.",
      body:
        "Entendemos las necesidades de las prácticas que atienden comunidades isleñas: comunicación confiable, procesos de pedido claros, buen soporte de producto y precisión constante en los lentes.",
      panelTitle: "En qué se enfoca esta página",
      panelBody:
        "Esta página fue diseñada pensando en clientes del Caribe, con una dirección visual inspirada en la región y mensajes centrados en una colaboración óptica práctica.",
      points: [
        "Jamaica",
        "Puerto Rico",
        "República Dominicana",
        "Trinidad y Tobago",
        "Barbados",
        "Bahamas",
      ],
    },
    reasons: {
      eyebrow: "Por Qué Trabajar Con Nosotros",
      title: "Por qué las prácticas deciden trabajar con nosotros.",
      intro:
        "Necesita más que un laboratorio. Necesita un socio que ayude a su equipo a recomendar con confianza, pedir con claridad y entregar gafas en las que sus pacientes puedan confiar.",
      items: [
        {
          title: "Una oferta más amplia de lentes",
          body:
            "Ofrecemos opciones de lentes que ayudan a atender usuarios diarios, pacientes premium, necesidades ocupacionales y estilos de vida modernos.",
        },
        {
          title: "Estructura de paquete óptico moderno",
          body:
            "Nuestro paquete óptico moderno ayuda a simplificar la conversación de producto para que el personal recomiende con más claridad y menos fricción.",
        },
        {
          title: "Soporte para paquete de seguridad",
          body:
            "Ayudamos a las prácticas a atender gafas ocupacionales y de trabajo con opciones prácticas de paquete de seguridad y recursos relacionados.",
        },
        {
          title: "Relentes precisos",
          body:
            "Cuando los pacientes quieren conservar su montura actual, podemos relentar las monturas existentes con cuidado y atención a la precisión.",
        },
        {
          title: "Tratamientos y acabados premium",
          body:
            "El buen rendimiento del lente no depende solo del diseño. Los tratamientos, recubrimientos y acabados importan, y le ayudamos a manejarlos bien.",
        },
        {
          title: "Soporte ágil",
          body:
            "Queremos que la comunicación sea directa. Su equipo debe saber a dónde ir, con quién hablar y cómo mantener el trabajo avanzando.",
        },
      ],
    },
    packages: {
      eyebrow: "Aspectos Destacados",
      title: "Lo que puede ofrecer a sus pacientes.",
      cards: [
        {
          title: "Lentes",
          body:
            "Opciones de visión sencilla, progresivos, ocupacionales, premium y enfocadas en el estilo de vida para cubrir una amplia variedad de necesidades visuales.",
        },
        {
          title: "Paquete Óptico Moderno",
          body:
            "Una ruta de producto más clara para prácticas que quieren una presentación óptica actual, más intencional y con mejor flujo de recomendación.",
        },
        {
          title: "Paquete de Seguridad",
          body:
            "Soporte para necesidades ocupacionales y de seguridad, incluyendo rutas de producto orientadas a seguridad y apoyo relacionado con el pedido.",
        },
        {
          title: "Relentes en Monturas Existentes",
          body:
            "Muchos pacientes quieren conservar una montura que ya aman. Podemos ayudar a su práctica a relentar monturas existentes con precisión y profesionalismo.",
        },
      ],
    },
    relensing: {
      eyebrow: "Soporte de Relentes",
      title: "Conserve la montura. Mejore la visión.",
      body:
        "Relentar es especialmente valioso cuando un paciente ya tiene una montura que le encanta. Nuestro equipo puede ayudar a su práctica a mejorar los lentes mientras protege la integridad de la montura y mantiene el enfoque en las medidas y la receta.",
      bullets: [
        "Ideal para pacientes apegados a su montura actual.",
        "Útil cuando se busca mejor visión sin reemplazar el par completo.",
        "Se maneja con cuidado para que su equipo pueda ofrecerlo con confianza.",
      ],
    },
    ordering: {
      eyebrow: "Pedidos Con SpecCheck",
      title: "Cómo funciona el proceso de pedido.",
      body:
        "SpecCheck ofrece a su equipo una forma práctica de manejar el flujo de trabajo del laboratorio, la facturación y las actividades de la cuenta. Si su práctica quiere comenzar, Jeff puede ayudar a guiar la conversación de configuración.",
      steps: [
        {
          title: "Paso 1: Contacte a Jeff",
          body:
            "Envíe un correo a Jeff para informarle que su práctica quiere conocer más sobre pedidos y configuración de cuenta.",
        },
        {
          title: "Paso 2: Comparta los detalles de su práctica",
          body:
            "Incluya el nombre de la práctica, isla o ubicación, contacto principal y necesidades actuales de pedido para acelerar la configuración.",
        },
        {
          title: "Paso 3: Cree su cuenta",
          body:
            "Después de revisar su información, su equipo podrá recibir guía para crear la cuenta y definir la mejor ruta de pedido para la práctica.",
        },
        {
          title: "Paso 4: Empiece a pedir por SpecCheck",
          body:
            "Después de la configuración, su oficina podrá usar SpecCheck para el flujo de cuenta y el soporte continuo de pedidos.",
        },
      ],
      note:
        "Si su equipo ya tiene un flujo de pedido establecido, Jeff puede ayudarle a entender la mejor manera de conectarlo.",
    },
    links: {
      eyebrow: "Enlaces Útiles",
      title: "Explore más del sitio web.",
      body:
        "Use estos enlaces para profundizar en herramientas profesionales, información de producto y detalles de la empresa.",
    },
    contact: {
      eyebrow: "Hable Con Jeff",
      title: "¿Listo para conocer más?",
      body:
        "Jeff es el contacto para clientes de Sir Cliffard Optical que quieran hablar sobre lentes, paquetes, soporte de relentes y cómo comenzar.",
      emailLabel: "Contactar a Jeff",
      emailValue: CONTACT_EMAIL,
      supportLine: "Escriba a Jeff para conocer más sobre configuración, productos y próximos pasos.",
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
    "rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-medium text-white/88 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#d4c09a]/60 hover:bg-white/14";

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
      className="group rounded-[28px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_52px_rgba(28,20,13,0.08)] transition hover:-translate-y-1 hover:border-[#d4c09a] hover:bg-white"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
        Link
      </div>
      <h3 className="mt-3 text-2xl font-semibold text-[#1f1a17]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#625b53]">{body}</p>
      <span className="mt-5 inline-flex text-sm font-semibold text-[#8a7654] transition group-hover:translate-x-1">
        Visit section →
      </span>
    </Link>
  );
}

function CaribbeanMapCard({ text }: { text: (typeof content)["en"] | (typeof content)["es"] }) {
  const islands = [
    { name: text.map.points[0], left: "28%", top: "47%", x: 196, y: 202 },
    { name: text.map.points[1], left: "59%", top: "36%", x: 413, y: 155 },
    { name: text.map.points[2], left: "52%", top: "40%", x: 364, y: 172 },
    { name: text.map.points[3], left: "63%", top: "68%", x: 441, y: 292 },
    { name: text.map.points[4], left: "74%", top: "62%", x: 518, y: 266 },
    { name: text.map.points[5], left: "39%", top: "23%", x: 273, y: 99 },
  ];

  return (
    <div className="rounded-[34px] border border-white/12 bg-[linear-gradient(160deg,rgba(10,56,78,0.96),rgba(18,86,98,0.88)_42%,rgba(10,37,56,0.96))] p-5 shadow-[0_26px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-6">
      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_20%_18%,rgba(134,225,255,0.18),transparent_28%),linear-gradient(180deg,rgba(41,119,148,0.92),rgba(10,48,68,0.96))] p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_24%,rgba(255,220,150,0.12),transparent_18%),radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.09),transparent_16%)]" />
        <svg
          viewBox="0 0 700 430"
          className="relative z-10 h-auto w-full"
          role="img"
          aria-label={text.map.title}
        >
          <defs>
            <linearGradient id="shoreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f2d29f" />
              <stop offset="100%" stopColor="#d4c09a" />
            </linearGradient>
          </defs>

          <path
            d="M155 205c22-8 31-15 46-12 8 2 18 10 13 18-4 8-18 8-31 11-18 3-34 12-47 6-9-4-6-18 19-23Z"
            fill="url(#shoreGlow)"
            opacity="0.95"
          />
          <path
            d="M265 112c25-9 40-8 52-2 13 6 13 16 2 22-10 5-24 3-38 7-12 4-21 13-34 11-15-2-16-24 18-38Z"
            fill="url(#shoreGlow)"
            opacity="0.96"
          />
          <path
            d="M322 140c14-7 23-8 30-4 7 4 5 12-1 16-8 4-18 3-27 6-8 3-16 10-25 8-11-2-8-17 23-26Z"
            fill="url(#shoreGlow)"
            opacity="0.94"
          />
          <path
            d="M430 238c12-5 20-6 26-2 6 3 6 10 0 14-6 4-13 5-20 6-10 2-18 8-27 7-11-1-10-18 21-25Z"
            fill="url(#shoreGlow)"
            opacity="0.95"
          />
          <path
            d="M506 205c9-4 14-4 18-1 5 3 4 8-1 11-4 3-10 3-15 5-7 3-11 9-18 8-8-2-9-14 16-23Z"
            fill="url(#shoreGlow)"
            opacity="0.94"
          />
          <path
            d="M457 315c15-8 25-8 33-3 7 5 6 13-2 18-9 5-19 5-28 8-8 3-15 9-24 8-12-1-14-18 21-31Z"
            fill="url(#shoreGlow)"
            opacity="0.96"
          />

          {islands.map((island) => (
            <g key={island.name} transform={`translate(${island.x} ${island.y})`}>
              <circle
                cx="0"
                cy="0"
                r="9"
                fill="#d4c09a"
                className="aln-map-svg-pulse"
              />
            </g>
          ))}
        </svg>

        {islands.map((island) => (
          <div
            key={island.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: island.left, top: island.top }}
          >
            <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4c09a]/40 bg-[#d4c09a]/18 aln-map-pulse" />
            <span className="relative rounded-full border border-white/18 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur-md sm:text-xs">
              {island.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SirCliffardOpticalLandingPage() {
  const [language, setLanguage] = useState<Language>("en");
  const text = content[language];

  return (
    <main className="bg-[#f5f1eb] text-[#1f1a17]">
      <section
        id="top"
        data-theme="dark"
        className="relative overflow-hidden border-b border-white/10 bg-[#0d2433] text-white"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(97,188,190,0.3),transparent_28%),radial-gradient(circle_at_84%_22%,rgba(212,192,154,0.16),transparent_24%),linear-gradient(180deg,#123d4d_0%,#0f2736_48%,#171311_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,transparent,rgba(245,241,235,0.12))]" />

        <header className="relative z-20 border-b border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8 lg:px-10">
            <Link href="/" className="text-lg font-semibold tracking-[0.08em] text-white">
              Artisan Lab Network
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <NavLink href="#why-us">{text.nav.whyUs}</NavLink>
              <NavLink href="#packages">{text.nav.packages}</NavLink>
              <NavLink href="#ordering">{text.nav.ordering}</NavLink>
              <NavLink href="#contact">{text.nav.contact}</NavLink>
              <button
                type="button"
                onClick={() => setLanguage((current) => (current === "en" ? "es" : "en"))}
                className="rounded-full border border-[#d4c09a]/55 bg-[#d4c09a] px-4 py-2 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
                aria-label={text.ui.translate}
              >
                {text.ui.translate}
              </button>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-18 pt-16 md:px-8 md:pb-24 md:pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:pb-28 lg:pt-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#d4c09a]">
              {text.hero.eyebrow}
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              {text.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 md:text-lg">
              {text.hero.body}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
              >
                {text.ui.emailJeff}
              </a>
              <a
                href={SPEC_CHECK_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#d4c09a]/70 hover:bg-white/14"
              >
                {text.ui.openSpecCheck}
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {[text.hero.badgeOne, text.hero.badgeTwo, text.hero.badgeThree].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/14 bg-white/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/86 backdrop-blur-md"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:pt-4">
            <CaribbeanMapCard text={text} />
          </div>
        </div>
      </section>

      <motion.section
        id="map"
        data-theme="light"
        className="border-b border-[#e4d8c8] bg-[#f5f1eb] px-5 py-16 md:px-8 md:py-20 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              {text.map.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {text.map.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#625b53] md:text-lg">
              {text.map.body}
            </p>
          </div>

          <div className="rounded-[30px] border border-black/10 bg-white/80 p-7 shadow-[0_18px_58px_rgba(28,20,13,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
              {text.map.panelTitle}
            </p>
            <p className="mt-4 text-base leading-8 text-[#625b53]">{text.map.panelBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {text.map.points.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-[#d9c9b0] bg-[#fbf7f0] px-4 py-2 text-sm font-semibold text-[#1f1a17]"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="why-us"
        data-theme="light"
        className="bg-[#fbf8f3] px-5 py-16 md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              {text.reasons.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {text.reasons.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#625b53] md:text-lg">
              {text.reasons.intro}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {text.reasons.items.map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_52px_rgba(28,20,13,0.06)] transition hover:-translate-y-1 hover:border-[#d4c09a] hover:shadow-[0_24px_62px_rgba(28,20,13,0.12)]"
              >
                <h3 className="text-2xl font-semibold text-[#1f1a17]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#625b53]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="packages"
        data-theme="dark"
        className="border-y border-white/10 bg-[#171311] px-5 py-16 text-white md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
              {text.packages.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              {text.packages.title}
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {text.packages.cards.map((card) => (
              <article
                key={card.title}
                className="rounded-[28px] border border-white/12 bg-white/[0.065] p-6 shadow-[0_18px_56px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#d4c09a]/60 hover:bg-white/[0.085]"
              >
                <h3 className="text-2xl font-semibold">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/72">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="relensing"
        data-theme="light"
        className="bg-[#f5f1eb] px-5 py-16 md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[32px] border border-[#d9c9b0] bg-[linear-gradient(180deg,#f8f2e8_0%,#f0e6d7_100%)] p-8 shadow-[0_18px_58px_rgba(28,20,13,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              {text.relensing.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {text.relensing.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#625b53] md:text-lg">{text.relensing.body}</p>
          </div>

          <div className="grid gap-4">
            {text.relensing.bullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-[24px] border border-black/10 bg-white/84 p-5 shadow-[0_16px_42px_rgba(28,20,13,0.06)]"
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
        className="border-y border-[#e4d8c8] bg-[#fbf8f3] px-5 py-16 md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              {text.ordering.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {text.ordering.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#625b53] md:text-lg">
              {text.ordering.body}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {text.ordering.steps.map((step) => (
              <article
                key={step.title}
                className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_48px_rgba(28,20,13,0.06)]"
              >
                <h3 className="text-xl font-semibold text-[#1f1a17]">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#625b53]">{step.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[26px] border border-[#d9c9b0] bg-[#f4eadc] p-5 text-sm leading-7 text-[#52483d]">
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
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8c6a8] bg-white px-7 py-3 text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:border-[#d4c09a] hover:bg-[#d4c09a]"
            >
              {text.ui.openSpecCheck}
            </a>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="links"
        data-theme="light"
        className="bg-[#f6f1e9] px-5 py-16 md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              {text.links.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              {text.links.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#625b53] md:text-lg">{text.links.body}</p>
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
        className="border-t border-white/10 bg-[linear-gradient(180deg,#1f1a17_0%,#171311_100%)] px-5 py-16 text-white md:px-8 md:py-22 lg:px-10"
        {...sectionReveal}
      >
        <div className="mx-auto max-w-5xl rounded-[34px] border border-white/10 bg-white/[0.06] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
            {text.contact.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {text.contact.title}
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/74 md:text-lg">
            {text.contact.body}
          </p>

          <div className="mt-8 rounded-[26px] border border-white/10 bg-black/18 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
              {text.contact.emailLabel}
            </p>
            <a
              href={`mailto:${text.contact.emailValue}`}
              className="mt-3 block text-2xl font-semibold text-white transition hover:text-[#d4c09a] md:text-3xl"
            >
              {text.contact.emailValue}
            </a>
            <p className="mt-3 text-sm leading-7 text-white/68">{text.contact.supportLine}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
            >
              {text.ui.emailJeff}
            </a>
            <a
              href="#top"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/8 px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#d4c09a]/60 hover:bg-white/12"
            >
              {text.ui.backToTop}
            </a>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
