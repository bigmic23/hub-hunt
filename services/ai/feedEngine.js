const { matchJobToCV } = require("./cvMatcherEngine");
const { scoreJob } = require("../scoringEngine");
const { analyzeRisk } = require("../riskAnalyzer");

function rankJobs(jobs = []) {
  return jobs
    .map(job => {
      const score = job._baseScore?.score || 0;
      const cvScore = job._cv?.cvScore || 0;

      const finalScore = score + cvScore;

      return {
        job,
        score: finalScore,
        cvScore,
        reasons: job._cv?.reasons || []
      };
    })
    .sort((a, b) => b.score - a.score);
}

module.exports = { rankJobs };
