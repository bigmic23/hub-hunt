function generateApplication(job = {}, profile = {}) {
  const name = profile?.name || "[Your Name]";
  const email = profile?.email || "[your.email@example.com]";
  const phone = profile?.phone || "[Your Phone Number]";

  const cvList = profile?.cvList || {};
  const matchedCvName = job?.matchedCv || "main";
  const cv = cvList[matchedCvName] || cvList["main"] || {};

  const skills = (cv.skills || []).slice(0, 5).join(", ");
  const roles = (cv.roles || []).slice(0, 2).join(" and ");

  const jobTitle = job?.title || "this role";
  const company = job?.company || "your organisation";
  const applyEmail = job?.applyLink || "";

  const isHealthcare = matchedCvName === "healthcare" ||
    /health|care|nurse|patient|medical/i.test(jobTitle);

  const summary = isHealthcare
    ? `a Healthcare Assistant with a Level 3 Diploma in Health and Social Care, certified in Basic Life Support, CPR, First Aid, and Mental Health Awareness`
    : `a Customer Experience and Client Support Professional with over 5 years of experience in customer service, CRM management, complaint resolution, and administrative support`;

  const subject = `Application for ${jobTitle} – ${name}`;

  const body =
`Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle} position at ${company}.

I am ${summary}. My background includes hands-on experience in ${roles || "customer service and administrative support"}, with strong skills in ${skills || "communication, CRM, and documentation"}.

Throughout my career I have demonstrated the ability to manage high-volume interactions, resolve escalations professionally, maintain accurate records, and deliver consistent service quality across multiple communication channels.

I am confident that my experience and dedication make me a strong fit for this role, and I would welcome the opportunity to contribute to your team.

Please find my CV attached. I am available for an interview at your earliest convenience.

Kind regards,
${name}
📞 ${phone}
📧 ${email}`;

  return { subject, body, applyEmail };
}

module.exports = { generateApplication };
