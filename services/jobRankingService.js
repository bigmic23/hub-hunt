function rankJobs(jobs, profile = {}) {

    const skills = (profile.skills || [])
        .map(s => s.toLowerCase());


    return jobs
        .map(job => {

            let score = 0;

            const title = (job.title || "").toLowerCase();
            const company = (job.company || "").toLowerCase();

            const text = title + " " + company;


            skills.forEach(skill => {
                if (text.includes(skill)) {
                    score += 10;
                }
            });


            // Strong healthcare assistant matches
            if (title.includes("healthcare assistant")) score += 50;
            if (title.includes("care assistant")) score += 50;
            if (title.includes("nursing assistant")) score += 50;
            if (title.includes("pflege")) score += 50;


            // Healthcare related but not assistant
            if (title.includes("healthcare")) score += 15;
            if (title.includes("medical")) score += 15;


            // Support roles
            if (title.includes("customer support")) score += 20;
            if (title.includes("support specialist")) score += 15;


            // Penalize senior/expert roles
            if (title.includes("senior")) score -= 25;
            if (title.includes("consultant")) score -= 20;
            if (title.includes("manager")) score -= 20;


            return {
                ...job,
                score
            };

        })
        .sort((a,b)=> b.score - a.score);

}


module.exports = {
    rankJobs
};
