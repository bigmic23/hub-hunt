function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function isDuplicate(existing = [], incoming = {}) {
  const title = normalize(incoming.title);

  const location = normalize(incoming.location);

  const salary =
    String(incoming.salary || "")
      .replace(/[^\d]/g, "");

  return existing.find(job => {
    const t = normalize(job.title);

    const l = normalize(job.location);

    const s =
      String(job.salary || "")
        .replace(/[^\d]/g, "");

    return (
      t === title &&
      l === location &&
      s === salary
    );
  });
}

module.exports = {
  isDuplicate
};
