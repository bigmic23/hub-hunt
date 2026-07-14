const store = new Map();

function get(key) {
  return store.get(key);
}

function set(key, value) {
  store.set(key, value);
}

function del(key) {
  store.delete(key);
}

module.exports = { get, set, del };
