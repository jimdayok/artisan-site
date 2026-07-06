export type EmployeeResourceStatus = "available" | "coming-soon" | "future";

export type EmployeeResource = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  vendor?: string;
  tags: string[];
  fileType: string;
  dateAdded: string;
  href?: string;
  external?: boolean;
  version?: string;
  lastUpdated?: string;
  featured?: boolean;
  recentlyAdded?: boolean;
  status: EmployeeResourceStatus;
};

export type EmployeeResourceCategory = {
  id: string;
  title: string;
  purpose: string;
};

export const employeeResourceCategories: EmployeeResourceCategory[] = [
  { id: "product", title: "Product Resources", purpose: "Product guides and vendor support materials." },
  { id: "forms", title: "Internal Forms", purpose: "Forms used by customer service, sales, and account support." },
  { id: "sop", title: "SOP Library", purpose: "Framework for customer service, sales, operations, and quality procedures." },
  { id: "sales", title: "Sales Toolkit", purpose: "Sales sheets, program talking points, comparisons, and objection handling." },
  { id: "marketing", title: "Marketing Toolkit", purpose: "Social assets, counter cards, email templates, campaigns, and recall programs." },
  { id: "company", title: "Company Reference", purpose: "Internal company reference, lab, network, program, and contact materials." },
];

