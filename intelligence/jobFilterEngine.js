function filterAndRankJobs(jobs, scoreFn) {

return jobs
.map(job => {

const score =
scoreFn(job);

return {
...job,
score
};

})
.filter(j => j.score >= 600)
.sort((a, b) =>
b.score - a.score
)
.slice(0, 5); // TOP 5 ONLY

}

module.exports = {
filterAndRankJobs
};
