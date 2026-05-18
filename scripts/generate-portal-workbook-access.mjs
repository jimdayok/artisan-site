import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';

const root = process.cwd();
const portalDir = path.join(root, 'private-source', 'portal');
const userPath = path.join(portalDir, 'User_Data.xlsx');
const accountPath = path.join(portalDir, 'Acct_Data.xlsx');
const outputPath = path.join(portalDir, 'workbook-access.json');

const typeMap = {
  PART: { label: 'Artisan Equity Partner', priceList: 'P6' },
  GENL: { label: 'Artisan General Customer', priceList: 'G6' },
  PMP: { label: 'Artisan PMP Partner', priceList: 'A6' },
  ACQU: { label: 'Artisan Acquios Partner', priceList: 'A6' },
  NL: { label: 'Artisan Neurolens Partner', priceList: 'G6' },
};
const typePriority = ['PART', 'PMP', 'ACQU', 'NL', 'GENL'];

function readSheet(filePath, sheetName) {
  if (!existsSync(filePath)) return [];
  const workbook = XLSX.read(readFileSync(filePath), { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });
}

function toText(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
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

const accounts = readSheet(accountPath, 'Export').map((row) => ({
  accountNumber: toAccountNumber(row['Last Account Number']),
  accountName: toText(row['Account Name']),
  division: toText(row['Last Division']),
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

const access = readSheet(userPath, 'person list')
  .flatMap((row) => {
    const accountNumber = toAccountNumber(row['Organization - Account Number']);
    const account = accountsByNumber.get(accountKey(accountNumber));
    const workbookTypeCode = account?.customerTypeCode || '';
    const personTypeCode = toText(row['Organization - Division']).trim().toUpperCase();
    const customerTypeCode = workbookTypeCode || (typeMap[personTypeCode] ? personTypeCode : '');
    const typeInfo = typeMap[customerTypeCode];
    const emails = [
      ...emailList(row['Person - Email - Work']),
      ...emailList(row['Person - Email - Home']),
      ...emailList(row['Person - Email - Other']),
    ];

    return [...new Set(emails)].map((email) => ({
      email,
      accountNumber: account?.accountNumber || accountNumber,
      practiceName: account?.accountName || toText(row['Person - Organization']),
      customerTypeCode: typeInfo ? customerTypeCode : '',
      customerTypeLabel: typeInfo?.label || '',
      detectedCustomerTypeCodes: account?.detectedCustomerTypeCodes || [],
      allowedPriceLists: typeInfo ? [typeInfo.priceList] : [],
      portalSections: ['pricing', 'performance'],
      targetedPrograms: toText(row['Organization - Targeted Programs']),
    }));
  })
  .filter((record) => record.email && record.accountNumber && record.practiceName);

writeFileSync(outputPath, `${JSON.stringify(access, null, 2)}\n`);
console.log(`Wrote ${access.length} workbook access records to ${outputPath}`);
