import type { PortalCustomer } from "@/lib/portal/customers";
import type {
  PortalDashboardV1State,
  PortalPeerBenchmarks,
} from "@/lib/portal/dashboardV1";
import type { PortalWorkbookProfile } from "@/lib/portal/workbookAccountData";

export const demoCustomer: PortalCustomer = {
  accountNumber: "DEMO-1042",
  practiceName: "Lakeshore Demo Eye Care",
  emails: ["alex.morgan@example.com"],
  priceLists: ["G6"],
  allowedPriceLists: ["G6"],
  portalSections: [
    "pricing",
    "packages",
    "calculator",
    "catalog",
    "policies",
    "exports",
    "performance",
    "onboarding",
  ],
  customerTypeCode: "GENL",
  customerTypeLabel: "Artisan General Customer",
  detectedCustomerTypeCodes: ["GENL"],
};

export const demoWorkbookProfile: PortalWorkbookProfile = {
  person: {
    name: "Alex Morgan",
    organization: "Lakeshore Demo Eye Care",
    accountNumber: "DEMO-1042",
    emails: ["alex.morgan@example.com"],
    division: "Artisan General Customer",
    artisanLab: "Sample Artisan Lab",
    targetedPrograms: "Unity Rewards, Sequel Rewards",
    lastOrderShipped: "2026-08-18",
  },
};

const month = (ppm: number, pm: number, cm: number) => ({ ppm, pm, cm });

export const demoDashboardState: PortalDashboardV1State = {
  status: "ok",
  stale: false,
  account: {
    account_id: "DEMO-1042",
    pipedrive_id: "DEMO-0001",
    business_name: "Lakeshore Demo Eye Care",
    all_account_numbers: "DEMO-1042",
    address: "1042 Artisan Way, Madison, WI 53703",
    division: "Artisan General Customer",
    latest_ship_date: "2026-08-18",
    primary_pal_brand_private_pay: "Hoya",
    primary_pal_brand_vsp: "Shamir",
    lab_name: "Sample Artisan Lab",
    phone: "(555) 014-1042",
    state: "WI",
    sales_rep: "Demo Representative",
    used_price_lists: ["G6"],
    data_refresh_date: "2026-08-18",
    tier_status: {
      previous_month_tier_rank_by_acct_id: "Gold",
    },
    purchase_summary: {
      jobs: month(164, 181, 126),
      sales: month(28740, 31980, 22460),
    },
    performance_rates: {
      jobs_per_day: month(7.5, 8.2, 8.4),
    },
    product_mix: {
      net_lens_jobs: month(118, 134, 91),
      sql_jobs: month(19, 24, 18),
    },
    vsp_private_pay_mix: {
      vsp_jobs: month(57, 61, 41),
      net_lens_share: 0.72,
      sql_share: 0.13,
      vsp_share: 0.34,
      private_pay_mix: 0.66,
      primary_pal_brand_private_pay: "Hoya",
      primary_pal_brand_vsp: "Shamir",
    },
    program_usage: {
      modern_package_usage: "Active · 42 complete pairs",
      modern_frame_usage: "Active · 31 frame orders",
      chemclip_usage: "Active · 9 orders",
      speccheck_usage: "Active",
      tokai_usage: "Opportunity identified",
      flags: {
        modern_package: true,
        modern_frame: true,
        chemclip: true,
        speccheck: true,
        tokai: false,
      },
    },
    quality_metrics: {
      lab_redo_pct: month(0.008, 0.007, 0.006),
      office_redo_pct: month(0.034, 0.029, 0.026),
      warranty_pct: month(0.021, 0.018, 0.016),
      non_adapt_pct: month(0.012, 0.01, 0.009),
    },
    program_enrollment: {
      arsql26: true,
      arpmp26: true,
      aruty26: true,
    },
    supplemental_intelligence: {
      brand_usage: {
        hoya_jobs: month(64, 72, 51),
        shamir_jobs: month(41, 46, 31),
        tokai_jobs: month(7, 9, 6),
        varilux_jobs: month(18, 20, 14),
        neurolens_jobs: month(4, 5, 4),
        sequel_jobs: month(16, 19, 13),
        iot_artisan_jobs: month(14, 10, 7),
      },
      material_usage: {
        plastic_jobs: month(57, 62, 41),
        trivex_jobs: month(28, 33, 24),
        hi_index_160_jobs: month(31, 35, 25),
        hi_index_167_jobs: month(26, 29, 21),
        hi_index_174_jobs: month(9, 11, 8),
      },
      specialty_usage: {
        photochromic_jobs: month(46, 54, 39),
        polarized_jobs: month(18, 22, 15),
        multiple_pair_jobs: month(12, 16, 12),
      },
      turnaround: {
        average_days: month(4.8, 4.4, 4.2),
        lab_average_days: month(5.1, 4.9, 4.8),
      },
      rewards: {
        arpmp26: {
          enrolled: true,
          qualified_pmp_jobs: month(32, 39, 28),
          rebate_total: month(320, 390, 280),
        },
        aruty26: {
          enrolled: true,
          qualified_jobs: month(21, 27, 19),
          rewards_earned: month(210, 270, 190),
        },
        arsql26: {
          enrolled: true,
          qualified_sequel_pal_jobs: month(16, 19, 13),
          rebate_total: month(160, 190, 130),
        },
      },
    },
    customer_insights: {
      suggestions: [
        "Review second-pair recommendations with the optician team.",
        "Consider Tokai for appropriate specialty and high-index cases.",
      ],
      metrics: {
        demo_growth_rate: 10.4,
      },
    },
    authorized_users_summary: {
      authorized_user_count: 2,
      primary_emails: ["alex.morgan@example.com", "jamie.lee@example.com"],
      marketing_status_summary: { Subscribed: 2 },
    },
    authorized_users: [
      {
        name: "Alex Morgan",
        email: "alex.morgan@example.com",
        role_type: "Practice Owner",
        marketing_status: "Subscribed",
        organization: "Lakeshore Demo Eye Care",
        targeted_programs: "Unity Rewards, Sequel Rewards",
      },
      {
        name: "Jamie Lee",
        email: "jamie.lee@example.com",
        role_type: "Practice Manager",
        marketing_status: "Subscribed",
        organization: "Lakeshore Demo Eye Care",
      },
    ],
  },
};

export const demoPeerBenchmarks: PortalPeerBenchmarks = {
  cohortSize: 24,
  medianWarrantyPct: 2.4,
  medianOfficeRedoPct: 3.8,
  medianNonAdaptPct: 1.5,
  medianTurnaroundDays: 4.9,
  growthPercentile: 72,
  averageVspPct: 34,
  averagePhotochromicPct: 28.5,
  averagePolarizedPct: 11.2,
  averageMultiplePairPct: 8.4,
};
