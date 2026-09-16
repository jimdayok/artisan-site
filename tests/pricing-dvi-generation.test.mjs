import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { gunzipSync } from "node:zlib";
import {
  DVI_REQUIRED_FILES,
  generateDviPricingArtifacts,
  mapWithConcurrency,
} from "../lib/pricing/parseDviRawPriceFiles.mjs";
import { PricingProgress } from "../lib/pricing/progress.mjs";
import {
  getXmlPriceFile,
  parseDownloadedXmlPriceFile,
} from "../lib/r2/getXmlPriceFile.mjs";
import {
  isDviAuthoritativePriceList,
  nonDviLensAddOnSections,
} from "../lib/pricing/sourceAuthority.mjs";
import {
  normalizeArtisanDisplayStyle,
  resolveArtisanDesignTypeRule,
} from "../lib/pricing/artisanProductTaxonomy.mjs";

const testConfig = {
  accountId: "test-account",
  accessKeyId: "test-key",
  secretAccessKey: "test-secret",
  bucketName: "test-bucket",
  xmlPricePrefix: "xml_price_data",
};

function silentProgress() {
  return new PricingProgress({
    prefix: "test",
    heartbeatMs: 10,
    log: () => {},
    errorLog: () => {},
  });
}

function fixtureXml(fileName) {
  const fixtures = {
    "price.xml":
      '<PricingReport><List Code="A5" Type="standard" Name="Known A5"/></PricingReport>',
    "styles.xml":
      '<Styles><Material PList="A5" Code="MAT"><Style Name="STYLE1" Fin="S" Sph="10.5"/></Material></Styles>',
    "coats.xml":
      '<CoatSchedules><Cot PList="A5" Name="C1"/></CoatSchedules>',
    "edging.xml":
      '<EdgingSchedules><Edg PList="A5" Name="E1"/></EdgingSchedules>',
    "add.xml": '<AddSchedules><Add PList="A5" Name="A1"/></AddSchedules>',
    "power.xml":
      '<PowerSchedules><Pow PList="A5" Name="P1"/></PowerSchedules>',
    "prism.xml":
      '<PrismSchedules><Prs PList="A5" Name="R1"/></PrismSchedules>',
    "tint.xml": '<TintSchedules><Tnt PList="A5" Name="T1"/></TintSchedules>',
    "oversize.xml":
      '<OversizeSchedules><Osz PList="A5" Name="O1"/></OversizeSchedules>',
    "hardening.xml":
      '<HardeningSchedules><Hrd PList="A5" Name="H1"/></HardeningSchedules>',
    "frame.xml":
      '<FrameSchedules><Frm PList="A5" Name="F1"/></FrameSchedules>',
  };
  return fixtures[fileName];
}

function fixtureDownload(fileName) {
  const xml = fixtureXml(fileName);
  return {
    fileName,
    key: `xml_price_data/${fileName}`,
    xml,
    bucketName: "test-bucket",
    prefix: "xml_price_data",
    source: `r2://test-bucket/xml_price_data/${fileName}`,
    fileSizeBytes: Buffer.byteLength(xml),
    modifiedAt: "2026-01-01T00:00:00.000Z",
    sha256: "fixture",
  };
}

test("R2 request timeout includes bucket, key, and duration", async () => {
  const client = { send: () => new Promise(() => {}) };
  await assert.rejects(
    getXmlPriceFile("price.xml", {
      client,
      config: testConfig,
      timeoutMs: 20,
    }),
    /bucket=test-bucket key=xml_price_data\/price\.xml after 20ms/
  );
});

