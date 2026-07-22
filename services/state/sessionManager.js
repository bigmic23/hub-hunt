const sessions = new Map();

module.exports = {
  get(id) {
    return sessions.get(id) || {};
  },

  set(id, data) {
    sessions.set(id, {
      ...this.get(id),
      ...data,
    });
  },

  clear(id) {
    sessions.delete(id);
  }
};
