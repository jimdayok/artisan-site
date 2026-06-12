import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, cpSync, renameSync } from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

const root = process.cwd();
const portalDir = path.join(root, "private-source", "portal");
const portalExportDir = path.join(root, "private-site", "portal");
const defaultAccountInputCandidates = [
  path.join(portalExportDir, "portal_export.json"),
];
const defaultUserInputCandidates = [
  path.join(portalDir, "user_data.xlsx"),
  path.join(portalDir, "User_Data.xlsx"),
  path.join(portalDir, "user_data.csv"),
  path.join(portalDir, "User_Data.csv"),
];
const defaultSupplementalAccountInputCandidates = [];
const outputBaseDir = path.join(portalDir, "dashboard-v1");
const releasesDir = path.join(outputBaseDir, "releases");
const currentDir = path.join(outputBaseDir, "current");
const tempCurrentDir = path.join(outputBaseDir, "current.tmp");
const previousCurrentDir = path.join(outputBaseDir, "current.prev");
const validationErrorsDir = path.join(outputBaseDir, "validation-errors");

const REQUIRED_ACCOUNT_COLUMNS = [
  "Acct ID",
  "Last Business Name",
  "All Account Numbers",
  "Last Full Address",
  "Last Division",
  "Latest Date Shipped",
  "Primary PAL Brand (Private Pay)",
  "Primary PAL Brand (VSP)",
  "Last Lab Name",
  "Last Phone Number",
  "Last State",
  "Modern Pkg Usage",
  "Modern Frm Usage",
  "ChemClip Usage",
  "SpecCheck Usage",
  "Tokai Usage",
  "Previous Month Tier Rank by Acct ID",
  "PPM Jobs",
  "PM Jobs",
  "CM Jobs",
  "PPM Sales",
  "PM Sales",
  "CM Sales",
  "PPM NL Jobs",
  "PM NL Jobs",
  "CM NL Jobs",
  "PPM SQL Jobs",
  "PM SQL Jobs",
  "CM SQL Jobs",
  "PPM VSP Jobs",
  "PM VSP Jobs",
  "CM VSP Jobs",
  "Data Refresh Date",
];

const REQUIRED_USER_COLUMNS = [
  "Person - Name",
  "Person - Organization",
  "Person - Role Type",
  "Person - Email - Work",
  "Person - Email - Home",
  "Person - Email - Other",
  "Organization - Division",
  "Organization - Targeted Programs",
  "Organization - All Account Numbers",
  "Person - Marketing status",
  "Organization - Acct ID",
  "Organization - Numeric ID",
];

const ACCOUNT_HEADER_ALIASES = {
  "Acct ID": ["Acct ID", "Last Account Number", "Organization - Account Number", "Account Number"],
  "Pipedrive ID": ["Pipedrive ID"],
  "Last Business Name": ["Last Business Name", "Account Name", "Organization - Name", "Person - Organization"],
  "All Account Numbers": ["All Account Numbers"],
  "Last Full Address": ["Last Full Address", "Full Address"],
  "Last Division": ["Last Division", "Division", "Organization - Division"],
  "Latest Date Shipped": ["Latest Date Shipped", "Last Shipped Date", "Last Order Shipped", "Organization - Last Order Shipped"],
  "Primary PAL Brand (Private Pay)": ["Primary PAL Brand (Private Pay)"],
  "Primary PAL Brand (VSP)": ["Primary PAL Brand (VSP)"],
  "Last Lab Name": ["Last Lab Name", "Organization - Artisan Lab"],
  "Last Phone Number": ["Last Phone Number", "Phone Number"],
  "Last State": ["Last State", "State"],
  "Last Sales Rep": ["Last Sales Rep", "Sales Rep", "Sales Rep Code", "Rep Code"],
  "Modern Pkg Usage": ["Modern Pkg Usage"],
  "Modern Frm Usage": ["Modern Frm Usage"],
  "ChemClip Usage": ["ChemClip Usage"],
  "SpecCheck Usage": ["SpecCheck Usage"],
  "Tokai Usage": ["Tokai Usage"],
  "Previous Month Tier Rank by Acct ID": ["Previous Month Tier Rank by Acct ID", "CM/PM Tier", "Tier"],
  "PPM Jobs": ["PPM Jobs"],
  "PM Jobs": ["PM Jobs"],
  "CM Jobs": ["CM Jobs"],
  "PPM Sales": ["PPM Sales"],
  "PM Sales": ["PM Sales"],
  "CM Sales": ["CM Sales"],
  "PPM NL Jobs": ["PPM NL Jobs"],
  "PM NL Jobs": ["PM NL Jobs"],
  "CM NL Jobs": ["CM NL Jobs"],
  "PPM SQL Jobs": ["PPM SQL Jobs"],
  "PM SQL Jobs": ["PM SQL Jobs"],
  "CM SQL Jobs": ["CM SQL Jobs"],
  "PPM VSP Jobs": ["PPM VSP Jobs"],
  "PM VSP Jobs": ["PM VSP Jobs"],
  "CM VSP Jobs": ["CM VSP Jobs"],
  "Used Price Lists": ["Used Price Lists", "Used Price List", "Price Lists", "Associated Price Lists"],
  "PPM Lab Redo %": ["PPM Lab Redo %"],
  "PM Lab Redo %": ["PM Lab Redo %"],
  "CM Lab Redo %": ["CM Lab Redo %"],
  "PPM Office Redo %": ["PPM Office Redo %", "PPM Office Redo%"],
  "PM Office Redo %": ["PM Office Redo %", "PM Office Redo%"],
  "CM Office Redo %": ["CM Office Redo %", "CM Office Redo%"],
  "PPM Warranty %": ["PPM Warranty %"],
  "PM Warranty %": ["PM Warranty %"],
  "CM Warranty %": ["CM Warranty %"],
  "PPM Warranty Redo %": ["PPM Warranty Redo %", "PPM Warranty %"],
  "PM Warranty Redo %": ["PM Warranty Redo %", "PM Warranty %"],
  "CM Warranty Redo %": ["CM Warranty Redo %", "CM Warranty %"],
  "PPM Non-Adapt %": ["PPM Non-Adapt %", "PPM Non Adapt %"],
  "PM Non-Adapt %": ["PM Non-Adapt %", "PM Non Adapt %"],
  "CM Non-Adapt %": ["CM Non-Adapt %", "CM Non Adapt %"],
  "Is ARSQL26 Customer": ["Is ARSQL26 Customer", "Is Enrolled in ARSQL26"],
  "Is Enrolled in ARPMP26 Display": ["Is Enrolled in ARPMP26 Display", "Is Enrolled in ARPMP26"],
  "Is Enrolled in ARUTY26 Display": ["Is Enrolled in ARUTY26 Display", "Is Enrolled in ARUTY26"],
  "Business Name": ["Business Name"],
  "CM ARPMP26 Qualified PMP Jobs": ["CM ARPMP26 Qualified PMP Jobs"],
  "PM ARPMP26 Qualified PMP Jobs": ["PM ARPMP26 Qualified PMP Jobs"],
  "PPM ARPMP26 Qualified PMP Jobs": ["PPM ARPMP26 Qualified PMP Jobs"],
  "CM ARPMP26 Rebate Total": ["CM ARPMP26 Rebate Total"],
  "PM ARPMP26 Rebate Total": ["PM ARPMP26 Rebate Total"],
  "PPM ARPMP26 Rebate Total": ["PPM ARPMP26 Rebate Total"],
  "CM ARSQL26 Qualified Sequel PAL Jobs": ["CM ARSQL26 Qualified Sequel PAL Jobs"],
  "PM ARSQL26 Qualified Sequel PAL Jobs": ["PM ARSQL26 Qualified Sequel PAL Jobs"],
  "PPM ARSQL26 Qualified Sequel PAL Jobs": ["PPM ARSQL26 Qualified Sequel PAL Jobs"],
  "CM ARSQL26 Sequel PAL Rebate Total": ["CM ARSQL26 Sequel PAL Rebate Total"],
  "PM ARSQL26 Sequel PAL Rebate Total": ["PM ARSQL26 Sequel PAL Rebate Total"],
  "PPM ARSQL26 Sequel PAL Rebate Total": ["PPM ARSQL26 Sequel PAL Rebate Total"],
  "CM ARUTY26 Qualified Jobs": ["CM ARUTY26 Qualified Jobs"],
  "PM ARUTY26 Qualified Jobs": ["PM ARUTY26 Qualified Jobs"],
  "PPM ARUTY26 Qualified Jobs": ["PPM ARUTY26 Qualified Jobs"],
  "CM ARUTY26 Rewards Earned": ["CM ARUTY26 Rewards Earned"],
  "PM ARUTY26 Rewards Earned": ["PM ARUTY26 Rewards Earned"],
  "PPM ARUTY26 Rewards Earned": ["PPM ARUTY26 Rewards Earned"],
  "CM Average Turnaround Time": ["CM Average Turnaround Time"],
  "PM Average Turnaround Time": ["PM Average Turnaround Time"],
  "PPM Average Turnaround Time": ["PPM Average Turnaround Time"],
  "CM Plastic Orders": ["CM Plastic Orders"],
  "PM Plastic Orders": ["PM Plastic Orders"],
  "PPM Plastic Orders": ["PPM Plastic Orders"],
  "CM Trivex Orders": ["CM Trivex Orders"],
  "PM Trivex Orders": ["PM Trivex Orders"],
  "PPM Trivex Orders": ["PPM Trivex Orders"],
  "CM Hi Index 1.60 Orders": ["CM Hi Index 1.60 Orders"],
  "CM Hi Index 1.67 Orders": ["CM Hi Index 1.67 Orders"],
  "CM Hi Index 1.74 Orders": ["CM Hi Index 1.74 Orders"],
  "CM Photochromic": ["CM Photochromic"],
  "PM Photochromic": ["PM Photochromic"],
  "PPM Photochromic": ["PPM Photochromic"],
  "CM Polarized": ["CM Polarized"],
  "PM Polarized": ["PM Polarized"],
  "PPM Polarized": ["PPM Polarized"],
  "CM Multiple Pairs": ["CM Multiple Pairs"],
  "PM Multiple Pairs": ["PM Multiple Pairs"],
  "PPM Multiple Pairs": ["PPM Multiple Pairs"],
  "CM Hoya Orders": ["CM Hoya Orders"],
  "PM Hoya Orders": ["PM Hoya Orders"],
  "PPM Hoya Orders": ["PPM Hoya Orders"],
  "CM Shamir Orders": ["CM Shamir Orders"],
  "PM Shamir Orders": ["PM Shamir Orders"],
  "PPM Shamir Orders": ["PPM Shamir Orders"],
  "CM Tokai Orders": ["CM Tokai Orders"],
  "PM Tokai Orders": ["PM Tokai Orders"],
  "PPM Tokai Orders": ["PPM Tokai Orders"],
  "CM Varilux Orders": ["CM Varilux Orders"],
  "PM Varilux Orders": ["PM Varilux Orders"],
  "PPM Varilux Orders": ["PPM Varilux Orders"],
  "CM Neurolens Orders": ["CM Neurolens Orders"],
  "PM Neurolens Orders": ["PM Neurolens Orders"],
  "PPM Neurolens Orders": ["PPM Neurolens Orders"],
  "CM Sequel Orders": ["CM Sequel Orders"],
  "PM Sequel Orders": ["PM Sequel Orders"],
  "PPM Sequel Orders": ["PPM Sequel Orders"],
  "CM IOT Artisan Orders": ["CM IOT Artisan Orders"],
  "PPM IOT Artisan Orders": ["PPM IOT Artisan Orders"],
  "CM Tier Jobs": ["CM Tier Jobs"],
  "Data Refresh Date": ["Data Refresh Date", "Last Shipped Date (Global)"],
};

