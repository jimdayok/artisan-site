import assert from "node:assert/strict";
import test from "node:test";
import {
  executiveDirectory,
  labDirectory,
  otherResourceDirectory,
} from "../lib/portal/contactDirectory.ts";

test("employee directory contacts have usable email addresses", () => {
  const contacts = [
    ...executiveDirectory,
    ...labDirectory.flatMap((lab) => [
      { email: lab.customerServiceEmail },
      ...lab.customerServiceTeam,
      ...lab.leadership,
    ]),
    ...otherResourceDirectory,
  ];

  assert.ok(contacts.length > 0);
  for (const contact of contacts) {
    assert.match(contact.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }
});

test("other resources include the requested contacts and direct PDF catalogues", () => {
  assert.deepEqual(
    otherResourceDirectory.map(({ name, contactName, email }) => ({ name, contactName, email })),
    [
      { name: "SafeVision by Hoya", contactName: "Gloria Greene", email: "Gloria.Greene@hoya.com" },
      { name: "Wiley-X", contactName: "Andy Rump", email: "arump@wileyx.com" },
      { name: "OnGuard by Hilco", contactName: "Shane Gillies", email: "Shane.Gillies@hilcovision.com" },
      { name: "ArmourRx", contactName: "Jim Burke", email: "jim.burke@armourxsafety.com" },
    ]
  );

  for (const resource of otherResourceDirectory) {
    assert.match(resource.catalogueUrl, /^https:\/\//);
    assert.ok(!resource.catalogueUrl.includes("utm_source=chatgpt.com"));
  }
});
