const arbeitnow = require("./sources/arbeitnow");
const adzuna = require("./sources/adzuna");
const remotive = require("./sources/remotive");
const remoteok = require("./sources/remoteok");
const myjobmag = require("./sources/myjobmag");

async function fetchAllJobs() {

    const results = await Promise.allSettled([

        arbeitnow(),

        adzuna(),

        remotive(),

        remoteok(),

        myjobmag()

    ]);

    let jobs = [];

    for (const result of results) {

        if (
            result.status === "fulfilled" &&
            Array.isArray(result.value)
        ) {

            jobs.push(...result.value);

        }

    }

    const seen = new Set();

    return jobs.filter(job => {

        if (!job.id)
            return false;

        if (seen.has(job.id))
            return false;

        seen.add(job.id);

        return true;

    });

}

module.exports = {

    fetchAllJobs

};