const POWER_BI_ACCOUNT_FIELDS = {
  "Acct ID": "Intel[Acct ID]",
  "Pipedrive ID": "Intel[Pipedrive ID]",
  "Last Business Name": "Intel[Business Name]",
  "Business Name": "Intel[Business Name]",
  "All Account Numbers": "[all_account_numbers]",
  "Last Full Address": "[full_address]",
  "Last Division": "[division]",
  "Latest Date Shipped": "[date_shipped]",
  "Primary PAL Brand (Private Pay)": "[primary_pal_brand_private_pay]",
  "Primary PAL Brand (VSP)": "[primary_pal_brand_vsp]",
  "Last Lab Name": "[lab_name]",
  "Last Phone Number": "[phone_number]",
  "Last State": "[state]",
  "Last Sales Rep": "[sales_rep_code]",
  "Modern Pkg Usage": "[modern_pkg_usage]",
  "Modern Frm Usage": "[modern_frm_usage]",
  "ChemClip Usage": "[chemclip_usage]",
  "SpecCheck Usage": "[speccheck_usage]",
  "Tokai Usage": "[tokai_usage]",
  "Previous Month Tier Rank by Acct ID": "[previous_month_tier_rank]",
  "PPM Jobs": "[ppm_jobs]",
  "PM Jobs": "[pm_jobs]",
  "CM Jobs": "[cm_jobs]",
  "PPM Sales": "[ppm_sales]",
  "PM Sales": "[pm_sales]",
  "CM Sales": "[cm_sales]",
  "PPM JPD": "[ppm_jpd]",
  "PM JPD": "[pm_jpd]",
  "CM JPD": "[cm_jpd]",
  "PPM NL Jobs": "[ppm_nl_jobs]",
  "PM NL Jobs": "[pm_nl_jobs]",
  "CM NL Jobs": "[cm_nl_jobs]",
  "PPM NL SOW": "[ppm_nl_sow]",
  "PM NL SOW": "[pm_nl_sow]",
  "CM NL SOW": "[cm_nl_sow]",
  "PPM SQL Jobs": "[ppm_sql_jobs]",
  "PM SQL Jobs": "[pm_sql_jobs]",
  "CM SQL Jobs": "[cm_sql_jobs]",
  "PPM VSP Jobs": "[ppm_vsp_jobs]",
  "PM VSP Jobs": "[pm_vsp_jobs]",
  "CM VSP Jobs": "[cm_vsp_jobs]",
  "PPM VSP SOW": "[ppm_vsp_sow]",
  "PM VSP SOW": "[pm_vsp_sow]",
  "CM VSP SOW": "[cm_vsp_sow]",
  "Used Price Lists": "[used_price_lists]",
  "PPM Lab Redo %": "[ppm_lab_redo_pct]",
  "PM Lab Redo %": "[pm_lab_redo_pct]",
  "CM Lab Redo %": "[cm_lab_redo_pct]",
  "PPM Office Redo %": "[ppm_office_redo_pct]",
  "PM Office Redo %": "[pm_office_redo_pct]",
  "CM Office Redo %": "[cm_office_redo_pct]",
  "PPM Warranty Redo %": "[ppm_warranty_redo_pct]",
  "PM Warranty Redo %": "[pm_warranty_redo_pct]",
  "CM Warranty Redo %": "[cm_warranty_redo_pct]",
  "PPM Non-Adapt %": "[ppm_non_adapt_pct]",
  "PM Non-Adapt %": "[pm_non_adapt_pct]",
  "CM Non-Adapt %": "[cm_non_adapt_pct]",
  "Is ARSQL26 Customer": "[is_arsql26_customer]",
  "Is Enrolled in ARPMP26 Display": "[is_enrolled_arpmp26]",
  "Is Enrolled in ARUTY26 Display": "[is_enrolled_aruty26]",
  "PPM Average Turnaround Time": "[ppm_average_turnaround_time]",
  "PM Average Turnaround Time": "[pm_average_turnaround_time]",
  "CM Average Turnaround Time": "[cm_average_turnaround_time]",
  "PPM Hoya Orders": "[ppm_hoya_orders]",
  "PM Hoya Orders": "[pm_hoya_orders]",
  "CM Hoya Orders": "[cm_hoya_orders]",
  "PPM Shamir Orders": "[ppm_shamir_orders]",
  "PM Shamir Orders": "[pm_shamir_orders]",
  "CM Shamir Orders": "[cm_shamir_orders]",
  "PPM Tokai Orders": "[ppm_tokai_orders]",
  "PM Tokai Orders": "[pm_tokai_orders]",
  "CM Tokai Orders": "[cm_tokai_orders]",
  "PPM Varilux Orders": "[ppm_varilux_orders]",
  "PM Varilux Orders": "[pm_varilux_orders]",
  "CM Varilux Orders": "[cm_varilux_orders]",
  "PPM Neurolens Orders": "[ppm_neurolens_orders]",
  "PM Neurolens Orders": "[pm_neurolens_orders]",
  "CM Neurolens Orders": "[cm_neurolens_orders]",
  "PPM Sequel Orders": "[ppm_sequel_orders]",
  "PM Sequel Orders": "[pm_sequel_orders]",
  "CM Sequel Orders": "[cm_sequel_orders]",
  "PPM IOT Artisan Orders": "[ppm_iot_artisan_orders]",
  "PM IOT Artisan Orders": "[pm_iot_artisan_orders]",
  "CM IOT Artisan Orders": "[cm_iot_artisan_orders]",
  "PPM Plastic Orders": "[ppm_plastic_orders]",
  "PM Plastic Orders": "[pm_plastic_orders]",
  "CM Plastic Orders": "[cm_plastic_orders]",
  "PPM Trivex Orders": "[ppm_trivex_orders]",
  "PM Trivex Orders": "[pm_trivex_orders]",
  "CM Trivex Orders": "[cm_trivex_orders]",
  "PPM Photochromic": "[ppm_photochromic]",
  "PM Photochromic": "[pm_photochromic]",
  "CM Photochromic": "[cm_photochromic]",
  "PPM Polarized": "[ppm_polarized]",
  "PM Polarized": "[pm_polarized]",
  "CM Polarized": "[cm_polarized]",
  "PPM Multiple Pairs": "[ppm_multiple_pairs]",
  "PM Multiple Pairs": "[pm_multiple_pairs]",
  "CM Multiple Pairs": "[cm_multiple_pairs]",
  "PPM ARPMP26 Qualified PMP Jobs": "[ppm_arpmp26_qualified_pmp_jobs]",
  "PM ARPMP26 Qualified PMP Jobs": "[pm_arpmp26_qualified_pmp_jobs]",
  "CM ARPMP26 Qualified PMP Jobs": "[cm_arpmp26_qualified_pmp_jobs]",
  "PPM ARUTY26 Qualified Jobs": "[ppm_aruty26_qualified_jobs]",
  "PM ARUTY26 Qualified Jobs": "[pm_aruty26_qualified_jobs]",
  "CM ARUTY26 Qualified Jobs": "[cm_aruty26_qualified_jobs]",
  "PPM ARUTY26 Rewards Earned": "[ppm_aruty26_rewards_earned]",
  "PM ARUTY26 Rewards Earned": "[pm_aruty26_rewards_earned]",
  "CM ARUTY26 Rewards Earned": "[cm_aruty26_rewards_earned]",
  "PPM ARSQL26 Qualified Sequel PAL Jobs": "[ppm_arsql26_qualified_sequel_pal_jobs]",
  "PM ARSQL26 Qualified Sequel PAL Jobs": "[pm_arsql26_qualified_sequel_pal_jobs]",
  "CM ARSQL26 Qualified Sequel PAL Jobs": "[cm_arsql26_qualified_sequel_pal_jobs]",
  "PPM ARSQL26 Sequel PAL Rebate Total": "[ppm_arsql26_sequel_pal_rebate_total]",
  "PM ARSQL26 Sequel PAL Rebate Total": "[pm_arsql26_sequel_pal_rebate_total]",
  "CM ARSQL26 Sequel PAL Rebate Total": "[cm_arsql26_sequel_pal_rebate_total]",
  "Data Refresh Date": "[data_refresh_date]",
};

