const { orchestrator } = require("../engine/orchestrator");

async function handleWhatsAppMessage(from, text) {
    const ctx = {
        message: {
            text
        },
        from: {
            id: from
        }
    };

    const result = await orchestrator(ctx);

    if (!result) {
        return "I couldn't understand that. Try telling me the job you are looking for.";
    }

    if (result.job) {
        return `
📌 Job Found

Title: ${result.job.title || "N/A"}
Location: ${result.job.location || "N/A"}

Score: ${result.scored.score || "N/A"}
        `;
    }

    return "I'm processing your request.";
}

module.exports = {
    handleWhatsAppMessage,
};
