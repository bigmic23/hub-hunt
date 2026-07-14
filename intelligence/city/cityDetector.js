function cityDetector(job) {
  const text = job.location_text || "";

  const cities = [
    "Lagos", "Berlin", "Munich", "London", "Paris",
    "Remote", "Hybrid"
  ];

  for (const city of cities) {
    if (text.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }

  return null;
}

module.exports = { cityDetector };
