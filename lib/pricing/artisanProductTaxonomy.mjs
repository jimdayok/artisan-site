import { normalizeLookupKey, stripSdPrefix } from "./lookupData.mjs";

const renamedPriceLists = new Set(["A6", "G6", "P6"]);

function normalizedCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

function isArtisanDigitalBrand(value) {
  const brand = normalizeLookupKey(value);
  return brand === "ARTISAN" || brand === "SD" || brand === "SD*";
}

export function normalizeArtisanDisplayStyle(styleRaw, brandRaw, listCode) {
  const style = normalizeLookupKey(styleRaw);
  const useCurrentNames = renamedPriceLists.has(normalizedCode(listCode));

  if (!style) {
    return {
      displayName: String(styleRaw ?? "").trim(),
      matched: false,
      family: null,
    };
  }

  if (
    /^DS[A-Z0-9]*/.test(style) ||
    (useCurrentNames && style === "DIAMOND SERIES")
  ) {
    return {
      displayName: useCurrentNames ? "DS Stable" : "Diamond Series",
      matched: true,
      family: "DS*",
    };
  }
  if (
    /^PS[A-Z0-9]*/.test(style) ||
    (useCurrentNames && style === "PLATINUM SERIES")
  ) {
    return {
      displayName: useCurrentNames ? "PS Steady" : "Platinum Series",
      matched: true,
      family: "PS*",
    };
  }
  if (
    /^GS[A-Z0-9]*/.test(style) ||
    (useCurrentNames && style === "GOLD SERIES")
  ) {
    return {
      displayName: useCurrentNames ? "GS Balance" : "Gold Series",
      matched: true,
      family: "GS*",
    };
  }
  if (
    useCurrentNames &&
    isArtisanDigitalBrand(brandRaw) &&
    ["SD", "DIGITAL SV", "SD DIGITAL SV", "SD DIGITAL"].includes(style)
  ) {
    return {
      displayName: "SD Digital",
      matched: true,
      family: "SD*",
    };
  }
  if (style === "CFB") {
    return { displayName: "CFB", matched: true, family: "CFB" };
  }
  if (style === "SD CONCEPT") {
    return { displayName: "Concept", matched: true, family: "Concept" };
  }
  if (style === "SD REACH") {
    return { displayName: "Reach", matched: true, family: "Reach" };
  }
  if (style === "SD RADIUS") {
    return { displayName: "Radius", matched: true, family: "Radius" };
  }

  return {
    displayName: stripSdPrefix(String(styleRaw ?? "").trim()),
    matched: false,
    family: null,
  };
}

export function resolveArtisanDesignTypeRule(
  listCode,
  styleName,
  fallbackDesignType
) {
  const code = normalizedCode(listCode);
  const style = normalizeLookupKey(styleName);
  const isRenamedList = renamedPriceLists.has(code);
  const isESeriesList = /^E\d/.test(code);

  if (!isRenamedList && !isESeriesList) {
    return {
      designType: fallbackDesignType,
      sourceRule: "Default FIN mapping",
      changed: false,
    };
  }

  const renamedListRules = [
    {
      test: (value) =>
        value === "DIAMOND SERIES" ||
        value === "DS STABLE" ||
        value.startsWith("DS "),
      result: "Progressive",
      rule: "Artisan DS* => Progressive",
    },
    {
      test: (value) =>
        value === "PLATINUM SERIES" ||
        value === "PS STEADY" ||
        value.startsWith("PS "),
      result: "Progressive",
      rule: "Artisan PS* => Progressive",
    },
    {
      test: (value) =>
        value === "GOLD SERIES" ||
        value === "GS BALANCE" ||
        value.startsWith("GS "),
      result: "Progressive",
      rule: "Artisan GS* => Progressive",
    },
    {
      test: (value) => value === "SD DIGITAL",
      result: "Single Vision",
      rule: "Artisan SD* => Single Vision",
    },
  ];

  const eSeriesRules = [
    ...renamedListRules.slice(0, 3),
    {
      test: (value) => value === "CFB",
      result: "Progressive",
      rule: "CFB => Progressive",
    },
    {
      test: (value) => value === "SD CONCEPT",
      result: "Anti-Fatigue",
      rule: "SD Concept => Anti-Fatigue",
    },
    {
      test: (value) => value === "SD REACH",
      result: "Anti-Fatigue",
      rule: "SD Reach => Anti-Fatigue",
    },
    {
      test: (value) => value === "SD DIGITAL SV",
      result: "Enhanced Single Vision",
      rule: "SD Digital SV => Enhanced Single Vision",
    },
    {
      test: (value) => value === "CD BIFOCAL",
      result: "Multifocal",
      rule: "CD Bifocal => Multifocal",
    },
    {
      test: (value) => value === "STANDARD SV",
      result: "Single Vision",
      rule: "Standard SV => Single Vision",
    },
    {
      test: (value) => value === "ASPHERIC SV",
      result: "Single Vision",
      rule: "Aspheric SV => Single Vision",
    },
  ];

  const rules = isRenamedList ? renamedListRules : eSeriesRules;
  const matched = rules.find((entry) => entry.test(style));
  if (!matched) {
    return {
      designType: fallbackDesignType,
      sourceRule: "Default FIN mapping",
      changed: false,
    };
  }

  return {
    designType: matched.result,
    sourceRule: matched.rule,
    changed: matched.result !== fallbackDesignType,
  };
}
