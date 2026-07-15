
function setCurrentJob(userId, job) {
    const state = getState(userId);
    state.currentJob = job || null;
    state.updatedAt = Date.now();
    feedState.set(userId, state);
}

function getCurrentJob(userId) {
    return getState(userId).currentJob || null;
}

