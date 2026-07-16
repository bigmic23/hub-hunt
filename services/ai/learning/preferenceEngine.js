const { getUserMemory } = require("../memory/recruiterMemoryDB");

async function buildPreferenceProfile(userId) {

    const memory = await getUserMemory(userId);

    const profile = {
        skills: [],
        preferredRoles: {},
        preferredCities: {},
        preferredModes: {}
    };

    for (const row of memory) {

        const title = (row.title || "").toLowerCase();

        const city = (row.metadata?.city || "").toLowerCase();

        const mode = (row.metadata?.mode || "").toLowerCase();

        const weight =
            row.action === "APPLIED" ? 3 :
            row.action === "SAVED" ? 2 :
            row.action === "REJECTED" ? -2 : 0;

        const words = title
            .split(/\s+/)
            .filter(w => w.length > 3);

        for (const word of words) {

            profile.preferredRoles[word] =
                (profile.preferredRoles[word] || 0) + weight;

        }

        if (city) {

            profile.preferredCities[city] =
                (profile.preferredCities[city] || 0) + weight;

        }

        if (mode) {

            profile.preferredModes[mode] =
                (profile.preferredModes[mode] || 0) + weight;

        }
    }

    profile.skills = Object.keys(profile.preferredRoles)
        .filter(k => profile.preferredRoles[k] > 0);

    return profile;
}

module.exports = {
    buildPreferenceProfile
};
