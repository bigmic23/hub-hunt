const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");

module.exports = async function fetchMyJobMagJobs() {
  try {
    const { data: xml } = await axios.get(
      "https://www.myjobmag.com/aggregate_feed.xml",
      {
        timeout: 30000,
        headers: {
          "User-Agent": "HubHunt/1.0"
        }
      }
    );

    const parser = new XMLParser({
      ignoreAttributes: false
    });

    const feed = parser.parse(xml);

    const items = feed?.rss?.channel?.item || [];

    return items.map((job, index) => ({
      id: `myjobmag-${index}`,
      title: job.title || "Untitled",
      company: "Unknown",
      location: "Nigeria",
      country: "Nigeria",
      mode: "Unknown",
      visaSponsored: false,
      salary: "Not specified",
      applyUrl: job.link,
      source: "MyJobMag"
    }));

  } catch (err) {
    console.warn(
      "MyJobMag:",
      err.response?.status || err.message
    );
    return [];
  }
};
