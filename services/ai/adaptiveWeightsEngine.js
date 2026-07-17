function getUserWeights(profile = {}) {
    const weights = profile.weights || {};

    return {
        skillMatch: weights.skillMatch ?? 1,
        roleMatch: weights.roleMatch ?? 1,
        salaryMatch: weights.salaryMatch ?? 1
    };
}

function applyWeights(components = {}, weights = {}) {
    return (
        (components.skillMatch || 0) * (weights.skillMatch || 1) +
        (components.roleMatch || 0) * (weights.roleMatch || 1) +
        (components.salaryMatch || 0) * (weights.salaryMatch || 1) +
        (components.behavior || 0)
    );
}

function adjustWeights(profile = {}, event = {}) {
    const cv = profile.cvProfile || {};
    const safeWeights = getUserWeights(profile);
    const job = event.job || {};

    if (event.action === "SAVED" || event.action === "APPLIED") {
        safeWeights.skillMatch += 0.05;
        safeWeights.roleMatch += 0.08;

        if (cv.salaryExpectation && job.salary >= cv.salaryExpectation) {
            safeWeights.salaryMatch += 0.1;
        }
    }

    if (event.action === "REJECTED") {
        safeWeights.skillMatch -= 0.1;
        safeWeights.roleMatch -= 0.1;
    }

    safeWeights.skillMatch = clamp(safeWeights.skillMatch);
    safeWeights.roleMatch = clamp(safeWeights.roleMatch);
    safeWeights.salaryMatch = clamp(safeWeights.salaryMatch);

    return safeWeights;
}

function clamp(v) {
    if (!v || isNaN(v)) return 1;
    return Math.max(0.5, Math.min(2, v));
}

module.exports = {
    getUserWeights,
    applyWeights,
    adjustWeights
};
