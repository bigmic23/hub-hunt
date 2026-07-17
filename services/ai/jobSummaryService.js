function summarizeJob(job = {}) {
    const reasons = job.reasons || [];

    const strengths = [];
    const warnings = [];

    reasons.forEach(r => {
        if (
            r.includes("Remote") ||
            r.includes("Visa") ||
            r.includes("Matches skill") ||
            r.includes("High-demand") ||
            r.includes("Global")
        ) {
            strengths.push(r);
        }
    });

    if (!job.visaSponsored)
        warnings.push("Visa sponsorship not mentioned.");

    if (
        !job.salary ||
        job.salary === "Not specified"
    )
        warnings.push("Salary not listed.");

    return {
        summary:
`⭐ Match Score: ${Math.min(job.score || 0,100)}%

Why this matches:
${strengths.length ? strengths.map(r=>"• "+r).join("\n") : "• General match"}

Things to know:
${warnings.length ? warnings.map(w=>"⚠ "+w).join("\n") : "None"}

Source: ${job.source}`
    };
}

module.exports = {
    summarizeJob
};
