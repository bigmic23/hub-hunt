const supabase = require("../db/supabase");

async function getUser(userId) {
  const { data, error } = await supabase
    .from("user_memory")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error(error);
  }

  return data || {};
}

async function updateUser(userId, memory) {
  const { error } = await supabase
    .from("user_memory")
    .upsert({
      user_id: userId,
      memory
    });

  if (error) console.error(error);
}

module.exports = { getUser, updateUser };
