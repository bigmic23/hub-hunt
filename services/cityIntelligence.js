function inferCity(text, mode) {
  const lower = text.toLowerCase();

  // 1. direct match
  const cities = [
    "lagos",
    "abuja",
    "berlin",
    "london",
    "toronto",
    "dubai",
    "nairobi"
  ];

  for (const city of cities) {
    if (lower.includes(city)) {
      return { city, confidence: "high" };
    }
  }

  // 2. mode-based inference
  if (mode === "Remote") {
    return { city: "Global", confidence: "high" };
  }

  if (mode === "On-site") {
    return { city: "Needs Review", confidence: "low" };
  }

  return { city: "Unknown", confidence: "low" };
}

module.exports = { inferCity };
