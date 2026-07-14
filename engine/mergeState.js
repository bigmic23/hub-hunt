function mergeState(stateData, aiData) {
  return {
    company: aiData.company ?? stateData?.company ?? null,
    role: aiData.role ?? stateData?.role ?? null,
    location: aiData.location ?? stateData?.location ?? null,
    salary: aiData.salary ?? stateData?.salary ?? null,
    contact: aiData.contact ?? stateData?.contact ?? null,
    notes: aiData.notes ?? stateData?.notes ?? null
  };
}

module.exports = { mergeState };
