const { normalizeJob } = require("../../intelligence/jobNormalizer");
const userProfileService = require("../../services/userProfileService");

function scoreJobAgainstCV(job, profile) {
  if (!profile) return { score: 100, grade: "F", reason: "No CV saved" };

  const cvSkills = (profile.skills || profile.cvProfile?.skills || []).map(s => s.toLowerCase());
  const cvRoles = (profile.roles || profile.cvProfile?.roles || []).map(r => r.toLowerCase());
  const cvSalary = profile.salaryExpectation || profile.cvProfile?.salaryExpectation || 0;

  const jobTitle = (job.title || "").toLowerCase();
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  const jobSalary = Number(job.salary) || 0;
  const jobMode = (job.mode || "").toLowerCase();

  let score = 0;
  const reasons = [];

  // Role match (0-300)
  const roleMatch = cvRoles.some(r => jobTitle.includes(r));
  if (roleMatch) { score += 300; reasons.push("✅ Role match"); }

  // Skill match (0-300)
  const matchedSkills = cvSkills.filter(s =>
    jobTitle.includes(s) || jobSkills.some(js => js.includes(s))
  );
  const skillScore = Math.min(300, matchedSkills.length * 100);
  score += skillScore;
  if (matchedSkills.length) reasons.push(`✅ Skills: ${matchedSkills.join(", ")}`);

  // Salary match (0-200)
  if (cvSalary && jobSalary) {
    if (jobSalary >= cvSalary) { score += 200; reasons.push("✅ Salary meets expectation"); }
    else if (jobSalary >= cvSalary * 0.8) { score += 100; reasons.push("⚠️ Salary slightly below expectation"); }
    else { reasons.push("❌ Salary below expectation"); }
  }

  // Remote boost (0-100)
  if (jobMode.includes("remote")) { score += 100; reasons.push("✅ Remote"); }

  // Lagos boost (0-100)
  const jobCity = (job.city || "").toLowerCase();
  if (jobCity.includes("lagos")) { score += 50; }

  score = Math.min(1000, score);

  const grade =
    score >= 800 ? "A" :
    score >= 600 ? "B" :
    score >= 400 ? "C" :
    score >= 200 ? "D" : "F";

  return { score, grade, reasons };
}

async function runJobWorkflow({ text, userId }) {
  const job = normalizeJob(text);

  // Load all CVs for this user
  const profile = userId ? await userProfileService.get(userId) : null;

  // If user has multiple CVs, score against each
  let bestScore = null;
  let bestCvName = "Default";

  const cvList = profile?.cvList;

  if (cvList && Object.keys(cvList).length > 0) {
    for (const [name, cv] of Object.entries(cvList)) {
      const s = scoreJobAgainstCV(job, cv);
      if (!bestScore || s.score > bestScore.score) {
        bestScore = s;
        bestCvName = name;
      }
    }
  } else {
    bestScore = scoreJobAgainstCV(job, profile);
  }

  job.score = bestScore;
  job.matchedCv = bestCvName;

  return {
    type: "job",
    job,
    score: bestScore,
    matchedCv: bestCvName
  };
}

module.exports = { runJobWorkflow };

