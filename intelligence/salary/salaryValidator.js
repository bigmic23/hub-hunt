function salaryValidator(rawSalary) {
  if (!rawSalary) return { valid: false, salary: null };

  const cleaned = String(rawSalary)
    .replace(/[^0-9]/g, "")
    .trim();

  return {
    valid: cleaned.length > 0,
    salary: cleaned ? Number(cleaned) : null
  };
}

module.exports = { salaryValidator };