const USER_HEADER_ALIASES = {
  "Person - Name": ["Person - Name"],
  "Person - Organization": ["Person - Organization"],
  "Person - Role Type": ["Person - Role Type"],
  "Person - Email - Work": ["Person - Email - Work"],
  "Person - Email - Home": ["Person - Email - Home"],
  "Person - Email - Other": ["Person - Email - Other"],
  "Organization - Division": ["Organization - Division"],
  "Organization - Targeted Programs": ["Organization - Targeted Programs"],
  "Organization - All Account Numbers": ["Organization - All Account Numbers", "All Account Numbers"],
  "Person - Marketing status": ["Person - Marketing status"],
  "Organization - Acct ID": ["Organization - Acct ID"],
  "Organization - Numeric ID": ["Organization - Numeric ID"],
};

const ACCT_ID_PATTERN = /^[A-Za-z0-9]+-[A-Za-z0-9-]+$/;
const CORE_ACCOUNT_METRIC_COLUMNS = ["PPM Jobs", "PM Jobs", "CM Jobs", "PPM Sales", "PM Sales", "CM Sales"];
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  removeNSPrefix: true,
});

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    accountInput: "",
    userInput: "",
    accountSheet: "Export",
    userSheet: "person list",
    supplementalInputs: [],
    allowDuplicateAcctId: false,
    ignoreEmptySummaryRows: false,
    allowInvalidUserAccountLinks: false,
  };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--input") parsed.accountInput = args[++i] ?? "";
    else if (arg === "--account-input") parsed.accountInput = args[++i] ?? "";
    else if (arg === "--user-input") parsed.userInput = args[++i] ?? "";
    else if (arg === "--sheet") parsed.accountSheet = args[++i] ?? "Export";
    else if (arg === "--account-sheet") parsed.accountSheet = args[++i] ?? "Export";
    else if (arg === "--user-sheet") parsed.userSheet = args[++i] ?? "person list";
    else if (arg === "--supplemental-input") parsed.supplementalInputs.push(args[++i] ?? "");
    else if (arg === "--allow-duplicate-acct-id") parsed.allowDuplicateAcctId = true;
    else if (arg === "--ignore-empty-summary-rows") parsed.ignoreEmptySummaryRows = true;
    else if (arg === "--allow-invalid-user-account-links") parsed.allowInvalidUserAccountLinks = true;
  }
  return parsed;
}

