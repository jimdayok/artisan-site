import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

const root = process.cwd();
const portalDir = path.join(root, 'private-source', 'portal');
const userPath = path.join(portalDir, 'User_Data.xlsx');
const accountPath = path.join(portalDir, 'Acct_Data.xlsx');
const outputPath = path.join(portalDir, 'workbook-access.json');
const workbookDataOutputPath = path.join(portalDir, 'workbook-data.json');
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'text',
});

const typeMap = {
  PART: { label: 'Artisan Equity Partner', priceList: 'P6' },
  GENL: { label: 'Artisan General Customer', priceList: 'G6' },
  PMP: { label: 'Artisan PMP Partner', priceList: 'A6' },
  ACQU: { label: 'Artisan Acquios Partner', priceList: 'A6' },
  NL: { label: 'Artisan Neurolens Partner', priceList: 'G6' },
};
const typePriority = ['PART', 'PMP', 'ACQU', 'NL', 'GENL'];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function columnIndex(cellRef) {
  const letters = String(cellRef || 'A').match(/[A-Z]+/i)?.[0] || 'A';

  return [...letters.toUpperCase()].reduce(
    (total, letter) => total * 26 + letter.charCodeAt(0) - 64,
    0
  ) - 1;
}

function sharedStringText(sharedString) {
  if (!sharedString) return '';
  if (sharedString.t !== undefined && typeof sharedString.t !== 'object') {
    return toText(sharedString.t);
  }
  if (sharedString.t?.text) return sharedString.t.text;

  return asArray(sharedString.r)
    .map((run) => (typeof run.t === 'string' ? run.t : run.t?.text || ''))
    .join('');
}

async function readWorkbookRows(filePath, sheetName) {
  if (!existsSync(filePath)) return [];
  const zip = await JSZip.loadAsync(readFileSync(filePath));
  const workbookXml = await zip.file('xl/workbook.xml')?.async('text');
  const relsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('text');

  if (!workbookXml || !relsXml) return [];

  const workbook = xmlParser.parse(workbookXml).workbook;
  const rels = xmlParser.parse(relsXml).Relationships;
  const sheet = asArray(workbook.sheets?.sheet).find((entry) => entry.name === sheetName);

  if (!sheet) return [];

  const rel = asArray(rels.Relationship).find((entry) => entry.Id === sheet['r:id']);
  const target = rel?.Target?.replace(/^\/?xl\//, '');
  const sheetPath = target ? `xl/${target}` : '';
  const sheetXml = sheetPath ? await zip.file(sheetPath)?.async('text') : '';

  if (!sheetXml) return [];

  const sharedStringsXml = await zip.file('xl/sharedStrings.xml')?.async('text');
  const sharedStrings = sharedStringsXml
    ? asArray(xmlParser.parse(sharedStringsXml).sst?.si).map(sharedStringText)
    : [];
  const parsedSheet = xmlParser.parse(sheetXml).worksheet;

  return asArray(parsedSheet.sheetData?.row).map((row) => {
    const output = [];

    for (const cell of asArray(row.c)) {
      const index = columnIndex(cell.r);
      let value = '';

      if (cell.t === 's') {
        value = sharedStrings[Number(cell.v)] ?? '';
      } else if (cell.t === 'inlineStr') {
        value = sharedStringText(cell.is);
      } else if (cell.v !== undefined) {
        value = cell.v;
      }

      output[index] = value;
    }

    return output;
  });
}

async function readSheet(filePath, sheetName) {
  const sheetRows = await readWorkbookRows(filePath, sheetName);
  if (!sheetRows.length) return [];

  const headers = [];
  const rows = [];

  sheetRows.forEach((values, rowIndex) => {
    if (rowIndex === 0) {
      for (let index = 0; index < values.length; index += 1) {
        headers[index] = toText(values[index]);
      }
      return;
    }

    const record = {};
    let hasValue = false;

    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      if (!header) continue;

      const value = values[index] ?? '';
      const textValue = toText(value);
      record[header] = value;
      if (textValue) hasValue = true;
    }

    if (hasValue) rows.push(record);
  });

  return rows;
}