export const employeeResources: EmployeeResource[] = [
  {
    id: "chemclip-order-form",
    title: "ChemClip Order Form",
    description: "Internal and customer-support reference for ChemClip order submission and follow-up.",
    category: "forms",
    subcategory: "Internal Forms",
    vendor: "Chemistrie",
    tags: ["chemclip", "chemistrie", "forms", "orders"],
    fileType: "Form",
    dateAdded: "2026-06-04",
    href: "/provider-resources#specialty-systems",
    version: "Phase 1",
    lastUpdated: "2026-06-04",
    featured: true,
    recentlyAdded: true,
    status: "available",
  },
  {
    id: "crizal-product-guide",
    title: "Crizal Product Guide",
    description: "Crizal and Essilor AR positioning resources for product support and sales conversations.",
    category: "product",
    subcategory: "Product Resources",
    vendor: "Essilor",
    tags: ["crizal", "essilor", "ar", "product guide"],
    fileType: "Guide",
    dateAdded: "2026-06-04",
    href: "/provider-resources#varilux-crizal",
    featured: true,
    recentlyAdded: true,
    status: "available",
  },
  {
    id: "varilux-immersia-sales-aid",
    title: "Varilux Immersia Sales Aid",
    description: "Sales aid for positioning Varilux Immersia and supporting premium progressive conversations.",
    category: "product",
    subcategory: "Product Resources",
    vendor: "Varilux",
    tags: ["varilux", "immersia", "sales aid", "progressive"],
    fileType: "Sales Aid",
    dateAdded: "2026-06-04",
    href: "/provider-resources#varilux-crizal",
    featured: true,
    recentlyAdded: true,
    status: "available",
  },
  {
    id: "unity-v3-whitepaper",
    title: "Unity V3 Whitepaper",
    description: "Unity V3 technical and positioning framework for internal support and rewards conversations.",
    category: "product",
    subcategory: "Product Resources",
    vendor: "Unity",
    tags: ["unity", "v3", "whitepaper", "rewards"],
    fileType: "Whitepaper",
    dateAdded: "2026-06-04",
    href: "/provider-resources#unity-rewards",
    featured: true,
    recentlyAdded: true,
    status: "available",
  },
  {
    id: "driver-intelligence-technical-guide",
    title: "Driver Intelligence Technical Guide",
    description: "Technical guide placeholder for Driver Intelligence and future internal training support.",
    category: "product",
    subcategory: "Product Resources",
    vendor: "Artisan",
    tags: ["driver intelligence", "technical", "training"],
    fileType: "Guide",
    dateAdded: "2026-06-04",
    featured: true,
    recentlyAdded: true,
    status: "coming-soon",
  },
  ...[
    "Varilux", "Crizal", "Shamir", "Unity", "Neurolens", "Hoya", "Tokai", "Chemistrie", "TechShield", "Sequel",
  ].map((vendor) => ({
    id: `product-${vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title: `${vendor} Resource Library`,
    description: `${vendor} product guides, positioning materials, technical documents, and vendor support references.`,
    category: "product",
    subcategory: "Product Resources",
    vendor,
    tags: [vendor.toLowerCase(), "product", "vendor", "resource library"],
    fileType: "Library",
    dateAdded: "2026-06-04",
    href: "/provider-resources",
    status: vendor === "Varilux" || vendor === "Crizal" || vendor === "Tokai" || vendor === "Chemistrie" || vendor === "Sequel" ? "available" : "coming-soon",
  } satisfies EmployeeResource)),
  ...[
    ["new-account-forms", "New Account Forms", "New account setup forms and onboarding intake checklist."],
    ["customer-update-forms", "Customer Update Forms", "Account/contact update forms for customer service and sales support."],
    ["warranty-forms", "Warranty Forms", "Warranty submission and follow-up framework."],
    ["redo-forms", "Redo Forms", "Redo documentation and remake intake framework."],
  ].map(([id, title, description]) => ({
    id,
    title,
    description,
    category: "forms",
    subcategory: "Internal Forms",
    tags: ["forms", "customer service", title.toLowerCase()],
    fileType: "Form",
    dateAdded: "2026-06-04",
    status: "coming-soon",
  } satisfies EmployeeResource)),
  ...[
    ["sop-handling-redos", "Handling Redos", "Customer service SOP framework for remake and redo handling.", "Customer Service"],
    ["sop-handling-non-adapts", "Handling Non-Adapts", "Customer service SOP framework for non-adapt support.", "Customer Service"],
    ["sop-escalation-procedures", "Escalation Procedures", "Escalation path framework for customer service and lab support.", "Customer Service"],
    ["sop-new-account-setup", "New Account Setup", "Sales SOP framework for account setup and onboarding.", "Sales"],
    ["sop-program-enrollment", "Program Enrollment", "Sales SOP framework for rewards and program enrollment.", "Sales"],
    ["sop-territory-management", "Territory Management", "Sales SOP framework for territory planning and account coverage.", "Sales"],
    ["sop-shipping-processes", "Shipping Processes", "Operations SOP framework for shipping workflows.", "Operations"],
    ["sop-frame-handling", "Frame Handling", "Operations SOP framework for frame handling and documentation.", "Operations"],
    ["sop-quality-procedures", "Quality Procedures", "Operations SOP framework for quality review and issue tracking.", "Operations"],
  ].map(([id, title, description, subcategory]) => ({
    id,
    title,
    description,
    category: "sop",
    subcategory,
    tags: ["sop", subcategory.toLowerCase(), title.toLowerCase()],
    fileType: "SOP",
    dateAdded: "2026-06-04",
    status: "coming-soon",
  } satisfies EmployeeResource)),
  ...[
    ["sales-sheets", "Sales Sheets", "Customer-facing sales sheets and internal program summaries."],
    ["competitive-comparisons", "Competitive Comparisons", "Competitive comparison framework for sales conversations."],
    ["product-positioning-guides", "Product Positioning Guides", "Product recommendation and positioning guides."],
    ["objection-handling-guides", "Objection Handling Guides", "Common objection handling and talk tracks."],
    ["program-talking-points", "Program Talking Points", "Rewards, package, and program talking points."],
  ].map(([id, title, description]) => ({
    id,
    title,
    description,
    category: "sales",
    subcategory: "Sales Toolkit",
    tags: ["sales", "toolkit", title.toLowerCase()],
    fileType: "Toolkit",
    dateAdded: "2026-06-04",
    status: "coming-soon",
  } satisfies EmployeeResource)),
  ...[
    ["social-media-assets", "Social Media Assets", "Practice-facing and ALN social asset framework."],
    ["posters", "Posters", "Poster and in-office collateral framework."],
    ["counter-cards", "Counter Cards", "Counter card and dispense counter collateral framework."],
    ["email-templates", "Email Templates", "Email template framework for campaigns and customer communication."],
    ["campaign-assets", "Campaign Assets", "Campaign asset library framework."],
    ["recall-programs", "Recall Programs", "Recall campaign and practice growth framework."],
  ].map(([id, title, description]) => ({
    id,
    title,
    description,
    category: "marketing",
    subcategory: "Marketing Toolkit",
    tags: ["marketing", "assets", title.toLowerCase()],
    fileType: "Asset",
    dateAdded: "2026-06-04",
    status: "coming-soon",
  } satisfies EmployeeResource)),
  ...[
    ["organizational-structure", "ALN Organizational Structure", "Company structure and functional ownership framework."],
    ["lab-information", "Lab Information", "Lab locations, capabilities, and support contacts."],
    ["program-overview", "Program Overview", "Internal program summary and reference framework."],
    ["ownership-model", "Ownership Model", "Internal reference for ALN ownership and partnership model."],
    ["network-history", "Network History", "Company and network history reference framework."],
  ].map(([id, title, description]) => ({
    id,
    title,
    description,
    category: "company",
    subcategory: "Company Reference",
    tags: ["company", "reference", title.toLowerCase()],
    fileType: "Reference",
    dateAdded: "2026-06-04",
    status: "coming-soon",
  } satisfies EmployeeResource)),
  {
    id: "contact-directory",
    title: "Professional Contact Directory",
    description: "Live internal directory for ALN leadership and Pacific, Peak, and Pike customer service teams.",
    category: "company",
    subcategory: "Company Reference",
    tags: ["company", "reference", "contacts", "directory", "labs"],
    fileType: "Directory",
    dateAdded: "2026-07-06",
    href: "/portal/employee-resources#contact-directory",
    version: "Internal",
    lastUpdated: "2026-07-06",
    featured: true,
    recentlyAdded: true,
    status: "available",
  },
];