function toText(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("text" in value) return toText(value.text);
    if ("result" in value) return toText(value.result);
  }
  return String(value).trim();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(toText(value).replace(/[$,%\s,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = toText(value);
  if (!text) return "";
  const serial = Number(text);
  if (Number.isFinite(serial) && serial > 0 && !text.includes("-")) {
    const epoch = Date.UTC(1899, 11, 30);
    const date = new Date(epoch + serial * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 10);
  }
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return text;
}

function normalizeAcctId(value) {
  return toText(value).replace(/\.0$/, "").toUpperCase();
}

function safeFileName(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function canonicalHeader(rawHeader, aliasMap) {
  const normalized = toText(rawHeader).toLowerCase();
  if (!normalized) return "";
  for (const [canonical, aliases] of Object.entries(aliasMap)) {
    if (aliases.map((entry) => entry.toLowerCase()).includes(normalized)) return canonical;
  }
  return toText(rawHeader);
}

function worksheetToRecords(worksheet, aliasMap) {
  const rows = [];
  const headers = worksheet.getRow(1).values.slice(1).map((value) => canonicalHeader(value, aliasMap));
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values.slice(1);
    const record = {};
    let hasValue = false;
    for (let idx = 0; idx < headers.length; idx += 1) {
      const header = headers[idx];
      if (!header) continue;
      record[header] = values[idx];
      if (toText(values[idx])) hasValue = true;
    }
    if (hasValue) rows.push(record);
  });
  return rows;
}

async function readRows(inputFile, sheetName, aliasMap) {
  const ext = path.extname(inputFile).toLowerCase();
  if (ext === ".json") {
    const parsed = JSON.parse(readFileSync(inputFile, "utf8"));
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected an array in ${path.relative(root, inputFile)}.`);
    }
    return parsed
      .filter((row) => row && typeof row === "object" && !Array.isArray(row))
      .map((row) =>
        Object.fromEntries(
          Object.entries(POWER_BI_ACCOUNT_FIELDS).map(([canonical, source]) => [
            canonical,
            row[source] ?? "",
          ])
        )
      );
  }
  if (ext === ".csv") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = await workbook.csv.readFile(inputFile);
    return worksheetToRecords(worksheet, aliasMap);
  }
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputFile);
    const worksheet = workbook.getWorksheet(sheetName) ?? workbook.worksheets[0];
    if (!worksheet) return [];
    return worksheetToRecords(worksheet, aliasMap);
  } catch {
    return readRowsFromXlsxZip(inputFile, sheetName, aliasMap);
  }
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function columnIndex(cellRef) {
  const letters = String(cellRef || "A").match(/[A-Z]+/i)?.[0] || "A";
  return [...letters.toUpperCase()].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function sharedStringText(sharedString) {
  if (!sharedString) return "";
  if (sharedString.t !== undefined && typeof sharedString.t !== "object") return toText(sharedString.t);
  if (sharedString.t?.text) return sharedString.t.text;
  return asArray(sharedString.r)
    .map((run) => (typeof run.t === "string" ? run.t : run.t?.text || ""))
    .join("");
}

async function readRowsFromXlsxZip(filePath, sheetName, aliasMap) {
  const zip = await JSZip.loadAsync(readFileSync(filePath));
  const workbookXml = await zip.file("xl/workbook.xml")?.async("text");
  const relsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("text");
  if (!workbookXml || !relsXml) return [];

  const workbook = xmlParser.parse(workbookXml).workbook;
  const rels = xmlParser.parse(relsXml).Relationships;
  const sheets = asArray(workbook.sheets?.sheet);
  const sheet = sheets.find((entry) => entry.name === sheetName) ?? sheets[0];
  if (!sheet) return [];

  const relId = sheet["r:id"] ?? sheet.id;
  const rel = asArray(rels.Relationship).find((entry) => entry.Id === relId);
  const target = rel?.Target?.replace(/^\/?xl\//, "");
  const sheetPath = target ? `xl/${target}` : "";
  const sheetXml = sheetPath ? await zip.file(sheetPath)?.async("text") : "";
  if (!sheetXml) return [];

  const sharedStringsXml = await zip.file("xl/sharedStrings.xml")?.async("text");
  const sharedStrings = sharedStringsXml
    ? asArray(xmlParser.parse(sharedStringsXml).sst?.si).map(sharedStringText)
    : [];
  const parsedSheet = xmlParser.parse(sheetXml).worksheet;
  const sheetRows = asArray(parsedSheet.sheetData?.row).map((row) => {
    const output = [];
    let sequentialIndex = 0;
    for (const cell of asArray(row.c)) {
      const index = cell.r ? columnIndex(cell.r) : sequentialIndex;
      let value = "";
      if (cell.t === "s") value = sharedStrings[Number(cell.v)] ?? "";
      else if (cell.t === "inlineStr") value = sharedStringText(cell.is);
      else if (cell.v !== undefined) value = cell.v;
      output[index] = value;
      sequentialIndex = index + 1;
    }
    return output;
  });

  if (!sheetRows.length) return [];
  const headers = [];
  for (let i = 0; i < sheetRows[0].length; i += 1) headers[i] = canonicalHeader(sheetRows[0][i], aliasMap);
  const rows = [];
  for (let rowIndex = 1; rowIndex < sheetRows.length; rowIndex += 1) {
    const values = sheetRows[rowIndex];
    const record = {};
    let hasValue = false;
    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      if (!header) continue;
      const value = values[index] ?? "";
      record[header] = value;
      if (toText(value)) hasValue = true;
    }
    if (hasValue) rows.push(record);
  }
  return rows;
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function trendDirection(current, previous) {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

function growthRate(current, previous) {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / Math.abs(previous);
}

function truthyUsage(value) {
  const normalized = toText(value).toLowerCase();
  if (!normalized) return false;
  return !["no", "none", "0", "0%", "false", "n/a", "na"].includes(normalized);
}

function parseUsedPriceLists(value) {
  return [...new Set(
    toText(value)
      .split(/[;,|/]/)
      .flatMap((entry) => entry.split(/\s+/))
      .map((entry) => entry.trim().toUpperCase())
      .filter((entry) => /^[A-Z0-9]{2,4}$/.test(entry))
  )];
}

function isPowerBiArtifactText(value) {
  const text = toText(value).toLowerCase();
  return (
    text.startsWith("applied filters:") ||
    text.includes("applied filters:") ||
    text.includes("excluded") ||
    text.includes("account name") ||
    text.includes("phone number")
  );
}

function isUserSummaryArtifactRow(row) {
  const acctId = normalizeAcctId(row["Organization - Acct ID"]);
  const org = toText(row["Person - Organization"]);
  const name = toText(row["Person - Name"]);
  const work = toText(row["Person - Email - Work"]);
  const home = toText(row["Person - Email - Home"]);
  const other = toText(row["Person - Email - Other"]);
  const division = toText(row["Organization - Division"]);
  const programs = toText(row["Organization - Targeted Programs"]);
  const allAccountNumbers = toText(row["Organization - All Account Numbers"]);

  const emailText = `${work} ${home} ${other}`.toLowerCase();
  const hasEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(emailText);
  const hasIdentity = Boolean(name || org || division || programs || allAccountNumbers);
  const acctLooksInvalid = !acctId || !ACCT_ID_PATTERN.test(acctId);
  const hasSummaryText =
    isPowerBiArtifactText(name) ||
    isPowerBiArtifactText(org) ||
    emailText.includes("applied filters") ||
    emailText.includes("excluded");

  // Safe skip for trailing report artifacts: no emails + invalid acct id + summary/filter text.
  return acctLooksInvalid && !hasEmail && (hasSummaryText || !hasIdentity);
}

function isClearSummaryArtifactRow(row) {
  const acctIdText = toText(row["Acct ID"]);
  const businessName = toText(row["Last Business Name"]);
  const allAccountNumbers = toText(row["All Account Numbers"]);
  const pipedriveId = toText(row["Pipedrive ID"]);
  const lastLabName = toText(row["Last Lab Name"]);
  const lastState = toText(row["Last State"]);
  const refreshDate = toIsoDate(row["Data Refresh Date"]);
  const hasIdentity = Boolean(allAccountNumbers || pipedriveId || lastLabName || lastState || refreshDate);
  const noMetrics = CORE_ACCOUNT_METRIC_COLUMNS.every((column) => toNumber(row[column]) === 0);
  return !hasIdentity && noMetrics && (isPowerBiArtifactText(acctIdText) || isPowerBiArtifactText(businessName));
}

function looksLikeRealAccountRow(row) {
  const signals = [
    toText(row["Last Business Name"]),
    toText(row["All Account Numbers"]),
    toText(row["Pipedrive ID"]),
    toText(row["Last Lab Name"]),
    toText(row["Last State"]),
    toIsoDate(row["Data Refresh Date"]),
  ];
  const hasMetric = CORE_ACCOUNT_METRIC_COLUMNS.some((column) => toNumber(row[column]) > 0);
  return signals.some(Boolean) || hasMetric;
}

function toCsvLine(values) {
  return values
    .map((value) => {
      const text = toText(value);
      if (text.includes(",") || text.includes("\"") || text.includes("\n")) return `"${text.replace(/"/g, "\"\"")}"`;
      return text;
    })
    .join(",");
}

function writeCsvReport(fileName, headers, rows) {
  mkdirSync(validationErrorsDir, { recursive: true });
  const csv = [toCsvLine(headers), ...rows.map((row) => toCsvLine(headers.map((h) => row[h] ?? "")))].join("\n");
  writeFileSync(path.join(validationErrorsDir, fileName), `${csv}\n`);
}

function validateAccountRows(rows, allowDuplicateAcctId, ignoreEmptySummaryRows) {
  if (!rows.length) throw new Error("No account rows found in source export.");
  const headerSet = new Set(Object.keys(rows[0]));
  const missingColumns = REQUIRED_ACCOUNT_COLUMNS.filter((column) => !headerSet.has(column));
  if (missingColumns.length > 0) throw new Error(`Missing required account columns: ${missingColumns.join(", ")}`);

  const acctIdCounts = new Map();
  const refreshDates = new Set();
  const cleanedRows = [];
  const invalidAcctIdRows = [];
  const missingAcctIdRows = [];
  let skippedSummaryRows = 0;

  for (const row of rows) {
    const acctIdRaw = toText(row["Acct ID"]);
    const acctId = normalizeAcctId(row["Acct ID"]);
    if (!acctId) {
      if (ignoreEmptySummaryRows && isClearSummaryArtifactRow(row)) {
        skippedSummaryRows += 1;
        continue;
      }
      missingAcctIdRows.push({
        "Acct ID": acctIdRaw,
        "Last Business Name": toText(row["Last Business Name"]),
        "All Account Numbers": toText(row["All Account Numbers"]),
        "Pipedrive ID": toText(row["Pipedrive ID"]),
        "Last Lab Name": toText(row["Last Lab Name"]),
        "Last State": toText(row["Last State"]),
        "Data Refresh Date": toIsoDate(row["Data Refresh Date"]),
      });
      continue;
    }

    if (!ACCT_ID_PATTERN.test(acctId)) {
      if (ignoreEmptySummaryRows && isClearSummaryArtifactRow(row)) {
        skippedSummaryRows += 1;
        continue;
      }
      invalidAcctIdRows.push({
        "Acct ID": acctIdRaw,
        "Last Business Name": toText(row["Last Business Name"]),
        "All Account Numbers": toText(row["All Account Numbers"]),
        "Pipedrive ID": toText(row["Pipedrive ID"]),
        "Last Lab Name": toText(row["Last Lab Name"]),
        "Last State": toText(row["Last State"]),
        "Data Refresh Date": toIsoDate(row["Data Refresh Date"]),
        "Looks Like Real Account Data": looksLikeRealAccountRow(row) ? "yes" : "no",
      });
      continue;
    }

    cleanedRows.push(row);
    acctIdCounts.set(acctId, (acctIdCounts.get(acctId) ?? 0) + 1);
    const refreshDate = toIsoDate(row["Data Refresh Date"]);
    if (refreshDate) refreshDates.add(refreshDate);
  }

  if (missingAcctIdRows.length > 0) {
    writeCsvReport(
      "missing-acct-id.csv",
      ["Acct ID", "Last Business Name", "All Account Numbers", "Pipedrive ID", "Last Lab Name", "Last State", "Data Refresh Date"],
      missingAcctIdRows
    );
    throw new Error(`Validation failed: ${missingAcctIdRows.length} rows are missing Acct ID.`);
  }

  if (invalidAcctIdRows.length > 0) {
    writeCsvReport(
      "invalid-acct-id.csv",
      ["Acct ID", "Last Business Name", "All Account Numbers", "Pipedrive ID", "Last Lab Name", "Last State", "Data Refresh Date", "Looks Like Real Account Data"],
      invalidAcctIdRows
    );
    throw new Error(`Validation failed: ${invalidAcctIdRows.length} rows have invalid Acct ID format.`);
  }

  const duplicates = [...acctIdCounts.entries()].filter(([, count]) => count > 1);
  if (duplicates.length > 0 && !allowDuplicateAcctId) {
    throw new Error(
      `Validation failed: duplicate Acct ID values found (${duplicates
        .slice(0, 12)
        .map(([acctId, count]) => `${acctId}x${count}`)
        .join(", ")}). Use --allow-duplicate-acct-id to permit merge behavior.`
    );
  }

  return {
    rowCount: rows.length,
    effectiveRowCount: cleanedRows.length,
    duplicateAcctIds: duplicates.length,
    refreshDates: [...refreshDates].sort(),
    skippedSummaryRows,
    cleanedRows,
  };
}

