const userCvProfile = {
  roles: ["customer support", "support", "admin", "assistant"],
  skills: ["communication", "chat", "email", "customer service"],
  preferredMode: "Remote",
  salaryExpectation: 200000
};

function buildCvProfile(memory = {}) {
  return {
    roles: memory.roles || userCvProfile.roles,
    skills: memory.skills || userCvProfile.skills,
    preferredMode: memory.preferredMode || userCvProfile.preferredMode,
    salaryExpectation: memory.salaryExpectation || userCvProfile.salaryExpectation
  };
}

module.exports = {
  userCvProfile,
  buildCvProfile
};
