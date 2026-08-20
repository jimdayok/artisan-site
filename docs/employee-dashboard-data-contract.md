# Employee dashboard data and authorization contract

Verified August 19, 2026 against the production repository, the authenticated portal, and the signed-in Power BI tenant.

## Existing application architecture

- Employee and customer entry point: `/portal`.
- Employee/admin dashboard route: `/portal/admin`.
- Account analysis: `/portal/admin/account-analysis/[accountNumber]`.
- Customer portal preview: `/portal/admin/preview/[accountNumber]`.
- Existing customer portal, price-list, rewards, invite, access-log, and employee-resource routes remain in place.
- Authentication is Cloudflare Access. `proxy.ts` verifies the Access JWT and authenticated-user email, then forwards only the trusted `x-portal-auth-email` header.
- Administrator identities and explicit rep identities are centralized in `lib/portal/adminAccess.ts`.
- Rep-to-account authorization is centralized in `lib/portal/portalRoles.ts`. Missing rep mappings fail closed.
- Portal performance data is synchronized from Power BI into `private-site/portal/portal_export.json` and bundled into `lib/portal/generated/dashboardV1Bundle.json`.
- Customer-user-to-account authorization remains sourced from `private-source/portal/user_data.xlsx`. Performance data does not grant customer access.
- There is no application database or second semantic model in this repository. The production runtime reads generated JSON plus the existing workbook-backed access index.

## Current loaded data

The inspected August 19 bundle contains 413 output accounts, 357 location rows, and 592 mapped user emails. It exposes CM, PM, and PPM account-level sales, jobs, JPD, product usage, quality, rewards, labs, sales-rep codes, customer types, authorized portal users, and assigned price lists.

Period definitions are consistent across the employee dashboard:

- CM: the calendar month containing `manifest.data_refresh_date`.
- PM: the immediately completed calendar month before CM.
- PPM: the completed calendar month before PM.
- Timezone: America/Chicago for user-facing dates. Month keys in synchronized history are `YYYY-MM`.

The Power Automate account export now includes account-grain `net_sales_m0` through `net_sales_m26`. The repository sync converts those wide fields into monthly rows so the dashboard can show the current month, 13 completed months, and the optional previous-period comparison without creating a duplicate customer model.

## Production Power BI source

- Tenant workspace: `ALN Premium Workspace`.
- Workspace ID: `a63e0f35-1088-4bb4-bb1c-61f242c18dbc`.
- Semantic model: `Master_Reports`.
- Semantic model ID: `a946695b-5a56-467e-b4fa-c66c3d113c54`.
- Net Sales measure: `Intel[Net Sales]` (currency formatted in the model).
- Account identity: `Intel[Acct ID]`; the existing bundle also retains legacy account numbers.
- Rep identity: `Intel[Sales Rep]`. Values `HB` and `OP` map to Heather Branderhorst and Josh Opiol respectively. The Power Automate export aliases this value as `[sales_rep]`; the model also contains `Rep Rooster[Rep Code]` / `[Rep Name]`.
- Lab mapping: the current export supplies `lab_name` / `Last Lab Name`.
- Territory mapping: `Intel[Account or Group Territory]`, synchronized as `[territory]` into account details and the dashboard index.
- Monthly history support: the model contains `Monthly_Summary[Month]`, `[Month Number]`, `[Year]`, and `[Sales]`.
- Refresh observed in production: August 19, 2026 at 6:13 PM CT. Next scheduled model refresh displayed as August 20, 2026 at 6:00 AM CT.
- Current application mode: synchronized export, not a live Power BI query.

The production Power Automate query filters monthly history with `Date[Date]` and evaluates the model-owned `Intel[Net Sales]` measure. The exact underlying measure expression remains owned by the semantic model and was not exposed in the read-only model properties.

## Synchronized Net Sales history

`scripts/generate-portal-net-sales-history.mjs` converts the existing Power Automate account export into `private-site/portal/rep_net_sales_history.json`. `PORTAL_REP_NET_SALES_HISTORY_PATH` remains available only as an explicit deployment override. The generated file has this shape:

```json
{
  "manifest": {
    "workspace_id": "a63e0f35-1088-4bb4-bb1c-61f242c18dbc",
    "semantic_model_id": "a946695b-5a56-467e-b4fa-c66c3d113c54",
    "source_table": "Intel",
    "measure": "Intel[Net Sales]",
    "account_field": "Intel[Acct ID]",
    "rep_field": "Intel[Sales Rep]",
    "lab_field": "Intel[Lab Name]",
    "territory_field": "Intel[Account or Group Territory]",
    "date_field": "Date[Date]",
    "timezone": "America/Chicago",
    "generated_at": "2026-08-19T23:13:01Z",
    "data_refresh_date": "2026-08-19",
    "mode": "synchronized"
  },
  "rows": [
    {
      "month": "2026-08",
      "account_id": "ACCOUNT-LAB",
      "rep_code": "HB",
      "lab": "Pacific Artisan Labs",
      "territory": "Pacific",
      "net_sales": 123.45
    }
  ]
}
```

Rows remain at account-month grain. The application filters first by authenticated rep code and permitted account IDs, then aggregates. A rep-total-only export is intentionally rejected as an unsafe permission boundary. `scripts/sync-portal-export.sh` now generates and stages this file with the existing portal export, location export, and dashboard bundle.

## Missing, stale, and error behavior

- A verified zero is displayed as zero and labeled as confirmed by the source.
- Missing history displays `Not connected` or `Unavailable`, never zero.
- A configured but missing/invalid file displays a source error.
- A mismatched workspace, semantic model, or measure is rejected.
- A stale account snapshot remains visible with a freshness warning.
- A rep with no recognized mapping or no assigned account rows receives no customer data.
- Access Log, user invites, organization rewards, and unrestricted admin tools continue to require a true administrator identity server-side.