function normalizeEmail(value) {
  return toText(value).toLowerCase();
}

function splitEmails(value) {
  return normalizeEmail(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry));
}

function mergeDuplicateRows(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const acctId = normalizeAcctId(row["Acct ID"]);
    grouped.set(acctId, [...(grouped.get(acctId) ?? []), row]);
  }

  return [...grouped.values()].map((groupRows) => {
    if (groupRows.length === 1) return groupRows[0];
    const latest = [...groupRows].sort((a, b) => toIsoDate(b["Data Refresh Date"]).localeCompare(toIsoDate(a["Data Refresh Date"])))[0];
    const merged = { ...latest };
    for (const column of CORE_ACCOUNT_METRIC_COLUMNS.concat([
      "PPM NL Jobs",
      "PM NL Jobs",
      "CM NL Jobs",
      "PPM SQL Jobs",
      "PM SQL Jobs",
      "CM SQL Jobs",
      "PPM VSP Jobs",
      "PM VSP Jobs",
      "CM VSP Jobs",
    ])) {
      merged[column] = groupRows.reduce((total, row) => total + toNumber(row[column]), 0);
    }
    merged["All Account Numbers"] = [...new Set(
      groupRows.flatMap((row) =>
        toText(row["All Account Numbers"])
          .split(",")
          .map((value) => value.trim().replace(/\.0$/, ""))
          .filter(Boolean)
      )
    )].join(", ");
    return merged;
  });
}

function sourceRank(sourceFile) {
  const base = path.basename(sourceFile).toLowerCase();
  if (base === "portal_export.json") return 50;
  return 10;
}

function completenessScore(row) {
  return Object.values(row).filter((value) => toText(value)).length;
}

function bestValue(existing, incoming, existingSource, incomingSource) {
  const existingText = toText(existing);
  const incomingText = toText(incoming);
  if (!incomingText) return existing;
  if (!existingText) return incoming;
  return sourceRank(incomingSource) >= sourceRank(existingSource) ? incoming : existing;
}

function mergeUnifiedAccountRows(sourceEntries) {
  const grouped = new Map();
  for (const entry of sourceEntries) {
    const acctId = normalizeAcctId(entry.row["Acct ID"]);
    if (!acctId) continue;
    grouped.set(acctId, [...(grouped.get(acctId) ?? []), entry]);
  }

  return [...grouped.entries()].map(([acctId, entries]) => {
    const sortedEntries = [...entries].sort((a, b) => {
      const rankDelta = sourceRank(b.sourceFile) - sourceRank(a.sourceFile);
      if (rankDelta !== 0) return rankDelta;
      return completenessScore(b.row) - completenessScore(a.row);
    });
    const merged = { "Acct ID": acctId };
    const sourcesByColumn = { "Acct ID": "master key" };

    for (const entry of sortedEntries.reverse()) {
      for (const [column, value] of Object.entries(entry.row)) {
        if (!column) continue;
        const next = bestValue(merged[column], value, sourcesByColumn[column] ?? "", entry.sourceFile);
        if (next !== merged[column]) {
          merged[column] = next;
          sourcesByColumn[column] = path.relative(root, entry.sourceFile);
        }
      }
    }

    merged.__source_files = [...new Set(entries.map((entry) => path.relative(root, entry.sourceFile)))].sort();
    merged.__field_precedence = sourcesByColumn;
    return merged;
  });
}

function monthlyValues(row, label) {
  return {
    ppm: toNumber(row[`PPM ${label}`]),
    pm: toNumber(row[`PM ${label}`]),
    cm: toNumber(row[`CM ${label}`]),
  };
}

function buildSupplementalIntelligence(row) {
  const arpmpQualifiedJobs = {
    ppm: toNumber(row["PPM ARPMP26 Qualified PMP Jobs"]),
    pm: toNumber(row["PM ARPMP26 Qualified PMP Jobs"]),
    cm: toNumber(row["CM ARPMP26 Qualified PMP Jobs"]),
  };
  const arpmpRebateTotal = {
    ppm: toNumber(row["PPM ARPMP26 Rebate Total"]),
    pm: toNumber(row["PM ARPMP26 Rebate Total"]),
    cm: toNumber(row["CM ARPMP26 Rebate Total"]),
  };
  const arutyQualifiedJobs = {
    ppm: toNumber(row["PPM ARUTY26 Qualified Jobs"]),
    pm: toNumber(row["PM ARUTY26 Qualified Jobs"]),
    cm: toNumber(row["CM ARUTY26 Qualified Jobs"]),
  };
  const arutyRewardsEarned = {
    ppm: toNumber(row["PPM ARUTY26 Rewards Earned"]),
    pm: toNumber(row["PM ARUTY26 Rewards Earned"]),
    cm: toNumber(row["CM ARUTY26 Rewards Earned"]),
  };
  const arsqlQualifiedJobs = {
    ppm: toNumber(row["PPM ARSQL26 Qualified Sequel PAL Jobs"]),
    pm: toNumber(row["PM ARSQL26 Qualified Sequel PAL Jobs"]),
    cm: toNumber(row["CM ARSQL26 Qualified Sequel PAL Jobs"]),
  };
  const arsqlRebateTotal = {
    ppm: toNumber(row["PPM ARSQL26 Sequel PAL Rebate Total"]),
    pm: toNumber(row["PM ARSQL26 Sequel PAL Rebate Total"]),
    cm: toNumber(row["CM ARSQL26 Sequel PAL Rebate Total"]),
  };
  const hasMonthlyActivity = (value) => value.ppm > 0 || value.pm > 0 || value.cm > 0;

  return {
    brand_usage: {
      hoya_jobs: monthlyValues(row, "Hoya Orders"),
      shamir_jobs: monthlyValues(row, "Shamir Orders"),
      tokai_jobs: monthlyValues(row, "Tokai Orders"),
      varilux_jobs: monthlyValues(row, "Varilux Orders"),
      neurolens_jobs: monthlyValues(row, "Neurolens Orders"),
      sequel_jobs: monthlyValues(row, "Sequel Orders"),
      iot_artisan_jobs: monthlyValues(row, "IOT Artisan Orders"),
    },
    material_usage: {
      plastic_jobs: monthlyValues(row, "Plastic Orders"),
      trivex_jobs: monthlyValues(row, "Trivex Orders"),
      hi_index_160_jobs: monthlyValues(row, "Hi Index 1.60 Orders"),
      hi_index_167_jobs: monthlyValues(row, "Hi Index 1.67 Orders"),
      hi_index_174_jobs: monthlyValues(row, "Hi Index 1.74 Orders"),
    },
    specialty_usage: {
      photochromic_jobs: monthlyValues(row, "Photochromic"),
      polarized_jobs: monthlyValues(row, "Polarized"),
      multiple_pair_jobs: monthlyValues(row, "Multiple Pairs"),
    },
    turnaround: {
      average_days: monthlyValues(row, "Average Turnaround Time"),
    },
    rewards: {
      arpmp26: {
        enrolled: truthyUsage(row["Is Enrolled in ARPMP26 Display"]) || hasMonthlyActivity(arpmpQualifiedJobs) || hasMonthlyActivity(arpmpRebateTotal),
        qualified_pmp_jobs: arpmpQualifiedJobs,
        rebate_total: arpmpRebateTotal,
      },
      aruty26: {
        enrolled: truthyUsage(row["Is Enrolled in ARUTY26 Display"]) || hasMonthlyActivity(arutyQualifiedJobs) || hasMonthlyActivity(arutyRewardsEarned),
        qualified_jobs: arutyQualifiedJobs,
        rewards_earned: arutyRewardsEarned,
      },
      arsql26: {
        enrolled: truthyUsage(row["Is ARSQL26 Customer"]) || hasMonthlyActivity(arsqlQualifiedJobs) || hasMonthlyActivity(arsqlRebateTotal),
        qualified_sequel_pal_jobs: arsqlQualifiedJobs,
        rebate_total: arsqlRebateTotal,
      },
    },
  };
}

