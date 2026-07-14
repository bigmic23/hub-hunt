function clean(line = "") {
  return String(line)
    .replace(/\u00a0/g, " ")
    .trim();
}

const ROLE_REGEX =
  /^(manager|assistant|support|customer|officer|writer|developer|engineer|analyst|sales|admin|representative|specialist|intern)\b/i;

function isRole(line = "") {
  return ROLE_REGEX.test(line);
}

function segmentJobs(text = "") {
  text = String(text);

  const lines = text
    .split("\n")
    .map(clean)
    .filter(Boolean);

  const jobs = [];

  const shared = [];

  let collecting = false;

  for (const line of lines) {

    const bullet =
      line.match(
        /^\d+[\.\)]\s*(.+)$/i
      );

    if (
      /currently hiring|vacanc|open roles|positions/i
      .test(line)
    ) {
      collecting = true;
      continue;
    }

    if (bullet) {
      collecting = true;

      const role =
        bullet[1]
          .trim();

      jobs.push(role);

      continue;
    }

    if (
      collecting &&
      line.length < 80 &&
      isRole(line)
    ) {
      jobs.push(line);
      continue;
    }

    shared.push(line);
  }

  if (!jobs.length) {
    return [text];
  }

  const sharedText =
    shared.join("\n");

  return jobs.map(
    title =>
`${title}

${sharedText}`
  );
}

module.exports = {
  segmentJobs
};
