module.exports = function validateJob(data) {
  if (!data || typeof data !== "object") return {};

  return {
    company: data.company || null,
    role: data.role || null,
    location: data.location || null,
    salary: data.salary || null,
    contact: data.contact || null,
    notes: data.notes || null
  };
};
