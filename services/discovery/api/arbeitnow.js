const axios = require("axios");

module.exports = {
  name: "Arbeitnow",

  async fetchJobs() {
    try {
      const { data } = await axios.get("https://www.arbeitnow.com/api/job-board-api");

      if (!data.data) return [];

      return data.data.map(job => ({
        id: job.slug,
        title: job.title,
        company: job.company_name,
        location: job.location || "Unknown",
        salary: job.salary || "Not specified",
        applyUrl: job.url,
        source: "Arbeitnow"
      }));

    } catch (err) {
      console.error("Arbeitnow error:", err.message);
      return [];
    }
  }
};