function classifyAccount(row) {
  const cmJobs = toNumber(row["CM Jobs"]);
  const pmJobs = toNumber(row["PM Jobs"]);
  const ppmJobs = toNumber(row["PPM Jobs"]);
  const cmSales = toNumber(row["CM Sales"]);
  const pmSales = toNumber(row["PM Sales"]);
  const ppmSales = toNumber(row["PPM Sales"]);
  const cmNlJobs = toNumber(row["CM NL Jobs"]);
  const cmSqlJobs = toNumber(row["CM SQL Jobs"]);
  const cmVspJobs = toNumber(row["CM VSP Jobs"]);
  const vspShare = pct(cmVspJobs, cmJobs);
  const privatePayMix = Math.max(0, 1 - vspShare);

  const programUsage = {
    modern_package_usage: toText(row["Modern Pkg Usage"]),
    modern_frame_usage: toText(row["Modern Frm Usage"]),
    chemclip_usage: toText(row["ChemClip Usage"]),
    speccheck_usage: toText(row["SpecCheck Usage"]),
    tokai_usage: toText(row["Tokai Usage"]),
  };

  const qualityRates = {
    lab_redo_pct: {
      ppm: toNumber(row["PPM Lab Redo %"]),
      pm: toNumber(row["PM Lab Redo %"]),
      cm: toNumber(row["CM Lab Redo %"]),
    },
    office_redo_pct: {
      ppm: toNumber(row["PPM Office Redo %"]),
      pm: toNumber(row["PM Office Redo %"]),
      cm: toNumber(row["CM Office Redo %"]),
    },
      warranty_pct: {
      ppm: toNumber(row["PPM Warranty Redo %"] || row["PPM Warranty %"]),
      pm: toNumber(row["PM Warranty Redo %"] || row["PM Warranty %"]),
      cm: toNumber(row["CM Warranty Redo %"] || row["CM Warranty %"]),
    },
    non_adapt_pct: {
      ppm: toNumber(row["PPM Non-Adapt %"]),
      pm: toNumber(row["PM Non-Adapt %"]),
      cm: toNumber(row["CM Non-Adapt %"]),
    },
  };

  const supplementalIntelligence = buildSupplementalIntelligence(row);
  const programEnrollment = {
    arsql26: Boolean(supplementalIntelligence.rewards.arsql26.enrolled),
    arpmp26: Boolean(supplementalIntelligence.rewards.arpmp26.enrolled),
    aruty26: Boolean(supplementalIntelligence.rewards.aruty26.enrolled),
  };

  const metrics = {
    jobs_trend: trendDirection(cmJobs, pmJobs),
    sales_trend: trendDirection(cmSales, pmSales),
    jobs_growth_vs_last_month: growthRate(cmJobs, pmJobs),
    sales_growth_vs_last_month: growthRate(cmSales, pmSales),
    net_lens_share: pct(cmNlJobs, cmJobs),
    sql_share: pct(cmSqlJobs, cmJobs),
    vsp_share: vspShare,
    private_pay_mix: privatePayMix,
  };

  const insights = [];
  if (cmJobs < pmJobs) insights.push("Current-month jobs are down versus last month. Review volume recovery opportunities.");
  if (cmSales > pmSales) insights.push("Current-month sales are up versus last month. Momentum is improving.");
  if (metrics.vsp_share > 0.65) insights.push("VSP share is high this month. Evaluate private-pay growth opportunities.");
  if (metrics.net_lens_share < 0.25) insights.push("Net lens share is low this month. Net lens conversion opportunity identified.");
  if (!toText(programUsage.tokai_usage)) insights.push("Tokai usage is not recorded. Consider Tokai program activation.");
  if (!toText(programUsage.chemclip_usage)) insights.push("ChemClip usage is not recorded. Consider ChemClip usage outreach.");
  if (toText(row["Previous Month Tier Rank by Acct ID"])) {
    insights.push(`Previous month tier rank: ${toText(row["Previous Month Tier Rank by Acct ID"])}.`);
  }

  return {
    account_id: normalizeAcctId(row["Acct ID"]),
    pipedrive_id: toText(row["Pipedrive ID"]),
    business_name: toText(row["Last Business Name"]),
    all_account_numbers: toText(row["All Account Numbers"]),
    address: toText(row["Last Full Address"]),
    division: toText(row["Last Division"]),
    latest_ship_date: toIsoDate(row["Latest Date Shipped"]),
    primary_pal_brand_private_pay: toText(row["Primary PAL Brand (Private Pay)"]),
    primary_pal_brand_vsp: toText(row["Primary PAL Brand (VSP)"]),
    lab_name: toText(row["Last Lab Name"]),
    phone: toText(row["Last Phone Number"]),
    state: toText(row["Last State"]),
    sales_rep: toText(row["Last Sales Rep"]).toUpperCase(),
    used_price_lists: parseUsedPriceLists(row["Used Price Lists"]),
    data_refresh_date: toIsoDate(row["Data Refresh Date"]),
    tier_status: {
      previous_month_tier_rank_by_acct_id: toText(row["Previous Month Tier Rank by Acct ID"]) || "Unranked",
    },
    purchase_summary: {
      jobs: { ppm: ppmJobs, pm: pmJobs, cm: cmJobs },
      sales: { ppm: ppmSales, pm: pmSales, cm: cmSales },
    },
    performance_rates: {
      jobs_per_day: monthlyValues(row, "JPD"),
    },
    product_mix: {
      net_lens_jobs: { ppm: toNumber(row["PPM NL Jobs"]), pm: toNumber(row["PM NL Jobs"]), cm: cmNlJobs },
      sql_jobs: { ppm: toNumber(row["PPM SQL Jobs"]), pm: toNumber(row["PM SQL Jobs"]), cm: cmSqlJobs },
    },
    vsp_private_pay_mix: {
      vsp_jobs: { ppm: toNumber(row["PPM VSP Jobs"]), pm: toNumber(row["PM VSP Jobs"]), cm: cmVspJobs },
      net_lens_share: metrics.net_lens_share,
      sql_share: metrics.sql_share,
      vsp_share: metrics.vsp_share,
      private_pay_mix: metrics.private_pay_mix,
      primary_pal_brand_private_pay: toText(row["Primary PAL Brand (Private Pay)"]),
      primary_pal_brand_vsp: toText(row["Primary PAL Brand (VSP)"]),
    },
    program_usage: {
      ...programUsage,
      flags: {
        modern_package: truthyUsage(programUsage.modern_package_usage),
        modern_frame: truthyUsage(programUsage.modern_frame_usage),
        chemclip: truthyUsage(programUsage.chemclip_usage),
        speccheck: truthyUsage(programUsage.speccheck_usage),
        tokai: truthyUsage(programUsage.tokai_usage),
      },
    },
    quality_metrics: qualityRates,
    program_enrollment: programEnrollment,
    supplemental_intelligence: supplementalIntelligence,
    data_lineage: {
      source_files: row.__source_files ?? [],
      field_precedence: row.__field_precedence ?? {},
    },
    customer_insights: {
      suggestions: insights,
      metrics,
    },
  };
}

function hasUserColumns(userRows) {
  if (!userRows.length) return false;
  const headerSet = new Set(Object.keys(userRows[0]));
  return REQUIRED_USER_COLUMNS.every((column) => headerSet.has(column));
}

function buildUserAccessFromExistingSnapshot(validAccountIds) {
  const existingUsersToAccounts = readJson(path.join(currentDir, "users_to_accounts.json")) ?? [];
  const accountToUsersMap = new Map();
  const usersToAccounts = [];

  for (const entry of existingUsersToAccounts) {
    const email = normalizeEmail(entry.email);
    if (!email) continue;
    const accountIds = (entry.account_ids ?? [])
      .map((value) => normalizeAcctId(value))
      .filter((acctId) => validAccountIds.has(acctId));
    if (!accountIds.length) continue;
    usersToAccounts.push({
      email,
      account_ids: [...new Set(accountIds)].sort(),
      user_profiles: entry.user_profiles ?? [],
    });
  }

  for (const acctId of validAccountIds) {
    const existingAccount = readJson(path.join(currentDir, "accounts", `${safeFileName(acctId)}.json`));
    const existingUsers = existingAccount?.authorized_users ?? [];
    if (existingUsers.length) {
      accountToUsersMap.set(
        acctId,
        existingUsers.map((user) => ({
          email: normalizeEmail(user.email),
          name: toText(user.name),
          organization: toText(user.organization),
          marketing_status: toText(user.marketing_status),
          role_type: toText(user.role_type),
          division: "",
          targeted_programs: "",
          all_account_numbers: "",
          organization_acct_id: acctId,
          organization_numeric_id: "",
        }))
      );
    }
  }

  return {
    usersToAccounts,
    accountToUsersMap,
    userRowsCount: 0,
    userRowsWithAccount: 0,
    invalidUserLinksCount: 0,
    uniqueUserEmails: usersToAccounts.length,
    skippedUserSummaryRows: 0,
    reusedExistingSnapshotUsers: true,
  };
}

