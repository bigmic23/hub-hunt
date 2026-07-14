function detectMissingFields(data) {
  const missing = [];

  if (!data.company) missing.push("company");
  if (!data.role) missing.push("role");

  if (
    !data.location &&
    !String(data.role || "").toLowerCase().includes("remote")
  ) {
    missing.push("location");
  }

  if (!data.salary) missing.push("salary");

  return missing;
}

module.exports = { detectMissingFields };
