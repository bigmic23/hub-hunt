const session = require("../state/sessionManager");
const { searchJobs } = require("../jobs/searchJobs");

async function handleText(phone, text) {
  const state = session.get(phone);

  if (!state.step) {
    const jobs = await searchJobs(text, phone);

    if (!jobs.length) {
      return {
        type: "text",
        text: {
          body: "❌ No jobs found.\n\nTry another search."
        }
      };
    }

    session.set(phone, {
      step: "RESULTS",
      query: text,
      jobs,
      index: 0
    });

    return showJob(jobs[0]);
  }

  if (state.step === "RESULTS") {
    const cmd = text.trim().toUpperCase();

    if (cmd === "NEXT") {
      const index = (state.index + 1) % state.jobs.length;
      session.set(phone, { index });

      return showJob(state.jobs[index]);
    }
  }

  return {
    type: "text",
    text: {
      body: "Send a job search like:\nNurse jobs in Berlin"
    }
  };
}

function showJob(job) {
  return {
    type: "text",
    text: {
      body:
`📌 ${job.title}
🏢 ${job.company}
📍 ${job.location}

Reply NEXT for another job.`
    }
  };
}

module.exports = { handleText };
