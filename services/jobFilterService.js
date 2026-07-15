function filterJobs(jobs = []) {
    const blockedKeywords = [
        "intern",
        "praktik",
        "working student",
        "werkstudent",
        "student",
        "ausbildung",
        "trainee",
        "apprentice"
    ];

    return jobs.filter(job => {
        if (!job.title) return false;
        if (!job.company) return false;
        if (!job.applyUrl) return false;

        const title = job.title.toLowerCase();

        // Remove unwanted job types
        for (const word of blockedKeywords) {
            if (title.includes(word)) {
                return false;
            }
        }

        return true;
    });
}

module.exports = {
    filterJobs
};
