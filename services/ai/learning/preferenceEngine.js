const { getUserMemory } = require("../memory/recruiterMemoryDB");

const STOP_WORDS = new Set([
  "remote","hybrid","onsite","full","stack",
  "senior","junior","lead","manager","director",
  "assistant","associate","specialist",
  "role","job","position","career",
  "the","and","with","for"
]);

const ROLE_WORDS = [
  "software","developer","engineer","backend","frontend","fullstack",
  "node","javascript","typescript","react","python","java","php",
  "go","rust","sql","aws","docker","kubernetes","devops",
  "ai","machine","learning","data","analyst",
  "product","sales","marketing","finance",
  "customer","support","success",
  "health","medical","nurse","doctor","technician",
  "scheduler","outpatient","records",
  "operations","security","cybersecurity",
  "design","ui","ux","qa","testing","pet"
];

function extractWords(text=""){
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\- ]/g," ")
    .split(/\s+/)
    .filter(Boolean);
}

async function buildPreferenceProfile(userId){

  const memory = await getUserMemory(userId);

  const profile = {
    userId,
    skills:[],
    preferredRoles:{},
    preferredCities:{},
    preferredModes:{}
  };

  for(const row of memory){

    let weight = 0;

    if(row.action==="APPLIED") weight = 6;
    else if(row.action==="SAVED") weight = 3;
    else if(row.action==="REJECTED") weight = -1;

    const words = extractWords(row.title || "");

    for(const word of words){

      if(STOP_WORDS.has(word)) continue;
      if(!ROLE_WORDS.includes(word)) continue;

      profile.preferredRoles[word] =
        (profile.preferredRoles[word] || 0) + weight;
    }

    const city = row.metadata?.city;
    if(city){
      profile.preferredCities[city.toLowerCase()] =
        (profile.preferredCities[city.toLowerCase()] || 0) + weight;
    }

    const mode = row.metadata?.mode;
    if(mode){
      profile.preferredModes[mode.toLowerCase()] =
        (profile.preferredModes[mode.toLowerCase()] || 0) + weight;
    }
  }

for (const key of Object.keys(profile.preferredRoles)) {
  if (profile.preferredRoles[key] < 0) {
    profile.preferredRoles[key] = 0;
  }
}

  profile.skills = Object.entries(profile.preferredRoles)
    .filter(([,v]) => v > 0)
    .sort((a,b)=>b[1]-a[1])
    .map(([k])=>k);

  return profile;
}

module.exports = { buildPreferenceProfile };
