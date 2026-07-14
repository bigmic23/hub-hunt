function normalizeSalary(text) {
  if (!text) return null;

  const cleaned = text
    .replace(/[^0-9]/g, "")
    .trim();

  const value = Number(cleaned);

  if (!value || value < 1000) return null;

  return value;
}

module.exports = { normalizeSalary };
