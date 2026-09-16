export const B5_PACKAGE_NOTE_ITEMS = Object.freeze([
  Object.freeze({
    name: "What's included",
    price:
      "Every package includes polycarbonate lenses and Artisan Emerald AR treatment.",
  }),
  Object.freeze({
    name: "How package pricing works",
    price:
      "Products shown in this package guide receive the package price automatically. Products not shown revert to your assigned base price list.",
  }),
  Object.freeze({
    name: "Missing a combination?",
    price:
      "With hundreds of thousands of possible product combinations, occasional omissions can occur, while some combinations are intentionally excluded. If you believe an eligible option is missing, email sales@artisanlabnetwork.com.",
  }),
]);

export const B5_PACKAGE_NOTE_LINES = Object.freeze(
  B5_PACKAGE_NOTE_ITEMS.map(
    (item) => `${item.name}${item.name.endsWith("?") ? "" : ":"} ${item.price}`
  )
);
