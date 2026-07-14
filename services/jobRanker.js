const fs = require("fs");
const path = require("path");

const MEMORY =
  path.join(
    process.cwd(),
    "data",
    "ranking-memory.json"
  );

function load() {
  try {
    return JSON.parse(
      fs.readFileSync(
        MEMORY,
        "utf8"
      )
    );
  } catch {
    return {
      acceptedRoles: {},
      rejectedRoles: {},
      acceptedModes: {},
      rejectedModes: {},
      acceptedCities: {},
      rejectedCities: {}
    };
  }
}

function save(data) {
  fs.mkdirSync(
    path.dirname(MEMORY),
    { recursive: true }
  );

  fs.writeFileSync(
    MEMORY,
    JSON.stringify(
      data,
      null,
      2
    )
  );
}

function normalize(v = "") {
  return String(v)
    .toLowerCase()
    .trim();
}

function roleKey(title = "") {
  const m =
    normalize(title).match(
      /(support|customer support|admin|assistant|officer|developer|intern|manager|analyst|storekeeper|representative|engineer|designer)/i
    );

  return m
    ? m[1]
    : normalize(title)
        .split(" ")
        .slice(0, 2)
        .join(" ");
}

function scoreMemory(job) {
  const db = load();

  const role =
    roleKey(job.title);

  const mode =
    normalize(job.mode);

  const city =
    normalize(job.city);

  let score = 0;

  score +=
    (
      db.acceptedRoles[
        role
      ] || 0
    ) * 18;

  score -=
    (
      db.rejectedRoles[
        role
      ] || 0
    ) * 12;

  score +=
    (
      db.acceptedModes[
        mode
      ] || 0
    ) * 6;

  score -=
    (
      db.rejectedModes[
        mode
      ] || 0
    ) * 4;

  score +=
    (
      db.acceptedCities[
        city
      ] || 0
    ) * 5;

  score -=
    (
      db.rejectedCities[
        city
      ] || 0
    ) * 3;

  return score;
}

function rankSingle(job) {
  const cvScore = Math.min(1000, Number(job?.score?.score || 0));
  const score = cvScore;
  return {
    ...job,
    score: {
      ...job.score,
      score,
      finalScore: score
    }
  };
}

function rankJobs(jobs = []) {
  return jobs
    .map(rankSingle)
    .sort(
      (
        a,
        b
      ) =>
        (
          b.score.finalScore -
          a.score.finalScore
        )
    );
}

function learnRanking(
  job,
  action
) {
  if (!job)
    return;

  const db = load();

  const role =
    roleKey(
      job.title
    );

  const mode =
    normalize(
      job.mode
    );

  const city =
    normalize(
      job.city
    );

  const positive =
    action ===
      "SAVED" ||
    action ===
      "APPLIED";

  if (positive) {
    db.acceptedRoles[
      role
    ] =
      (
        db
          .acceptedRoles[
          role
        ] || 0
      ) + 1;

    db.acceptedModes[
      mode
    ] =
      (
        db
          .acceptedModes[
          mode
        ] || 0
      ) + 1;

    db.acceptedCities[
      city
    ] =
      (
        db
          .acceptedCities[
          city
        ] || 0
      ) + 1;
  }

  if (
    action ===
    "IGNORED"
  ) {
    db.rejectedRoles[
      role
    ] =
      (
        db
          .rejectedRoles[
          role
        ] || 0
      ) + 1;

    db.rejectedModes[
      mode
    ] =
      (
        db
          .rejectedModes[
          mode
        ] || 0
      ) + 1;

    db.rejectedCities[
      city
    ] =
      (
        db
          .rejectedCities[
          city
        ] || 0
      ) + 1;
  }

  save(db);
}

module.exports = {
  rankJobs,
  learnRanking
};
