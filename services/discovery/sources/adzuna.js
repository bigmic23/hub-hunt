const axios = require("axios");

const CITY_COUNTRY_MAP = {
  berlin: "de", munich: "de", hamburg: "de", frankfurt: "de", cologne: "de",
  london: "gb", manchester: "gb", birmingham: "gb", edinburgh: "gb", glasgow: "gb",
  toronto: "ca", vancouver: "ca", montreal: "ca", calgary: "ca", ottawa: "ca",
  sydney: "au", melbourne: "au", brisbane: "au", perth: "au",
  johannesburg: "za", "cape town": "za", pretoria: "za", durban: "za",
  "new york": "us", "los angeles": "us", chicago: "us", houston: "us", boston: "us",
  vienna: "at", salzburg: "at",
  brussels: "be", antwerp: "be",
  "sao paulo": "br", "rio de janeiro": "br",
  zurich: "ch", geneva: "ch",
  madrid: "es", barcelona: "es", valencia: "es",
  paris: "fr", lyon: "fr", marseille: "fr",
  mumbai: "in", delhi: "in", bangalore: "in", bengaluru: "in",
  milan: "it", rome: "it", turin: "it",
  "mexico city": "mx", guadalajara: "mx",
  amsterdam: "nl", rotterdam: "nl",
  auckland: "nz", wellington: "nz",
  warsaw: "pl", krakow: "pl",
  singapore: "sg"
};

function resolveCountries(location, configuredCountries) {
  const cityKey = (location || "").trim().toLowerCase();
  const matchedCountry = CITY_COUNTRY_MAP[cityKey];
  return matchedCountry ? [matchedCountry] : configuredCountries;
}

module.exports = async function fetchAdzunaJobs({ title, location } = {}) {
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  if (!APP_ID || !APP_KEY) {
    console.warn("Adzuna credentials missing.");
    return [];
  }

  const configuredCountries = (process.env.ADZUNA_COUNTRIES || "gb")
    .split(",")
    .map(c => c.trim().toLowerCase())
    .filter(Boolean);

  const countries = resolveCountries(location, configuredCountries);

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
