const axios = require("axios");

module.exports = async function fetchAdzunaJobs({ title, location } = {}) {
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  if (!APP_ID || !APP_KEY) {
    console.warn("Adzuna credentials missing.");
    return [];
  }

  const countries = (process.env.ADZUNA_COUNTRIES || "ng")
    .split(",")
    .map(c => c.trim().toLowerCase());

  const jobs = [];

  for (const country of countries) {
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;

      const { data } = await axios.get(url, {
        params: {
          app_id: APP_ID,
          app_key: APP_KEY,
          results_per_page: 20,
          what: title || "",
          where: location || ""
        },
        timeout: 15000
      });

      for (const job of data.results || []) {
        jobs.push({
          id: `adzuna-${country}-${job.id}`,
          title: job.title,
          company: job.company?.display_name || "Unknown",
          location: job.location?.display_name || "Unknown",
          country: country.toUpperCase(),
          mode: "Unknown",
          visaSponsored: false,
          salary:
            job.salary_min && job.salary_max
              ? `${job.salary_min} - ${job.salary_max}`
              : "Not specified",
          applyUrl: job.redirect_url,
          source: "Adzuna"
        });
      }
    } catch (err) {
      console.warn(
        `Adzuna (${country})`,
        err.response?.status,
        err.response?.data || err.message
      );
    }
  }

  return jobs;
};
