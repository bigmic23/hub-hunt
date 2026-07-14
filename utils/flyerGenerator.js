const fs = require("fs");

function generateJobFlyer(job) {
  const filePath = `${__dirname}/../data/job_${Date.now()}.txt`;

  console.log("FLYER PATH:", filePath);

  const content =
`
JOB FLYER (V3 SIMPLE MODE)

Title: ${job.title}
City: ${job.city}
Mode: ${job.mode}
Salary: ${job.salary}
`;

  fs.writeFileSync(filePath, content);

  return filePath;
}

module.exports = {
generateJobFlyer
};
