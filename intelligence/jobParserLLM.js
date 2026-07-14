function parseJob(text) {
  const cleaned =
    text
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const lower =
    cleaned.toLowerCase();

  const salaryMatch =
    cleaned.match(
      /(\d[\d,]*)/
    );

  const salary =
    salaryMatch
      ? Number(
          salaryMatch[1]
            .replace(/,/g, "")
        )
      : null;

  let mode = "Unknown";

  if (lower.includes("remote"))
    mode = "Remote";

  if (lower.includes("hybrid"))
    mode = "Hybrid";

  if (
    lower.includes("on-site") ||
    lower.includes("onsite")
  ) {
    mode = "On-site";
  }

  const cityMatch =
    cleaned.match(
      /\b(Lagos|Berlin|London|Abuja|Munich|Toronto|Dubai|Paris|New York)\b/i
    );

  const city =
    cityMatch
      ? cityMatch[0]
      : "Global";

  let title =
    cleaned
      .replace(/salary.*$/i, "")
      .replace(/remote|hybrid|on-site|onsite/ig, "")
      .replace(/\b\d+\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

title =
title
.split(" at ")[0]
.split(" is hiring")[0]
.replace(
 /\b(remote|hybrid|on-site|onsite)\b/ig,
 ""
)
.replace(
 /\b(Lagos|Berlin|London|Abuja|Munich|Toronto|Dubai|Paris|New York)\b/ig,
 ""
)
.replace(
 /\b\d+\b/g,
 ""
)
.replace(
 /\s+/g,
 " "
)
.trim();

  return {
    title: title || "Unknown",
    mode,
    city,
    salary,
    company: null
  };
}

module.exports = {
  parseJob
};
