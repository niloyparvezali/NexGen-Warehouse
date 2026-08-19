export function generateSku(productName) {
  const prefix = productName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);

  const random = Math.floor(100000 + Math.random() * 900000);

  return `${prefix}-${random}`;
}
