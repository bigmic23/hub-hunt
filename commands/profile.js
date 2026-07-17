const { buildPreferenceProfile } = require("../services/ai/learning/preferenceEngine");
const userProfileService = require("../services/userProfileService");

module.exports = async function profile(ctx) {

    const userId = String(ctx.from.id);

    const learned = await buildPreferenceProfile(userId);

    const user =
        await userProfileService.get(userId) || {};

    const weights = user.weights || {
        skillMatch: 1,
        roleMatch: 1,
        salaryMatch: 1
    };

    const topRoles = Object.entries(
        learned.preferredRoles || {}
    )
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10)
    .map(([k,v])=>`• ${k} (${v})`)
    .join("\n") || "None";

    const topCities = Object.entries(
        learned.preferredCities || {}
    )
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5)
    .map(([k,v])=>`• ${k} (${v})`)
    .join("\n") || "None";

    const modes = Object.entries(
        learned.preferredModes || {}
    )
    .map(([k,v])=>`• ${k} (${v})`)
    .join("\n") || "None";

    return ctx.reply(
`🧠 *Recruiter Brain*

*Top Skills*
${(learned.skills || []).join(", ") || "None"}

*Preferred Roles*
${topRoles}

*Preferred Locations*
${topCities}

*Preferred Modes*
${modes}

*Adaptive Weights*
• Skill: ${weights.skillMatch}
• Role: ${weights.roleMatch}
• Salary: ${weights.salaryMatch}`,
{
parse_mode:"Markdown"
});
};
