/**
 * MEMORY ENGINE (CLEAN VERSION)
 * ONLY handles session/state memory
 * NO JOB STORAGE INSIDE HERE
 */

const memory = {};

/**
 * GET USER MEMORY
 */
function getMemory(userId) {
  if (!memory[userId]) {
    memory[userId] = {};
  }
  return memory[userId];
}

/**
 * UPDATE USER MEMORY
 */
function updateMemory(userId, data = {}) {
  if (!memory[userId]) {
    memory[userId] = {};
  }

  memory[userId] = {
    ...memory[userId],
    ...data
  };

  return memory[userId];
}

/**
 * CLEAR MEMORY
 */
function clearMemory(userId) {
  delete memory[userId];
}

/**
 * EXPORT
 */
module.exports = {
  getMemory,
  updateMemory,
  clearMemory
};
