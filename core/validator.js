function sanitize(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\s+/g, " ");
}

function validateJob(data) {
  if (!data || typeof data !== "object") return {};

  return {
  company: cleanCompany(sanitize(data.company)),
  role: cleanText(sanitize(data.role)),
  location: cleanText(sanitize(data.location)),
  salary: cleanSalary(sanitize(data.salary)),
  contact: cleanText(sanitize(data.contact)),
  notes: cleanText(sanitize(data.notes))
};

}

function cleanCompany(value) {
  if (!value) return null;

  const blocked = ["test", "asdf", "unknown", "n/a"];

  if (blocked.includes(value.toLowerCase())) {
    return null;
  }

  return value;
}

function cleanText(value) {
  if (!value) return null;
  return value;
}

function cleanSalary(value) {
  if (!value) return null;

  return value.replace(/[^\d\-–kK₦$€£]/g, "");
}

function autoRepairJob(data) {
  const repaired = { ...data };

  // FIX: missing role guess from text patterns
  if (!repaired.role && repaired.notes) {
    const match = repaired.notes.match(/(developer|engineer|designer|manager|assistant)/i);
    if (match) {
      repaired.role = match[0];
    }
  }

  // FIX: infer company from email domain
  if (!repaired.company && repaired.contact) {
    const match = repaired.contact.match(/@([a-zA-Z0-9.-]+)/);
    if (match) {
      repaired.company = match[1].split(".")[0];
    }
  }

  // FIX: normalize salary
  if (repaired.salary) {
    repaired.salary = repaired.salary
      .replace(/\s+/g, "")
      .replace(/permonth|monthly/gi, " /month");
  }

  return repaired;
}

module.exports = {
  validateJob,
  cleanCompany,
  cleanText,
  cleanSalary,
  autoRepairJob
};
