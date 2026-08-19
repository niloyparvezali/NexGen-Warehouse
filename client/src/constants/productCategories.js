export const PRODUCT_CATEGORY_NAMES = [
  "Router",
  "Switch",
  "CCTV & Camera",
  "Fiber Optic",
  "OLT & ONU",
  "Network Cable",
  "Connectors & Accessories",
  "PoE & Power",
  "Accessories",
  "Tools",
];

export const buildProductCategoryOptions = (backendCategories = [], currentCategoryId = "", currentCategoryName = "") => {
  const orderedOptions = [];
  const seenIds = new Set();
  const seenNames = new Set();

  PRODUCT_CATEGORY_NAMES.forEach((name) => {
    const match = backendCategories.find((category) => category.name === name);

    if (match) {
      orderedOptions.push(match);
      seenIds.add(match.id);
      seenNames.add(match.name);
    }
  });

  const currentCategory = backendCategories.find((category) => {
    if (currentCategoryId && category.id === currentCategoryId) {
      return true;
    }

    return currentCategoryName && category.name === currentCategoryName;
  });

  if (currentCategory && !seenIds.has(currentCategory.id) && !seenNames.has(currentCategory.name)) {
    orderedOptions.push(currentCategory);
  }

  return orderedOptions;
};