function buildUserAccess(userRows, validAccountIds, allowInvalidUserAccountLinks) {
  if (!userRows.length) throw new Error("No user rows found in source export.");
  const headerSet = new Set(Object.keys(userRows[0]));
  const missingColumns = REQUIRED_USER_COLUMNS.filter((column) => !headerSet.has(column));
  if (missingColumns.length > 0) throw new Error(`Missing required user columns: ${missingColumns.join(", ")}`);

  const usersToAccountsMap = new Map();
  const accountToUsersMap = new Map();
  const invalidUserLinks = [];
  let skippedUserSummaryRows = 0;
  let userRowsWithAccount = 0;

  for (const row of userRows) {
    if (isUserSummaryArtifactRow(row)) {
      skippedUserSummaryRows += 1;
      continue;
    }

    const acctId = normalizeAcctId(row["Organization - Acct ID"]);
    const emails = [...new Set([
      ...splitEmails(row["Person - Email - Work"]),
      ...splitEmails(row["Person - Email - Home"]),
      ...splitEmails(row["Person - Email - Other"]),
    ])];
    if (!acctId || emails.length === 0) continue;
    userRowsWithAccount += 1;

    if (!validAccountIds.has(acctId)) {
      invalidUserLinks.push({
        "Organization - Acct ID": acctId,
        "Person - Name": toText(row["Person - Name"]),
        "Person - Organization": toText(row["Person - Organization"]),
        "Person - Email - Work": toText(row["Person - Email - Work"]),
        "Person - Email - Home": toText(row["Person - Email - Home"]),
        "Person - Email - Other": toText(row["Person - Email - Other"]),
      });
      continue;
    }

    const userMetadata = {
      name: toText(row["Person - Name"]),
      organization: toText(row["Person - Organization"]),
      marketing_status: toText(row["Person - Marketing status"]),
      role_type: toText(row["Person - Role Type"]),
      division: toText(row["Organization - Division"]),
      targeted_programs: toText(row["Organization - Targeted Programs"]),
      all_account_numbers: toText(row["Organization - All Account Numbers"]),
      organization_acct_id: acctId,
      organization_numeric_id: toText(row["Organization - Numeric ID"]),
    };

    for (const email of emails) {
      const current = usersToAccountsMap.get(email) ?? { email, account_ids: new Set(), user_profiles: [] };
      current.account_ids.add(acctId);
      current.user_profiles.push(userMetadata);
      usersToAccountsMap.set(email, current);

      const byAccount = accountToUsersMap.get(acctId) ?? [];
      byAccount.push({ email, ...userMetadata });
      accountToUsersMap.set(acctId, byAccount);
    }
  }

  if (invalidUserLinks.length > 0) {
    writeCsvReport(
      "users-with-invalid-acct-id-links.csv",
      [
        "Organization - Acct ID",
        "Person - Name",
        "Person - Organization",
        "Person - Email - Work",
        "Person - Email - Home",
        "Person - Email - Other",
      ],
      invalidUserLinks
    );
    if (!allowInvalidUserAccountLinks) {
      throw new Error(
        `Validation failed: ${invalidUserLinks.length} user rows reference non-existent Organization - Acct ID values.`
      );
    }
  }

  const usersToAccounts = [...usersToAccountsMap.values()]
    .map((entry) => ({
      email: entry.email,
      account_ids: [...entry.account_ids].sort(),
      user_profiles: entry.user_profiles,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));

  return {
    usersToAccounts,
    accountToUsersMap,
    userRowsCount: userRows.length,
    userRowsWithAccount,
    invalidUserLinksCount: invalidUserLinks.length,
    uniqueUserEmails: usersToAccounts.length,
    skippedUserSummaryRows,
  };
}

function summarizeAuthorizedUsers(users = []) {
  const uniqueEmails = [...new Set(users.map((user) => user.email).filter(Boolean))].sort();
  const marketingStatusCounts = {};
  for (const user of users) {
    const key = toText(user.marketing_status) || "Unknown";
    marketingStatusCounts[key] = (marketingStatusCounts[key] ?? 0) + 1;
  }
  return {
    authorized_user_count: uniqueEmails.length,
    primary_emails: uniqueEmails.slice(0, 10),
    marketing_status_summary: marketingStatusCounts,
  };
}

function detailedAuthorizedUsers(users = []) {
  const byEmail = new Map();
  for (const user of users) {
    const email = toText(user.email).toLowerCase();
    if (!email) continue;
    if (!byEmail.has(email)) {
      byEmail.set(email, {
        name: toText(user.name),
        email,
        role_type: toText(user.role_type),
        marketing_status: toText(user.marketing_status),
        organization: toText(user.organization),
        targeted_programs: toText(user.targeted_programs),
      });
    }
  }
  return [...byEmail.values()].sort((a, b) => a.email.localeCompare(b.email));
}

function monthlyAverage(values) {
  const valid = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!valid.length) return 0;
  return valid.reduce((total, value) => total + value, 0) / valid.length;
}

function buildLabTurnaroundAverages(accounts) {
  const byLab = new Map();
  for (const account of accounts) {
    const lab = toText(account.lab_name) || "Unknown";
    const averageDays = account.supplemental_intelligence?.turnaround?.average_days ?? {};
    const current = byLab.get(lab) ?? { ppm: [], pm: [], cm: [] };
    current.ppm.push(toNumber(averageDays.ppm));
    current.pm.push(toNumber(averageDays.pm));
    current.cm.push(toNumber(averageDays.cm));
    byLab.set(lab, current);
  }

  return new Map(
    [...byLab.entries()].map(([lab, values]) => [
      lab,
      {
        ppm: monthlyAverage(values.ppm),
        pm: monthlyAverage(values.pm),
        cm: monthlyAverage(values.cm),
      },
    ])
  );
}

function writeJson(filePath, data) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function readJson(filePath) {
  if (!existsSync(filePath)) return undefined;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return undefined;
  }
}

function resolveInputPath(explicitPath, candidates, label) {
  if (explicitPath) return path.isAbsolute(explicitPath) ? explicitPath : path.join(root, explicitPath);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error(`No default ${label} input found. Checked: ${candidates.map((c) => path.relative(root, c)).join(", ")}`);
  return found;
}

function resolveInputPaths(explicitPaths, candidates) {
  const values = explicitPaths.length > 0 ? explicitPaths : candidates;
  return [...new Set(values
    .filter(Boolean)
    .map((candidate) => (path.isAbsolute(candidate) ? candidate : path.join(root, candidate)))
    .filter((candidate) => existsSync(candidate)))];
}

function discoveredFieldsForSource(sourceFile, rows) {
  const fieldNames = [...new Set(rows.flatMap((row) => Object.keys(row).filter((key) => key && !key.startsWith("__"))))].sort();
  return {
    source_file: path.relative(root, sourceFile),
    row_count: rows.length,
    fields: fieldNames,
  };
}

function copyDir(source, destination) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

