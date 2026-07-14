const { normalizeJob } = require("../../intelligence/jobNormalizer");
const userProfileService = require("../../services/userProfileService");

async function runJobWorkflow({ text, userId }) {
  const job = normalizeJob(text);

  // Fix salary — handle ₦ symbol and commas
  if (!job.salary || job.salary === 0) {
    const salaryMatch = text.match(/[₦#]?\s*([\d,]+)/);
    if (salaryMatch) {
      job.salary = Number(salaryMatch[1].replace(/,/g, ""));
    }
  }

  let bestScore = null;
  let bestCvName = "Default";

  if (userId) {
    const profile = await userProfileService.get(userId);
    const cvList = profile?.cvList;

    if (cvList && Object.keys(cvList).length > 0) {
      for (const [name, cv] of Object.entries(cvList)) {
        const s = scoreJob(job, cv);
        if (!bestScore || s.score > bestScore.score) {
          bestScore = s;
          bestCvName = name;
        }
      }
    }
  }

  if (!bestScore) bestScore = { score: 100, grade: "F", reasons: [] };

  job.score = bestScore;
  job.matchedCv = bestCvName;

  return { type: "job", job, score: bestScore, matchedCv: bestCvName };
}

function scoreJob(job, cv) {
  const cvSkills = (cv.skills || []).map(s => s.toLowerCase());
  const cvRoles = (cv.roles || []).map(r => r.toLowerCase());
  const cvSalary = cv.salaryExpectation || 0;

  const jobTitle = (job.title || "").toLowerCase();
  const jobText = (job.raw || "").toLowerCase();
  const jobSalary = Number(job.salary) || 0;
  const jobMode = (job.mode || "").toLowerCase();
  const jobCity = (job.city || "").toLowerCase();

  let score = 0;
  const reasons = [];

  // Role match (300)
  const roleMatch = cvRoles.some(r => jobTitle.includes(r) || jobText.includes(r));
  if (roleMatch) { score += 300; reasons.push("✅ Role match"); }

  // Skill match (up to 300)
  const matched = cvSkills.filter(s => jobTitle.includes(s) || jobText.includes(s));
  const skillScore = Math.min(300, matched.length * 60);
  score += skillScore;
  if (matched.length) reasons.push(`✅ Skills matched: ${matched.slice(0, 4).join(", ")}`);

  // Salary match (200)
  if (cvSalary && jobSalary) {
    if (jobSalary >= cvSalary) { score += 200; reasons.push("✅ Salary meets expectation"); }
    else if (jobSalary >= cvSalary * 0.7) { score += 100; reasons.push(`⚠️ Salary slightly below (₦${jobSalary.toLocaleString()})`); }
    else { reasons.push(`❌ Salary too low (₦${jobSalary.toLocaleString()})`); }
  }

  // Remote (100)
  if (jobMode.includes("remote") || jobText.includes("remote")) {
    score += 100; reasons.push("✅ Remote");
  }

  // Lagos boost (50)
  if (jobCity.includes("lagos") || jobText.includes("lagos") || jobText.includes("lekki") || jobText.includes("ikeja") || jobText.includes("vi ") || jobText.includes("victoria island")) {
    score += 50; reasons.push("✅ Lagos location");
  }

  score = Math.min(1000, score);

  const grade =
    score >= 800 ? "A" :
    score >= 600 ? "B" :
    score >= 400 ? "C" :
    score >= 200 ? "D" : "F";

  return { score, grade, reasons };
}

module.exports = { runJobWorkflow };
