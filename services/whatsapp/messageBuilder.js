function buildHomeMessage(name = "there") {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text:
`👋 Hi ${name}

I'm Hub Hunt AI Recruiter.

What would you like to do?`
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "browse_jobs",
              title: "📋 Browse Jobs"
            }
          },
          {
            type: "reply",
            reply: {
              id: "recommended",
              title: "🎯 Best Matches"
            }
          },
          {
            type: "reply",
            reply: {
              id: "saved_jobs",
              title: "❤️ Saved"
            }
          }
        ]
      }
    }
  };
}

function buildJobMessage(job) {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text:
`💼 ${job.title}

🏢 ${job.company}

📊 Match: ${job.score?.score || 0}/1000 (${job.score?.grade || "D"})`
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: `save_${job.id}`,
              title: "❤️ Save"
            }
          },
          {
            type: "reply",
            reply: {
              id: `apply_${job.id}`,
              title: "🚀 Apply"
            }
          },
          {
            type: "reply",
            reply: {
              id: "next_job",
              title: "⏭ Next"
            }
          }
        ]
      }
    }
  };
}

module.exports = {
  buildHomeMessage,
  buildJobMessage
};
