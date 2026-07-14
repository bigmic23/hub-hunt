function cleanLine(v = "") {
  return String(v)
    .replace(/[*_]/g, "")
    .replace(/[•]/g, "")
    .trim();
}

function extractSalary(text = "") {
  const t = String(text);

  const range =
    t.match(/(?:salary|incentives?)[:\s]*[#₦]?([\d,]+)\s*[-–]\s*[#₦]?([\d,]+)/i);

  if (range) {
    return Math.round(
      (
        Number(range[1].replace(/,/g, "")) +
        Number(range[2].replace(/,/g, ""))
      ) / 2
    );
  }

  const single =
    t.match(
      /(?:salary|incentives?)[:\s]*[#₦]?([\d,]+)/i
    );

  if (single) {
    return Number(
      single[1].replace(/,/g, "")
    );
  }

  return 0;
}

function extractLocation(text = "") {

  const explicit =
    text.match(
      /location[:\s*-]*([^\n]+)/i
    );

  if (explicit) {
    return cleanLine(explicit[1]);
  }

  if (/lagos/i.test(text))
    return "Lagos";

  if (/abuja/i.test(text))
    return "Abuja";

  if (/isolo/i.test(text))
    return "Isolo";

  return "Unknown";
}

function extractApply(text = "") {

  const email =
    text.match(
      /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
    );

  if (email)
    return email[0];

  const url =
    text.match(
      /https?:\/\/[^\s]+/i
    );

  if (url)
    return url[0];

  return null;
}

function extractMode(text = "") {

  if (/remote/i.test(text))
    return "Remote";

  if (/hybrid/i.test(text))
    return "Hybrid";

  return "Onsite";
}

function extractTitle(text = "") {

  const lines =
    String(text)
      .split("\n")
      .map(cleanLine)
      .filter(Boolean);

  const blocked = [
    /vacancy!?$/i,
    /^hiring:?$/i,
    /^apply/i,
    /^requirements/i,
    /^benefits/i,
    /^salary/i,
    /^location/i,
    /^send cv/i,
    /^[!@#$%^&*]+$/,
    /^job$/i
  ];

  const roleWords =
    /cleaner|developer|engineer|support|assistant|officer|manager|intern|representative|consultant|analyst|designer|corps/i;

  for (const line of lines) {

    if (
      blocked.some(
        rx => rx.test(line)
      )
    ) continue;

    if (
      roleWords.test(line)
    ) {
      return line
        .replace(/^hiring:\s*/i, "")
        .replace(/^vacancy[:! ]*/i, "")
        .trim();
    }
  }

  for (const line of lines) {

    if (
      blocked.some(
        rx => rx.test(line)
      )
    ) continue;

    if (
      line.length >= 8
    ) {
      return line;
    }
  }

  return "Unknown Job";
}

function parseJobs(text = "") {

  const clean =
    String(text);

  return [
    {
      title:
        extractTitle(clean),

      city:
        extractLocation(clean),

      salary:
        extractSalary(clean),

      contact:
        extractApply(clean),

      mode:
        extractMode(clean),

      raw:
        clean
    }
  ];
}

module.exports = {
  parseJobs
};
