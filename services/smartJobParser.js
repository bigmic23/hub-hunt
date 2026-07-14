function parseJob(text) {
  const clean = text.trim();

  let title = clean;
  let location = null;
  let salary = null;

  // salary
  const salaryMatch = clean.match(/(\d{3,})/);
  if (salaryMatch) {
    salary = salaryMatch[1];
  }

  // location
  if (/remote/i.test(clean)) location = "Remote";
  if (/hybrid/i.test(clean)) location = "Hybrid";

  // remove known noise words from title
  title = clean
    .replace(/remote|hybrid/i, "")
    .replace(/\d{3,}/, "")
    .replace(/\bsalary\b/i, "")
    .trim();

  return {
    title,
    location,
    salary
  };
}

module.exports = { parseJob };
