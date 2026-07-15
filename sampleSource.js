async function fetchJobs() {
    return [
        {
            id: "sample-001",
            title: "Healthcare Assistant",
            company: "ABC Care GmbH",
            location: "Berlin, Germany",
            salary: "€2,700/month",
            applyUrl: "https://example.com/job-001",
            source: "Sample Source"
        }
    ];
}

module.exports = { fetchJobs };
