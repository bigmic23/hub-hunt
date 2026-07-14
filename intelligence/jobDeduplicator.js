function removeDuplicates(jobs = []) {

const seen = new Set();

return jobs.filter((job) => {

const key = [
job.title,
job.city,
job.mode,
job.salary
]
.join("|")
.toLowerCase();

if (seen.has(key)) {
return false;
}

seen.add(key);

return true;

});

}

module.exports = {
removeDuplicates
};
