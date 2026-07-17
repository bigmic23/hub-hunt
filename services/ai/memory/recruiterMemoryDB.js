const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function cleanTitle(title = "") {

    return title
        .replace(/\(.*?\)/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


async function recordAction(
    userId,
    job,
    action
) {

    if (!userId || !job?.id) return false;


    console.log("RECORD ACTION:", {
        userId,
        jobId: job.id,
        action
    });


    const payload = {

        user_id: userId,

        job_id: job.id,

        title: cleanTitle(job.title),

        action,

        score:
            typeof job.score === "number"
                ? job.score
                : 0,

        metadata: {

            salary: job.salary || null,

            mode: job.mode || null,

            city:
                job.city ||
                job.location ||
                null,

            country: job.country || null,

            source: job.source || null

        },

        created_at: Date.now()

    };


    const { error } = await supabase
        .from("recruiter_memory")
        .insert([payload]);


    console.log(
        "SUPABASE INSERT:",
        error ? error.message : "SUCCESS"
    );


    if (error) {

        console.error(
            "recordAction error:",
            error.message
        );

        return false;

    }


    return true;

}



async function getUserMemory(userId) {

    const { data, error } = await supabase
        .from("recruiter_memory")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
            ascending: false
        })
        .limit(100);


    if (error) {

        console.error(
            "getUserMemory error:",
            error.message
        );

        return [];

    }


    return data || [];

}



async function getUserStats(userId) {

    const memory = await getUserMemory(userId);


    return {

        saved: memory.filter(
            x => x.action === "SAVED"
        ).length,


        rejected: memory.filter(
            x => x.action === "REJECTED"
        ).length,


        applied: memory.filter(
            x => x.action === "APPLIED"
        ).length

    };

}


module.exports = {

    recordAction,

    getUserMemory,

    getUserStats

};