test("bounded concurrency never exceeds the configured worker count", async () => {
  let active = 0;
  let observedMaximum = 0;
  const { results, maximumActive } = await mapWithConcurrency(
    Array.from({ length: 12 }, (_, index) => index),
    3,
    async (value) => {
      active += 1;
      observedMaximum = Math.max(observedMaximum, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return value * 2;
    }
  );

  assert.equal(maximumActive, 3);
  assert.equal(observedMaximum, 3);
  assert.deepEqual(results, Array.from({ length: 12 }, (_, index) => index * 2));
});

test("generates a known A5 price-list artifact", async () => {
  const artifacts = await generateDviPricingArtifacts({
    progress: silentProgress(),
    inspectionOptions: {
      concurrency: 2,
      downloadFile: async (fileName) => fixtureDownload(fileName),
      parseFile: parseDownloadedXmlPriceFile,
    },
  });

  assert.deepEqual(DVI_REQUIRED_FILES, Object.keys(Object.fromEntries(
    DVI_REQUIRED_FILES.map((fileName) => [fileName, true])
  )));
  assert.equal(artifacts.artifactsByCode.A5.code, "A5");
  assert.equal(artifacts.artifactsByCode.A5.listName, "Known A5");
  assert.equal(artifacts.artifactsByCode.A5.rows.length, 1);
  assert.equal(artifacts.artifactsByCode.A5.rows[0].basePrice, 10.5);
});

test("malformed XML fails with the object key", async () => {
  const client = {
    send: async () => ({
      Body: Buffer.from("<Styles><Material></Styles>", "utf8"),
      ContentLength: 27,
    }),
  };
  await assert.rejects(
    getXmlPriceFile("styles.xml", {
      client,
      config: testConfig,
      timeoutMs: 1_000,
    }),
    /Malformed XML in R2 object xml_price_data\/styles\.xml/
  );
});

test("missing R2 object fails with bucket and key", async () => {
  const client = {
    send: async () => {
      const error = new Error("missing");
      error.name = "NoSuchKey";
      error.$metadata = { httpStatusCode: 404 };
      throw error;
    },
  };
  await assert.rejects(
    getXmlPriceFile("missing.xml", {
      client,
      config: testConfig,
      timeoutMs: 1_000,
    }),
    /R2 object not found: test-bucket\/xml_price_data\/missing\.xml/
  );
});

test("customer price documents use matching DVI Style price-list rows as the authority", () => {
  for (const code of [
    "A6",
    "B5",
    "E5",
    "E6",
    "G6",
    "J1",
    "J2",
    "P6",
    "S5",
    "VD",
    "VX",
  ]) {
    assert.equal(isDviAuthoritativePriceList(code.toLowerCase()), true, code);
  }
  assert.equal(isDviAuthoritativePriceList("A5"), false);
});

test("legacy duplicated lens adjustments are not carried into DVI-authoritative lists", () => {
  assert.deepEqual(
    nonDviLensAddOnSections([
      { title: "Add for Material", items: [{ name: "Plastic", price: "-$8" }] },
      { title: "Blue Light Filter Options", items: [{ name: "Blue", price: "$8" }] },
      { title: "Photochromic Options", items: [{ name: "Photo", price: "$46" }] },
      { title: "Polarized Options", items: [{ name: "Polar", price: "$61" }] },
      { title: "Shipping", items: [{ name: "Ground", price: "$8" }] },
    ]),
    [{ title: "Shipping", items: [{ name: "Ground", price: "$8" }] }]
  );
});

test("A6, G6, and P6 use the current Artisan product names", () => {
  for (const code of ["A6", "G6", "P6"]) {
    assert.equal(
      normalizeArtisanDisplayStyle("DS15", "Artisan", code).displayName,
      "DS Stable"
    );
    assert.equal(
      normalizeArtisanDisplayStyle("PS17", "Artisan", code).displayName,
      "PS Steady"
    );
    assert.equal(
      normalizeArtisanDisplayStyle("GS19", "Artisan", code).displayName,
      "GS Balance"
    );
    assert.equal(
      normalizeArtisanDisplayStyle("Gold Series", "Artisan", code).displayName,
      "GS Balance"
    );
    assert.equal(
      normalizeArtisanDisplayStyle("SD*", "SD*", code).displayName,
      "SD Digital"
    );
    assert.equal(
      normalizeArtisanDisplayStyle("Digital SV", "Artisan", code).displayName,
      "SD Digital"
    );
  }
});

test("A6, G6, and P6 classify all renamed Artisan series correctly", () => {
  for (const code of ["A6", "G6", "P6"]) {
    for (const style of ["DS Stable", "PS Steady", "GS Balance"]) {
      assert.equal(
        resolveArtisanDesignTypeRule(code, style, "Single Vision").designType,
        "Progressive",
        `${code} ${style}`
      );
    }
    assert.equal(
      resolveArtisanDesignTypeRule(code, "SD Digital", "Enhanced SV").designType,
      "Single Vision",
      `${code} SD Digital`
    );
  }
});

test("packaged A6, G6, and P6 data contains only the current Artisan labels", () => {
  for (const code of ["A6", "G6", "P6"]) {
    const payload = JSON.parse(
      gunzipSync(
        readFileSync(`lib/pricing/generated/normalized/${code}.json.gz`)
      ).toString("utf8")
    );
    const legacyRows = payload.rows.filter(
      (row) =>
        row.brand === "SD*" ||
        [
          "Diamond Series",
          "Platinum Series",
          "Gold Series",
          "Digital SV",
          "SD*",
        ].includes(row.designStyle)
    );

    assert.equal(legacyRows.length, 0, `${code} legacy Artisan labels`);

    for (const style of ["DS Stable", "PS Steady", "GS Balance"]) {
      const rows = payload.rows.filter((row) => row.designStyle === style);
      assert.ok(rows.length > 0, `${code} ${style} is present`);
      assert.ok(
        rows.every(
          (row) => row.brand === "Artisan" && row.designType === "Progressive"
        ),
        `${code} ${style} is Progressive`
      );
    }

    const sdDigitalRows = payload.rows.filter(
      (row) => row.designStyle === "SD Digital"
    );
    assert.ok(sdDigitalRows.length > 0, `${code} SD Digital is present`);
    assert.ok(
      sdDigitalRows.every(
        (row) => row.brand === "Artisan" && row.designType === "Single Vision"
      ),
      `${code} SD Digital is consolidated under Artisan`
    );
  }
});
