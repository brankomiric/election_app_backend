const CronJob = require("cron").CronJob;

const atMidnightEverySunday = "0 0 * * 0";
const everyMinute = "* * * * *";
const everyFiveMinutes = "*/5 * * * *";
const everySecond = "* * * * * *";

const retryVotesJob = new CronJob(
  everyFiveMinutes,
  function () {
    require("../scripts/retryVote");
  },
  null,
  true
);

retryVotesJob.start();

process.once("SIGTERM", (sig) => {
  stopJobsAndExit();
});

process.once("SIGINT", (sig) => {
  stopJobsAndExit();
});

const stopJobsAndExit = () => {
  retryVotesJob.stop();
  console.log("Stopping retryVotesJob...");
  process.exit(0);
};
