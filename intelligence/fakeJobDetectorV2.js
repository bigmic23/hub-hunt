const fs = require("fs");
const path = require("path");

const MEMORY_FILE =
  path.join(
    process.cwd(),
    "data",
    "fraud-memory.json"
  );

function loadMemory() {
  try {
    return JSON.parse(
      fs.readFileSync(
        MEMORY_FILE,
        "utf8"
      )
    );
  } catch {
    return {
      trustedDomains: {},
      blockedDomains: {},
      blockedPatterns: {}
    };
  }
}

function saveMemory(memory) {
  try {
    fs.mkdirSync(
      path.dirname(MEMORY_FILE),
      { recursive: true }
    );

    fs.writeFileSync(
      MEMORY_FILE,
      JSON.stringify(memory, null, 2)
    );
  } catch {}
}

function extractDomain(text = "") {
  const email =
    text.match(
      /@([a-z0-9.-]+\.[a-z]{2,})/i
    );

  if (email)
    return email[1]
      .toLowerCase();

  const url =
    text.match(
      /https?:\/\/([^/\s]+)/i
    );

  return url
    ? url[1]
        .replace(/^www\./, "")
        .toLowerCase()
    : null;
}

function detectFalseJob(text = "") {
  const memory =
    loadMemory();

  const raw =
    String(text)
      .toLowerCase();

  let risk = 0;

  const reasons = [];

  /*
  CLASSIC SCAM SIGNALS
  */

  const patterns = [
    [/registration fee/i, 80],
    [/payment required/i, 90],
    [/investment/i, 95],
    [/earn daily/i, 70],
    [/unlimited income/i, 70],
    [/whatsapp only/i, 45],
    [/telegram only/i, 45],
    [/dm to apply/i, 40],
    [/pay before/i, 100],
    [/guaranteed salary/i, 50],
    [/no experience needed/i, 15],
    [/urgent hiring/i, 10]
  ];

  for (const [rx, weight] of patterns) {
    if (rx.test(raw)) {
      risk += weight;
      reasons.push(
        rx.toString()
      );
    }
  }

  /*
  DOMAIN MEMORY
  */

  const domain =
    extractDomain(text);

  if (
    domain &&
    memory.blockedDomains[
      domain
    ]
  ) {
    risk += 80;

    reasons.push(
      "blocked_domain"
    );
  }

  if (
    domain &&
    memory.trustedDomains[
      domain
    ]
  ) {
    risk -=
      memory.trustedDomains[
        domain
      ] * 5;
  }

  /*
  REPEATED SCAM TEXT
  */

  Object.entries(
    memory.blockedPatterns
  ).forEach(
    ([pattern, weight]) => {
      if (
        raw.includes(pattern)
      ) {
        risk += weight;
      }
    }
  );

  risk =
    Math.max(
      0,
      Math.min(risk, 100)
    );

  return {
    risk,

    isFalse:
      risk >= 75,

    level:
      risk >= 75
        ? "HIGH"
        : risk >= 40
        ? "MEDIUM"
        : "LOW",

    domain,

    reasons
  };
}

/*
SELF LEARNING
*/

function learnFraud(
  job,
  action
) {
  const memory =
    loadMemory();

  const raw =
    String(
      job?.raw || ""
    ).toLowerCase();

  const domain =
    extractDomain(
      raw
    );

  if (
    action === "APPLIED" ||
    action === "SAVED"
  ) {
    if (domain) {
      memory.trustedDomains[
        domain
      ] =
        (
          memory
            .trustedDomains[
            domain
          ] || 0
        ) + 1;
    }
  }

  if (
    action === "IGNORED"
  ) {
    if (domain) {
      memory.blockedDomains[
        domain
      ] =
        (
          memory
            .blockedDomains[
            domain
          ] || 0
        ) + 1;
    }

    const parts =
      raw
        .split(/\n/)
        .filter(
          x =>
            x.length >
            20
        )
        .slice(0, 3);

    parts.forEach(p => {
      memory.blockedPatterns[
        p
      ] =
        (
          memory
            .blockedPatterns[
            p
          ] || 0
        ) + 5;
    });
  }

  saveMemory(memory);
}

module.exports = {
  detectFalseJob,
  learnFraud
};