async function main() {
  const args = parseArgs();
  const accountInputPath = resolveInputPath(args.accountInput, defaultAccountInputCandidates, "account");
  const userInputPath = resolveInputPath(args.userInput, defaultUserInputCandidates, "user");
  const userSourceManifestPath =
    path.basename(userInputPath).toLowerCase() === "user_data.xlsx"
      ? "private-source/portal/user_data.xlsx"
      : path.relative(root, userInputPath);
  const supplementalAccountInputPaths = resolveInputPaths(args.supplementalInputs, defaultSupplementalAccountInputCandidates)
    .filter((sourceFile) => sourceFile !== accountInputPath);
  const accountSourcePaths = [accountInputPath, ...supplementalAccountInputPaths];
  const accountSourceRows = [];
  const dataDictionary = [];
  for (const sourceFile of accountSourcePaths) {
    const rows = await readRows(sourceFile, args.accountSheet, ACCOUNT_HEADER_ALIASES);
    dataDictionary.push(discoveredFieldsForSource(sourceFile, rows));
    accountSourceRows.push(...rows.map((row) => ({ row, sourceFile })));
  }
  const accountRows = accountSourceRows.map((entry) => entry.row);
  const userRows = await readRows(userInputPath, args.userSheet, USER_HEADER_ALIASES);

  const accountValidation = validateAccountRows(accountRows, args.allowDuplicateAcctId, args.ignoreEmptySummaryRows);
  const validRowsByReference = new Set(accountValidation.cleanedRows);
  const validAccountSourceRows = accountSourceRows.filter((entry) =>
    validRowsByReference.has(entry.row)
  );
  const normalizedAccountRows =
    accountSourcePaths.length === 1 &&
    path.extname(accountSourcePaths[0]).toLowerCase() === ".json"
      ? mergeDuplicateRows(validAccountSourceRows.map((entry) => entry.row)).map(
          (row) => ({
            ...row,
            __source_files: [path.relative(root, accountSourcePaths[0])],
            __field_precedence: Object.fromEntries(
              Object.keys(row)
                .filter((key) => key && !key.startsWith("__"))
                .map((key) => [key, path.relative(root, accountSourcePaths[0])])
            ),
          })
        )
      : mergeUnifiedAccountRows(validAccountSourceRows);

  const classifiedAccounts = normalizedAccountRows.map(classifyAccount);
  const accountIds = new Set(classifiedAccounts.map((account) => account.account_id));
  const userAccess = hasUserColumns(userRows)
    ? buildUserAccess(userRows, accountIds, args.allowInvalidUserAccountLinks)
    : buildUserAccessFromExistingSnapshot(accountIds);

  const releaseId = new Date().toISOString().replace(/[:.]/g, "-");
  const releaseDir = path.join(releasesDir, releaseId);
  mkdirSync(releaseDir, { recursive: true });

  const accountsIndex = [];
  const refreshDateCandidates = new Set();
  let accountsWithoutUsers = 0;
  const labTurnaroundAverages = buildLabTurnaroundAverages(classifiedAccounts);

  for (const account of classifiedAccounts) {
    refreshDateCandidates.add(account.data_refresh_date);
    const usersForAccount = userAccess.accountToUsersMap.get(account.account_id) ?? [];
    if (usersForAccount.length === 0) accountsWithoutUsers += 1;
    const labAverageDays = labTurnaroundAverages.get(toText(account.lab_name) || "Unknown");

    const accountOutput = {
      ...account,
      supplemental_intelligence: {
        ...(account.supplemental_intelligence ?? {}),
        turnaround: {
          ...(account.supplemental_intelligence?.turnaround ?? {}),
          lab_average_days: labAverageDays ?? { ppm: 0, pm: 0, cm: 0 },
        },
      },
      authorized_users_summary: summarizeAuthorizedUsers(usersForAccount),
      authorized_users: detailedAuthorizedUsers(usersForAccount),
    };

    accountsIndex.push({
      account_id: account.account_id,
      business_name: account.business_name,
      account_name: account.business_name,
      pipedrive_id: account.pipedrive_id,
      all_account_numbers: account.all_account_numbers,
      last_lab_name: account.lab_name,
      lab: account.lab_name,
      state: account.state,
      division: account.division,
      latest_date_shipped: account.latest_ship_date,
      data_refresh_date: account.data_refresh_date,
      customer_type: account.division || "",
      sales_rep: account.sales_rep || "",
      cm_sales: Number(account.purchase_summary?.sales?.cm ?? 0),
      cm_jobs: Number(account.purchase_summary?.jobs?.cm ?? 0),
      ppm_jpd: Number(account.performance_rates?.jobs_per_day?.ppm ?? 0) || null,
      pm_jpd: Number(account.performance_rates?.jobs_per_day?.pm ?? 0) || null,
      cm_jpd: Number(account.performance_rates?.jobs_per_day?.cm ?? 0) || null,
      authorized_user_count: accountOutput.authorized_users_summary.authorized_user_count,
      price_lists: account.used_price_lists ?? [],
    });

    writeJson(path.join(releaseDir, "accounts", `${safeFileName(account.account_id)}.json`), accountOutput);
  }

  accountsIndex.sort((a, b) => a.account_id.localeCompare(b.account_id));
  const latestRefreshDate = [...refreshDateCandidates].filter(Boolean).sort().slice(-1)[0] ?? "";

  writeJson(path.join(releaseDir, "users_to_accounts.json"), userAccess.usersToAccounts);
  writeJson(path.join(releaseDir, "accounts_index.json"), accountsIndex);

  const manifest = {
    snapshot_id: releaseId,
    source_account_file: path.relative(root, accountInputPath),
    source_account_files: accountSourcePaths.map((sourceFile) => path.relative(root, sourceFile)),
    source_user_file: userSourceManifestPath,
    generated_at: new Date().toISOString(),
    row_count_input_accounts: accountValidation.rowCount,
    row_count_effective_accounts: accountValidation.effectiveRowCount,
    row_count_output_accounts: accountsIndex.length,
    row_count_input_users: userAccess.userRowsCount,
    row_count_users_with_account_id: userAccess.userRowsWithAccount,
    unique_user_emails: userAccess.uniqueUserEmails,
    users_mapped_to_accounts: userAccess.usersToAccounts.length,
    accounts_without_users: accountsWithoutUsers,
    users_with_invalid_account_ids: userAccess.invalidUserLinksCount,
    data_refresh_date: latestRefreshDate,
    allow_duplicate_acct_id: args.allowDuplicateAcctId,
    ignore_empty_summary_rows: args.ignoreEmptySummaryRows,
    allow_invalid_user_account_links: args.allowInvalidUserAccountLinks,
    duplicate_acct_id_count: accountValidation.duplicateAcctIds,
    skipped_summary_rows: accountValidation.skippedSummaryRows,
    skipped_user_summary_rows: userAccess.skippedUserSummaryRows,
    refresh_dates_detected: accountValidation.refreshDates,
    data_dictionary: dataDictionary,
    field_precedence_documentation: [
      "Acct ID is the master key for all account intelligence records.",
      "Customer performance and account intelligence fields come from private-site/portal/portal_export.json.",
      "Duplicate Acct ID rows are merged using the latest and most complete Power BI record while additive account metrics are combined.",
      "Portal authorization and user-to-account access continue to come from private-source/portal/user_data.xlsx.",
      "Revenue fields are preserved only at account level: PPM Sales, PM Sales, and CM Sales.",
      "Product, material, specialty, program, reward, quality, and turnaround reporting uses counts, percentages, statuses, or timing fields only.",
    ],
    reused_existing_user_access: Boolean(userAccess.reusedExistingSnapshotUsers),
    required_account_columns: REQUIRED_ACCOUNT_COLUMNS,
    required_user_columns: REQUIRED_USER_COLUMNS,
    acct_id_pattern: ACCT_ID_PATTERN.source,
  };
  writeJson(path.join(releaseDir, "latest_snapshot_manifest.json"), manifest);

  mkdirSync(outputBaseDir, { recursive: true });
  copyDir(releaseDir, tempCurrentDir);
  rmSync(previousCurrentDir, { recursive: true, force: true });
  if (existsSync(currentDir)) renameSync(currentDir, previousCurrentDir);
  renameSync(tempCurrentDir, currentDir);

  console.log(`[portal-dashboard-v1] source accounts: ${path.relative(root, accountInputPath)}`);
  console.log(`[portal-dashboard-v1] source users: ${path.relative(root, userInputPath)}`);
  console.log(`[portal-dashboard-v1] input account rows: ${accountValidation.rowCount}`);
  console.log(`[portal-dashboard-v1] skipped artifact rows: ${accountValidation.skippedSummaryRows}`);
  console.log(`[portal-dashboard-v1] valid account count: ${accountsIndex.length}`);
  console.log(`[portal-dashboard-v1] user rows: ${userAccess.userRowsCount}`);
  console.log(`[portal-dashboard-v1] unique user emails: ${userAccess.uniqueUserEmails}`);
  console.log(`[portal-dashboard-v1] users mapped to accounts: ${userAccess.usersToAccounts.length}`);
  console.log(`[portal-dashboard-v1] accounts without users: ${accountsWithoutUsers}`);
  console.log(`[portal-dashboard-v1] users with invalid account IDs: ${userAccess.invalidUserLinksCount}`);
  console.log(`[portal-dashboard-v1] skipped user summary rows: ${userAccess.skippedUserSummaryRows}`);
  console.log(`[portal-dashboard-v1] snapshot refresh date: ${latestRefreshDate || "unknown"}`);
  console.log(`[portal-dashboard-v1] current output: ${path.relative(root, currentDir)}`);
}

main().catch((error) => {
  console.error("[portal-dashboard-v1] failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