function toText(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if ('text' in value) return toText(value.text);
    if ('result' in value) return toText(value.result);
    if ('richText' in value) return value.richText.map((part) => part.text || '').join('').trim();
    if ('hyperlink' in value && 'text' in value) return toText(value.text);
  }
  return String(value).trim();
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(toText(value).replace(/[$,%\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toExcelDateText(value) {
  const textValue = toText(value);
  const serial = Number(textValue);

  if (!Number.isFinite(serial) || serial <= 0 || /-/.test(textValue)) {
    return textValue;
  }

  const epoch = Date.UTC(1899, 11, 30);
  const date = new Date(epoch + serial * 24 * 60 * 60 * 1000);

  return date.toISOString().slice(0, 10);
}

function toAccountNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(Math.trunc(value));
  return toText(value).replace(/\.0$/, '');
}

function accountKey(value) {
  return toAccountNumber(value).replace(/^0+(?=\d)/, '');
}

function emailList(value) {
  return toText(value)
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email && email !== '20' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function parsePeople(rows) {
  return rows
    .map((row) => {
      const emails = [
        ...emailList(row['Person - Email - Work']),
        ...emailList(row['Person - Email - Home']),
        ...emailList(row['Person - Email - Other']),
      ];

      return {
        name: toText(row['Person - Name']),
        organization: toText(row['Person - Organization']),
        accountNumber: toAccountNumber(row['Organization - Account Number']),
        emails: [...new Set(emails)],
      division: toText(row['Organization - Division']),
      artisanLab: toText(row['Organization - Artisan Lab']),
      targetedPrograms: toText(row['Organization - Targeted Programs']),
      lastOrderShipped: toExcelDateText(row['Organization - Last Order Shipped']),
      };
    })
    .filter((person) => person.accountNumber && person.emails.length > 0);
}

function parseAccounts(rows) {
  return rows
    .map((row) => ({
      accountName: toText(row['Account Name']),
      accountNumber: toAccountNumber(row['Last Account Number']),
      division: toText(row['Last Division']),
      salesRep: toText(row['Last Sales Rep']),
      lastShippedDate: toExcelDateText(row['Last Shipped Date']),
      primaryPalPrivatePay: toText(row['Primary PAL Brand (Private Pay)']),
      primaryPalVsp: toText(row['Primary PAL Brand (VSP)']),
      lastLabName: toText(row['Last Lab Name']),
      fullAddress: toText(row['Full Address']),
      phoneNumber: toText(row['Last Phone Number']),
      state: toText(row['Last State']),
      zipCode: toText(row['Last Zip Code']),
      modernPkgUsage: toText(row['Modern Pkg Usage']),
      modernFrmUsage: toText(row['Modern Frm Usage']),
      chemClipUsage: toText(row['ChemClip Usage']),
      specCheckUsage: toText(row['SpecCheck Usage']),
      tokaiUsage: toText(row['Tokai Usage']),
      tier: toText(row['CM/PM Tier']),
      ppmJobs: toNumber(row['PPM Jobs']),
      pmJobs: toNumber(row['PM Jobs']),
      cmJobs: toNumber(row['CM Jobs']),
      ppmSales: toNumber(row['PPM Sales']),
      pmSales: toNumber(row['PM Sales']),
      cmSales: toNumber(row['CM Sales']),
      ppmJpd: toNumber(row['PPM JPD']),
      pmJpd: toNumber(row['PM JPD']),
      cmJpd: toNumber(row['CM JPD']),
      ppmNlJobs: toNumber(row['PPM NL Jobs']),
      pmNlJobs: toNumber(row['PM NL Jobs']),
      cmNlJobs: toNumber(row['CM NL Jobs']),
      pmNlSow: toNumber(row['PM NL SOW']),
      ppmNlSow: toNumber(row['PPM NL SOW']),
      cmNlSow: toNumber(row['CM NL SOW']),
      cmSqlJobs: toNumber(row['CM SQL Jobs']),
      pmSqlJobs: toNumber(row['PM SQL Jobs']),
      ppmSqlJobs: toNumber(row['PPM SQL Jobs']),
      ppmVspJobs: toNumber(row['PPM VSP Jobs']),
      pmVspJobs: toNumber(row['PM VSP Jobs']),
      cmVspJobs: toNumber(row['CM VSP Jobs']),
      ppmVspSow: toNumber(row['PPM VSP SOW']),
      pmVspSow: toNumber(row['PM VSP SOW']),
      cmVspSow: toNumber(row['CM VSP SOW']),
      lastShippedDateGlobal: toExcelDateText(row['Last Shipped Date (Global)']),
    }))
    .filter((account) => account.accountNumber);
}

const userRows = await readSheet(userPath, 'person list');
const accountRows = await readSheet(accountPath, 'Export');
const people = parsePeople(userRows);
const rawAccounts = parseAccounts(accountRows);

const accounts = rawAccounts.map((account) => ({
  accountNumber: account.accountNumber,
  accountName: account.accountName,
  division: account.division,
}));
const accountGroups = new Map();
for (const account of accounts) {
  const key = accountKey(account.accountNumber);
  if (!key) continue;
  accountGroups.set(key, [...(accountGroups.get(key) || []), account]);
}
const normalizedAccounts = [...accountGroups.entries()].map(([key, rows]) => {
  const detectedCustomerTypeCodes = [
    ...new Set(
      rows
        .map((row) => row.division.trim().toUpperCase())
        .filter((code) => typeMap[code])
    ),
  ];
  const customerTypeCode =
    typePriority.find((code) => detectedCustomerTypeCodes.includes(code)) || '';
  const accountName =
    rows
      .map((row) => row.accountName)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] || '';

  return {
    accountNumber: key,
    accountName,
    customerTypeCode,
    detectedCustomerTypeCodes,
  };
});
const accountsByNumber = new Map(
  normalizedAccounts.map((account) => [accountKey(account.accountNumber), account])
);

const access = people
  .flatMap((person) => {
    const accountNumber = toAccountNumber(person.accountNumber);
    const account = accountsByNumber.get(accountKey(accountNumber));
    const workbookTypeCode = account?.customerTypeCode || '';
    const personTypeCode = toText(person.division).trim().toUpperCase();
    const customerTypeCode = workbookTypeCode || (typeMap[personTypeCode] ? personTypeCode : '');
    const typeInfo = typeMap[customerTypeCode];

    return [...new Set(person.emails)].map((email) => ({
      email,
      accountNumber: account?.accountNumber || accountNumber,
      practiceName: account?.accountName || person.organization,
      customerTypeCode: typeInfo ? customerTypeCode : '',
      customerTypeLabel: typeInfo?.label || '',
      detectedCustomerTypeCodes: account?.detectedCustomerTypeCodes || [],
      allowedPriceLists: typeInfo ? [typeInfo.priceList] : [],
      portalSections: ['pricing', 'performance'],
      targetedPrograms: person.targetedPrograms,
    }));
  })
  .filter((record) => record.email && record.accountNumber && record.practiceName);

writeFileSync(
  workbookDataOutputPath,
  `${JSON.stringify({ people, accounts: rawAccounts }, null, 2)}\n`
);
writeFileSync(outputPath, `${JSON.stringify(access, null, 2)}\n`);
console.log(`Wrote workbook data to ${workbookDataOutputPath}`);
console.log(`Wrote ${access.length} workbook access records to ${outputPath}`);
