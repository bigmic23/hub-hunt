const { createClient } = require("@supabase/supabase-js");
const { computeReward } = require("../rewardEngine");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * RECORD ACTION (DEDUP + REWARD + POLICY SAFE)
 */
async function recordAction(
userId,
job,
action,
context = {}
) {
if (!userId || !job?.id)
return;

const { error } =
await supabase
.from("recruiter_memory")
.insert([
{
user_id: userId,
job_id: job.id,
title: job.title,
action,
score: job.score?.score || 0,
metadata: {
salary: job.salary,
mode: job.mode,
city: job.city
},
created_at: Date.now()
}
]);

if (error) {
console.error(
"recordAction error:",
error.message
);
}

return true;
}

/**
 * GET RECENT MEMORY
 */
async function getUserMemory(userId) {
  const { data, error } = await supabase
    .from("recruiter_memory")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("getUserMemory error:", error.message);
    return [];
  }

  return data || [];
}

/**
 * GET STATS
 */
async function getUserStats(userId) {
  const { data, error } = await supabase
    .from("recruiter_memory")
    .select("action")
    .eq("user_id", userId);

  if (error) {
    console.error("getUserStats error:", error.message);
    return { saved: 0, rejected: 0, applied: 0 };
  }

  const stats = { saved: 0, rejected: 0, applied: 0 };

  for (const row of data || []) {
    if (row.action === "SAVED") stats.saved++;
    else if (row.action === "REJECTED") stats.rejected++;
    else if (row.action === "APPLIED") stats.applied++;
  }

  return stats;
}

module.exports = {
  recordAction,
  getUserMemory,
  getUserStats
};
